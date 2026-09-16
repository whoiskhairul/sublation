from datetime import datetime
from django.conf import settings
from django.contrib.auth import get_user_model # to Get user
from django.utils import timezone

from rest_framework.decorators import api_view, permission_classes,parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework import generics
from rest_framework import status
from django.core.validators import validate_email
from django.core.exceptions import ValidationError



import openai
import json
import base64
import io

from PIL import Image
from rest_framework.parsers import MultiPartParser

from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os

import re
from appointment_chatbot.models import PersonaInstruction # To set instruction for the OpenAI api
from bpmn.models import BPMNDiagram, BPMNConversation, BPMNTemplate, DiagramShare, Folder, Message,DiagramVersion # to getthe model of the BPMN diagram
from bpmn.serializers import BpmnDiagramSelializer, BpmnTemplateSerializer, DiagramShareSerializer, FolderSerializer, MessageSerializer,DiagramVersionSerializer # to serialize the BPMN diagram

from bpmn.utils import check_user_access, save_bpmn, write_bpmn_file, save_imported_diagram, bpmn_xml_to_svg
from scripts.encryption import encrypt_data, decrypt_data


User = get_user_model()


def get_ai_client():
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set. Please set GEMINI_API_KEY in your .env file.")
    return openai.OpenAI(
        api_key=api_key,
        base_url=settings.GEMINI_BASE_URL
    )

AI_MODEL = settings.GEMINI_MODEL

@api_view(['GET'])
def bpmn_get(request):
    """
    Handle GET request:
    2. Initializes a conversation with BPMNGenerator's system instruction.
    3. Returns the current BPMN diagram content.
    """
    # Ensure session exists
    if not request.session.exists(request.session.session_key):
        request.session.create() 

    # Prepare conversation with the BPMN persona instruction
    conversation = []
    try:
        instruction = PersonaInstruction.objects.get(persona="BPMNGenerator").instruction
    except PersonaInstruction.DoesNotExist:
        instruction = "You are a bpmn 2.0 generator. You are given a conversation with a user and a system. You are to generate a BPMN diagram based on the conversation."
    conversation.append({"role": "system", "content": instruction})
    request.session['conversation'] = conversation
    
    # Debug prints
    # print(conversation)
    print(len(request.session.get("conversation", [])))

    # Read and return existing BPMN file
    try:
        with open('static/testfile.bpmn', 'r') as file:
            diagram = file.read()
        return Response({"XMLdiagram": diagram}, status=status.HTTP_200_OK)
    except FileNotFoundError:
        return Response({"error": "BPMN file not found."}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def bpmn_chatbot(request):
    """
    Handle POST request:
    1. Extract user message,analyze it, and generate a BPMN diagram or reply.
    """
    try:
        # Parse incoming user message from browser
        user_message = request.data.get("message", "")
        encrypted_id = request.data.get("encrypted_id", "")

        # Base system instruction
        try:
            instruction = PersonaInstruction.objects.get(persona="BPMNGenerator").instruction
        except Exception:
            instruction = "You are a bpmn 2.0 generator. You are given a conversation with a user and a system. You are to generate a BPMN diagram based on the conversation."

        conversation = [{"role": "system", "content": instruction}]

        # If diagram exists, restore past messages from database for seamless context
        c = None
        if encrypted_id:
            try:
                diagram = BPMNDiagram.objects.get(encrypted_id=encrypted_id)
                c, _ = BPMNConversation.objects.get_or_create(bpmn=diagram)
                past_messages = Message.objects.filter(conversation=c).order_by('id')
                for m in past_messages:
                    role = "assistant" if m.message_type == 'bot' else "user"
                    conversation.append({"role": role, "content": m.content})
            except Exception as e:
                print("Warning: Could not fetch past messages:", e)

        # Append current user prompt
        conversation.append({"role": "user", "content": user_message})

        # Send conversation to Gemini via OpenAI SDK
        client = get_ai_client()
        response = client.chat.completions.create(
            model=AI_MODEL,
            messages=conversation
        )
        bot_message = response.choices[0].message.content or ""

        # Saving the user message and the bot message to the database
        c = None
        if encrypted_id:
            try:
                diagram = BPMNDiagram.objects.get(encrypted_id=encrypted_id)
                c, _ = BPMNConversation.objects.get_or_create(bpmn=diagram)
                Message.objects.create(conversation=c, message_type='user', content=user_message)
                Message.objects.create(conversation=c, message_type='bot', content=bot_message)
            except Exception as e:
                print("Warning: Could not save message to database:", e)

        # Check if response contains BPMN XML in triple-backticks
        if '```xml' in bot_message:
            # Extract BPMN XML snippet
            bot_message = bot_message.split('```xml')[1].split('```')[0]

            # Add the BPMN snippet to the conversation for the api client
            conversation.append({"role": "assistant", "content": bot_message})
            request.session['conversation'] = conversation

            # save the bpmn xml and svg thumbnail to the database
            if encrypted_id:
                try:
                    generated_svg = bpmn_xml_to_svg(bot_message)
                    BPMNDiagram.objects.filter(encrypted_id=encrypted_id).update(
                        bpmn_xml=bot_message,
                        bpmn_svg=generated_svg if generated_svg else ''
                    )
                except Exception as e:
                    print("Warning: Could not update diagram SVG:", e)
                    BPMNDiagram.objects.filter(encrypted_id=encrypted_id).update(bpmn_xml=bot_message)

            #save the text as bot msg to the server
            success_response = "The BPMN has been successfully generated."
            if c:
                try:
                    Message.objects.create(conversation=c, message_type='bot', content=success_response)
                except Exception as e:
                    print("Warning: Could not save bot confirmation:", e)

            # Return the newly written diagram
            return Response(
                {
                    "reply": success_response,
                    "XMLdiagram": bot_message
                },
                status=status.HTTP_200_OK
            )
        else:
            # Add the text-based response
            conversation.append({"role": "assistant", "content": bot_message})
            request.session['conversation'] = conversation

            return Response({"reply": bot_message}, status=status.HTTP_200_OK)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response(
            {"reply": f"Sorry, error communicating with AI: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_bpmn_diagram(request):
    try:
        if request.data.get('templateXml') :
            template_xml =  request.data.get('templateXml', '')
            template_svg = request.data.get('templateSvg', '')
            template_name = request.data.get('templateName', 'Template Process')
            save_bpmn(request.user, template_xml, template_svg, name=template_name)
        elif request.data.get('encrypted_folder_id'):
            encrypted_folder_id = request.data.get('encrypted_folder_id', '')
            folder = Folder.objects.get(encrypted_folder_id=encrypted_folder_id)
            print('folder:', folder)
            save_bpmn(request.user, folder=folder)
        else:
            save_bpmn(request.user)

        latest_diagram = BPMNDiagram.objects.filter(user = request.user).latest('created_at')
        encrypted_id = latest_diagram.encrypted_id
        encrypted_id = latest_diagram.encrypted_id
        print(encrypted_id)
        
        encrypted_id = latest_diagram.encrypted_id        
        print(encrypted_id)
        

    except BPMNDiagram.DoesNotExist:
        print("BPMNDiagram does not exist")
        encrypted_id = encrypt_data(str(1))

    return Response({"encrypted_id": encrypted_id})
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_diagram(request):
    try:
        my_diagrams_qs = BPMNDiagram.objects.filter(user = request.user).order_by('-updated_at')
        my_diagrams_qs = my_diagrams_qs.exclude(folder__isnull=False)

        # Self-healing: Ensure any diagram with missing or empty 0x0 SVG gets a valid SVG rendered
        for diag in my_diagrams_qs:
            if not diag.bpmn_svg or diag.bpmn_svg.strip() == "" or 'width="0"' in diag.bpmn_svg:
                try:
                    healed_svg = bpmn_xml_to_svg(diag.bpmn_xml) if diag.bpmn_xml else ''
                    if healed_svg:
                        diag.bpmn_svg = healed_svg
                        diag.save(update_fields=['bpmn_svg'])
                except Exception as ex:
                    print(f"Failed to heal diagram {diag.id} SVG:", ex)

        my_diagrams_serializer = BpmnDiagramSelializer(my_diagrams_qs, many=True)
        my_diagrams = my_diagrams_serializer.data

        shared_diagrams = DiagramShare.objects.filter(user = request.user) #.order_by('-shared_at')
        bpmn_ids = shared_diagrams.values_list('diagram', flat=True)
        shared_diagrams_qs = BPMNDiagram.objects.filter(id__in=bpmn_ids)
        for diag in shared_diagrams_qs:
            if not diag.bpmn_svg or diag.bpmn_svg.strip() == "" or 'width="0"' in diag.bpmn_svg:
                try:
                    healed_svg = bpmn_xml_to_svg(diag.bpmn_xml) if diag.bpmn_xml else ''
                    if healed_svg:
                        diag.bpmn_svg = healed_svg
                        diag.save(update_fields=['bpmn_svg'])
                except Exception as ex:
                    print(f"Failed to heal shared diagram {diag.id} SVG:", ex)

        shared_with_me_serializer = BpmnDiagramSelializer(shared_diagrams_qs, many=True)
        shared_with_me_diagrams = shared_with_me_serializer.data
        return Response({"diagrams": my_diagrams, "sharedWithMe": shared_with_me_diagrams})
    except Exception as e:
        print("Error:", e)
        return Response(
            {"reply": "Sorry, I am not able to get the BPMN at the moment."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_xml(request, encrypted_id):
    # Ensure session exists
    if not request.session.exists(request.session.session_key):
        request.session.create() 

    # Prepare conversation with the BPMN persona instruction
    conversation = []
    try:
        instruction = PersonaInstruction.objects.get(persona="BPMNGenerator").instruction
    except PersonaInstruction.DoesNotExist:
        instruction = "You are a bpmn 2.0 generator. You are given a conversation with a user and a system. You are to generate a BPMN diagram based on the conversation."
    conversation.append({"role": "system", "content": instruction})
    request.session['conversation'] = conversation
    # print('conversation:get_xml: ',len(request.session['conversation']))
    try:
        diagram_object, permission = check_user_access(request, encrypted_id)
        print("diagram: ", diagram_object)
        print("permission: ", permission)
        # diagram_object = BPMNDiagram.objects.get(encrypted_id = encrypted_id)

        if permission == 'editor' or permission == 'viewer' or permission == 'commenter':
            #send XML diagram data to the API client
            try:
                diagram_xml = diagram_object.bpmn_xml
                diagram_name = diagram_object.name
                conversation.append({"role": "assistant", "content": diagram_xml})
                request.session['conversation'] = conversation
            except Exception as e:
                print("Error:", e)

            #send conversation history to the browser
            try:
                bpmn_conversation = BPMNConversation.objects.get(bpmn = diagram_object)
                messages = Message.objects.filter(conversation = bpmn_conversation).order_by('timestamp').exclude(content__icontains= '```xml')
                serializer = MessageSerializer(messages, many=True)
                serialized_messages = serializer.data
            except Exception as e:
                serialized_messages = ''
                print("Error:", e)
        elif permission == 'restricted':
            diagram_xml = ''
            diagram_name = ''
            serialized_messages = ''

        return Response({
            "XMLdiagram": diagram_xml,
            'diagramName':diagram_name,
            'messages': serialized_messages,
            'permissions': permission,
            })
    except Exception as e:
        print("Error s:", e)
        return Response(
            {"reply": "Sorry, I am not able to get the BPMN at the moment."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_conversations(request, encrypted_id):
    try:
        print("Deleting conversation")
        diagram_object = BPMNDiagram.objects.get(encrypted_id = encrypted_id)
        print(diagram_object.user, request.user)
        if diagram_object.user != request.user:
            return Response(
            {"reply": "Warning  unauthorized user's BPMN diagram."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        bpmn_conversation = BPMNConversation.objects.get(bpmn = diagram_object)
        Message.objects.filter(conversation = bpmn_conversation).delete()
        return Response(
            {"reply": "The BPMN has been successfully deleted."},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        print("Error:", e)
        return Response(
            {"reply": "Sorry, I am not able to delete the BPMN at the moment."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_diagram(request, encrypted_id):
    try:
        print("Deleting diagram {}")
        print("encrypted_id: ", encrypted_id)
        diagram_object = BPMNDiagram.objects.get(encrypted_id = encrypted_id)
        print(diagram_object.user, request.user)
        if diagram_object.user != request.user:
            return Response(
            {"reply": "Only Owner can delete the diagram!"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        

        diagram_object.delete()
        return Response(
            {"reply": "The Diagram has been successfully deleted."},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        print("Error:", e)
        return Response(
            {"reply": "Sorry, I am not able to delete the BPMN at the moment."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    

@api_view(['put', 'delete'])
@permission_classes([IsAuthenticated])
def diagram_share(request, encrypted_id):
    if request.method == 'DELETE':
        try:
            bpmn_diagram = BPMNDiagram.objects.get(encrypted_id=encrypted_id)
            email = json.loads(request.body.decode("utf-8")).get('email', '')
            if email:
                user = User.objects.get(email=email)
                share = DiagramShare.objects.get(diagram=bpmn_diagram, user=user)
                share.delete()
                return Response({"reply": "User removed from share list", "severity": "success"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"reply": "User not found", "severity": "error"}, status=status.HTTP_404_NOT_FOUND)
        except DiagramShare.DoesNotExist:
            return Response({"reply": "Share not found", "severity": "error"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"reply": str(e), "severity": "error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    if request.method == 'PUT':
        inviteInput = json.loads(request.body.decode("utf-8")).get('inviteInput', '')
        permittedEmail = json.loads(request.body.decode("utf-8")).get('permittedEmail', '')
        permittedEmailPermission = json.loads(request.body.decode("utf-8")).get('permittedEmailPermission', '')
        accessType = json.loads(request.body.decode("utf-8")).get('accessType', '')

        bpmn_diagram = BPMNDiagram.objects.get(encrypted_id=encrypted_id)
        diagram_object, permission = check_user_access(request, encrypted_id)

        msg = ""
        severity = "info"
        if permission == 'editor'  or permission == 'commenter':
            try:
                
                if inviteInput:
                    try:
                        validate_email(inviteInput)
                        try:
                            user = User.objects.get(email=inviteInput)
                            if not DiagramShare.objects.filter(diagram=bpmn_diagram, user=user).exists():
                                if not bpmn_diagram.user.email == inviteInput.strip():
                                    DiagramShare.objects.create(diagram=bpmn_diagram, user=user, permission='viewer')
                                    msg = "User added to share list"
                                    severity = "success"
                                else:
                                    msg = "You can't share with yourself"
                                    severity = "info"
                            else:
                                msg = "User already in share list"
                                severity = "error"
                        except User.DoesNotExist:
                            msg = "User with this email not found in system"
                            severity = "error"
                    except ValidationError:
                        msg = "Invalid email format"
                        severity = "error"
                
                elif permittedEmail:
                    share_obj = DiagramShare.objects.filter(diagram=bpmn_diagram, user__email=permittedEmail).first()
                    if share_obj:
                        share_obj.permission = permittedEmailPermission.strip()
                        share_obj.save()
                        msg = "Permission updated successfully"
                        severity = "success"

                if accessType:
                    bpmn_diagram.privacy = accessType
                    bpmn_diagram.save()
                    msg = "Access permission updated successfully"
                    severity = "success"

            except Exception as e:
                print("Error:", e)
                msg = "Error occurred while sharing the diagram"
                severity = "error"

        else:
            msg = "You have access to view the diagram only."

        try:
            # bpmn_diagram = BPMNDiagram.objects.get(encrypted_id=encrypted_id)
            shared_with = DiagramShare.objects.filter(diagram=bpmn_diagram).order_by('shared_at')
            serializer = DiagramShareSerializer(shared_with, many=True)
            serialized_shared_with = serializer.data
            owner_data = ''
            owner_data = {"name": bpmn_diagram.user.username, "permission": "Owner"}
            diagram_privacy = bpmn_diagram.privacy

            return Response(
                {
                    'owner': owner_data,
                    'sharedWith': serialized_shared_with,
                    'reply': msg,
                    'DiagramPrivacy': diagram_privacy,
                    'severity': severity
                    },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            print("Error:", e)
            return Response(
                {"reply": "Sorry, I am not able to share the BPMN at the moment."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class BPMNDiagramUpdateView(generics.UpdateAPIView):
    queryset = BPMNDiagram.objects.all()
    serializer_class = BpmnDiagramSelializer
    lookup_field = 'encrypted_id'

    def update(self, request, *args, **kwargs):
        # Get the BPMNDiagram instance based on the provided ID (pk)
        instance = self.get_object()
        diagram_object, permission = check_user_access(request, instance.encrypted_id)
        print("permission: ", permission)
        print('diagram_object: ', diagram_object)



        if permission == 'editor':
            # Use partial=True to allow partial updates
            serializer = self.get_serializer(instance, data=request.data, partial=True)
        else:
            return Response(
                {'reply':"Unauthorized to edit this Diagram."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            

        
        # Validate the data
        if serializer.is_valid():
            # Save the updated instance
            serializer.save()
            if 'name' in request.data:
                reply = 'Diagram renamed Successfully.'
            else:
                reply = 'Diagram updated Successfully.'
            return Response({'reply': reply}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


DEFAULT_IMGTOBPMN_INSTRUCTION = """You are an expert BPMN 2.0 diagram engineer and business process analyst.
Analyze the provided image carefully. The image contains a business process diagram, flowchart, sketch, or whiteboard drawing.

Convert the diagram in the image into a complete, valid, and well-formed BPMN 2.0 XML document that can be directly imported and displayed in bpmn.io.

CRITICAL REQUIREMENTS:
1. Standard BPMN 2.0 namespaces:
   - xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
   - xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
   - xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
   - xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
2. Root element: <definitions id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
3. Process definition: <process id="Process_1" isExecutable="true">
4. Extract all visual elements from the image:
   - Start Events: <startEvent id="..." name="..." />
   - Tasks: <task id="..." name="..." />
   - Gateways: <exclusiveGateway id="..." name="..." /> or <parallelGateway id="..." name="..." />
   - End Events: <endEvent id="..." name="..." />
   - Sequence Flows: <sequenceFlow id="..." sourceRef="..." targetRef="..." />
5. MUST INCLUDE COMPLETE BPMNDiagram & BPMNPlane:
   - <bpmndi:BPMNDiagram id="BPMNDiagram_1">
   - <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
   - Every single shape must have a corresponding <bpmndi:BPMNShape bpmnElement="..."> with valid <dc:Bounds x="..." y="..." width="..." height="..." /> coordinates reflecting its spatial layout in the image.
   - Every sequence flow must have a <bpmndi:BPMNEdge bpmnElement="..."> with matching <di:waypoint x="..." y="..." /> coordinates connecting source and target shapes.
6. OUTPUT FORMAT: Return ONLY the XML code enclosed within ```xml and ``` markdown code fences. Do NOT include conversational filler, preamble, or commentary."""


@api_view(['POST'])
@parser_classes([MultiPartParser])
def image_to_bpmn_view(request):
    uploaded_file = request.FILES.get('image')

    if not uploaded_file:
        return Response({"error": "No file uploaded."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Step 1: Open and Process the Image with Pillow
        try:
            image = Image.open(uploaded_file)
        except Exception as e:
            return Response({"error": f"An error occurred while opening the image: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        # Handle RGBA/palette modes for clean PNG output
        if image.mode in ('RGBA', 'LA', 'P'):
            rgb_image = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            rgb_image.paste(image, mask=image.split()[-1] if image.mode in ('RGBA', 'LA') else None)
            image = rgb_image
        elif image.mode != 'RGB':
            image = image.convert('RGB')

        # Limit max dimensions to maintain visual fidelity without hitting payload limits
        MAX_DIM = 1600
        w, h = image.size
        if w > MAX_DIM or h > MAX_DIM:
            image.thumbnail((MAX_DIM, MAX_DIM), Image.Resampling.LANCZOS)

        # Save the image to an in-memory buffer as high-quality JPEG
        buffer = io.BytesIO()
        image.save(buffer, format="JPEG", quality=85)
        buffer.seek(0)

        # Step 2: Convert Image to Base64 String
        image_base64 = base64.b64encode(buffer.read()).decode('utf-8')

        # Step 3: Fetch or initialize persona instruction
        instruction = DEFAULT_IMGTOBPMN_INSTRUCTION
        try:
            p_obj = PersonaInstruction.objects.filter(persona="IMGTOBPMN").first()
            if p_obj and p_obj.instruction and p_obj.instruction.strip():
                instruction = p_obj.instruction
            elif p_obj:
                p_obj.instruction = DEFAULT_IMGTOBPMN_INSTRUCTION
                p_obj.save()
            else:
                PersonaInstruction.objects.create(persona="IMGTOBPMN", instruction=DEFAULT_IMGTOBPMN_INSTRUCTION)
        except Exception as err:
            print("Warning: could not read PersonaInstruction:", err)

        # Step 4: Send Image Data to AI model
        print("Sending image data to Vision AI...")
        client = get_ai_client()
        response = client.chat.completions.create(
            model=AI_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": instruction,
                        },
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"},
                        },
                    ],
                }
            ],
            temperature=0.2,
        )

        content = response.choices[0].message.content or ""
        print("Vision AI Response Length:", len(content))

        # Step 5: Extract and validate BPMN XML
        bpmn_xml = process_openai_response(content)

        # Step 6: Generate SVG vector preview
        bpmn_svg = bpmn_xml_to_svg(bpmn_xml)

        # Step 7: Persist diagram for user
        user = request.user if request.user and request.user.is_authenticated else None
        if user:
            saved_diagram = save_imported_diagram(user, bpmn_xml, bpmn_svg)
            encrypted_id = saved_diagram.encrypted_id
        else:
            first_user = User.objects.first()
            saved_diagram = save_imported_diagram(first_user, bpmn_xml, bpmn_svg)
            encrypted_id = saved_diagram.encrypted_id

        return Response({"bpmn_xml": bpmn_xml, "encrypted_id": encrypted_id}, status=status.HTTP_200_OK)

    except Exception as e:
        print("Error in image_to_bpmn_view:", e)
        return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def process_openai_response(response_text):
    """
    Robustly extracts BPMN XML from model response using multiple parsing strategies.
    Falls back to standard template if no XML can be recovered.
    """
    if not response_text:
        return _get_fallback_bpmn_xml()

    text = response_text.strip()

    # Strategy 1: Fenced code block with ```xml ... ```
    xml_match = re.search(r'```(?:xml|bpmn)?\s*([\s\S]*?)\s*```', text, re.IGNORECASE)
    if xml_match:
        candidate = xml_match.group(1).strip()
        if '<definitions' in candidate or '<bpmn:definitions' in candidate:
            write_bpmn_file(candidate)
            return candidate

    # Strategy 2: Direct XML substring from <definitions to </definitions>
    start_tag = re.search(r'<(?:bpmn:)?definitions\b', text, re.IGNORECASE)
    end_tag = re.search(r'</(?:bpmn:)?definitions>', text, re.IGNORECASE)
    if start_tag and end_tag and end_tag.end() > start_tag.start():
        candidate = text[start_tag.start():end_tag.end()].strip()
        write_bpmn_file(candidate)
        return candidate

    # Strategy 3: Check if entire string is valid XML
    if text.startswith('<?xml') or '<definitions' in text:
        write_bpmn_file(text)
        return text

    # Fallback default
    fallback = _get_fallback_bpmn_xml()
    write_bpmn_file(fallback)
    return fallback


def _get_fallback_bpmn_xml():
    return """<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="Process Initiated" />
    <bpmn:task id="Task_1" name="Analyze Diagram Requirements" />
    <bpmn:endEvent id="EndEvent_1" name="Process Complete" />
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_1" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="EndEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="170" y="162" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_1_di" bpmnElement="Task_1">
        <dc:Bounds x="260" y="140" width="160" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="480" y="162" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="206" y="180" /><di:waypoint x="260" y="180" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <di:waypoint x="420" y="180" /><di:waypoint x="480" y="180" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>"""


@api_view(['POST'])
def save_diagram_version(request):
    encrypted_id = request.data.get('diagram_id')
    new_bpmn_xml = request.data.get('bpmn_xml')
    svg = request.data.get('svg')
    version_name = request.data.get('version_name')

    print("Encrypted ID:", encrypted_id)
    diagram  = BPMNDiagram.objects.get(encrypted_id=encrypted_id)

    diagram_id = diagram.id

    latest_version = DiagramVersion.objects.filter(diagram_id=diagram_id).order_by('version_number').last()
    new_version_number = (latest_version.version_number if latest_version else 0) + 1

    print("New version number:", new_version_number)


    DiagramVersion.objects.create(
        diagram_id=diagram_id,
        version_number=new_version_number,
        version_name=version_name,
        bpmn_xml=new_bpmn_xml
    )

    #update diagram also
    BPMNDiagram.objects.filter(encrypted_id=encrypted_id).update(bpmn_xml=new_bpmn_xml,bpmn_svg=svg)



    return Response({"reply": "Version saved successfully"}, status=status.HTTP_200_OK)


@api_view(['POST'])
def restore_diagram_version(request):
   try:
     version_id = request.data.get('version_id')
     encrypted_id = request.data.get('encrypted_id')

     version = DiagramVersion.objects.get(id=version_id)
     diagram = BPMNDiagram.objects.get(encrypted_id=encrypted_id)
     diagram.bpmn_xml = version.bpmn_xml
     try:
         diagram.bpmn_svg = bpmn_xml_to_svg(version.bpmn_xml)
     except Exception as svg_err:
         print("Could not update SVG on restore:", svg_err)
     diagram.save()

     return Response({"reply": "Version restored successfully"}, status=status.HTTP_200_OK)
   except Exception as e:
     return Response({"reply": "Error in restoring version"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_versions(request, encrypted_id):

    print("get_versionsEncrypted ID:", encrypted_id)
    diagram_id  = BPMNDiagram.objects.get(encrypted_id=encrypted_id).id


    print("get_versionsDiagram ID:", diagram_id)

    versions = DiagramVersion.objects.filter(diagram_id=diagram_id).order_by('-version_number')
    print("get_versionsVersions:", versions)

    version_serializer = DiagramVersionSerializer(versions, many=True)
    versions = version_serializer.data

    return Response({"versions": versions}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def templates(request):
    try:
        # If no templates exist, auto-seed the default industry templates
        if BPMNTemplate.objects.count() == 0:
            try:
                from bpmn.default_templates import TEMPLATES
                for t in TEMPLATES:
                    svg = bpmn_xml_to_svg(t['xml'])
                    BPMNTemplate.objects.create(
                        name=t['name'],
                        description=f"<p>{t['description']}</p>",
                        bpmn_xml=t['xml'],
                        bpmn_svg=svg
                    )
            except Exception as seed_err:
                print("Warning: Failed to auto-seed BPMN templates:", seed_err)

        bpmn_templates = BPMNTemplate.objects.all().order_by('id')
        serializer = BpmnTemplateSerializer(bpmn_templates, many=True)
        serialized_templates = serializer.data
        return Response({"templates": serialized_templates})
    except Exception as e:
        print("Error:", e)
        return Response(
            {"reply": "Sorry, I am not able to get the BPMN templates at the moment."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_folder(request):
    try:
        data = json.loads(request.body)
        folder_name = data.get('name', '').strip()

        # Validate folder name
        if not folder_name:
            return Response({
                "success": False,
                "reply": "Folder name is required."
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check if folder with same name exists
        if Folder.objects.filter(name=folder_name, user=request.user).exists():
            return Response({
                "success": False,
                "reply": "A folder with this name already exists."
            }, status=status.HTTP_400_BAD_REQUEST)

        # Create the folder
        folder = Folder.objects.create(
            name=folder_name,
            user=request.user
        )

        return Response({
            "success": True,
            "reply": "Folder created successfully.",
            "folder": {
                "id": folder.id,
                "name": folder.name,
                'encrypted_folder_id': folder.encrypted_folder_id,
                "created_at": folder.created_at.isoformat()
            }
        }, status=status.HTTP_201_CREATED)

    except json.JSONDecodeError:
        return Response({
            "success": False,
            "reply": "Invalid JSON data."
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            "success": False,
            "reply": f"An error occurred:"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_folders(request):
    if request.method == "GET":
        try:
            folders = Folder.objects.filter(user=request.user)
            serialized_folders = FolderSerializer(folders, many=True).data

            return Response({
                "success": True,
                "folders": serialized_folders
            }, status=200)

        except Exception as e:
            return Response({
                "success": False,
                "reply": str(e)
            }, status=500)
        

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_folder_diagrams(request, encrypted_folder_id):
    if request.method == "GET":
        try:
            folder = Folder.objects.get(encrypted_folder_id=encrypted_folder_id)
            diagrams = folder.diagrams.all()
            serialized_diagrams = BpmnDiagramSelializer(diagrams, many=True).data

            return Response({
                "success": True,
                "diagrams": serialized_diagrams,
                "folderName": folder.name,
            }, status=200)

        except Folder.DoesNotExist:
            return Response({
                "success": False,
                "reply": "Folder not found."
            }, status=404)

        except Exception as e:
            print("Error:", e)
            return Response({
                "success": False,
                "reply": str(e)
            }, status=500)
        
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def move_to_folder(request):
    try:
        data = json.loads(request.body)
        encrypted_id = data.get('encrypted_id', '')
        encrypted_folder_id = data.get('encrypted_folder_id', '')
        print("Encrypted ID:", encrypted_id)
        print("Encrypted Folder ID:", encrypted_folder_id)

        if not encrypted_id:
            return Response({
                "success": False,
                "reply": "Diagram ID is required."
            }, status=status.HTTP_400_BAD_REQUEST)

        if not encrypted_folder_id:
            return Response({
                "success": False,
                "reply": "Folder ID is required."
            }, status=status.HTTP_400_BAD_REQUEST)
        if encrypted_folder_id == 'Homepage':
            diagram = BPMNDiagram.objects.get(encrypted_id=encrypted_id)
            diagram.folder = None
            diagram.save()
            reply = "Diagram moved to Homepage successfully."
        else:
            diagram = BPMNDiagram.objects.get(encrypted_id=encrypted_id)
            folder = Folder.objects.get(encrypted_folder_id=encrypted_folder_id)

            diagram.folder = folder
            diagram.save()
            reply = f"Diagram moved to folder {folder.name} successfully."

        return Response({
            "success": True,
            "reply": reply,
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print("Error:", e)
        return Response({
            "success": False,
            "reply": f"An error occurred: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_folder(request, encrypted_folder_id):
    try:
        folder = Folder.objects.get(encrypted_folder_id=encrypted_folder_id, user=request.user)
        folder.delete()
        return Response({
            "success": True,
            "reply": "Folder deleted successfully."
        }, status=status.HTTP_200_OK)
    except Folder.DoesNotExist:
        return Response({
            "success": False,
            "reply": "Folder not found."
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            "success": False,
            "reply": f"An error occurred: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

@api_view(['POST'])
def generate_bpmn_documentation(request):
    """
    Handle POST request:
    1. Fetch BPMN XML from the database.
    2. Send a request to OpenAI to generate structured documentation.
    3. Return the generated documentation.
    """
    #print(request)
    try:
        # Extract BPMN diagram ID from the request
        encrypted_id = request.data.get("encrypted_id", "")
        print("Encrypted ID:", encrypted_id)

        # Fetch BPMN XML from the database
        try:
            diagram = BPMNDiagram.objects.get(encrypted_id=encrypted_id)
            bpmn_xml = diagram.bpmn_xml
            #print("BPMN XML:", bpmn_xml)
        except BPMNDiagram.DoesNotExist:
            return Response({"error": "BPMN diagram not found."}, status=status.HTTP_404_NOT_FOUND)

        # Define prompt for OpenAI to generate documentation
        prompt = f"""
        Generate a well-structured, detailed documentation for the following BPMN diagram.
        Ensure the response follows this format:
        1. Overview: A brief description of the workflow.
        2. Workflow Steps: Explain each step in order.
        3. Key Roles & Responsibilities: Identify key participants.
        4. Rules & Considerations: Important conditions or logic.
        do not use star mark, use plain formal text
        
        BPMN XML:
        {bpmn_xml}
        """

        # Send request to Gemini
        client = get_ai_client()
        response = client.chat.completions.create(
            model=AI_MODEL,
            messages=[
                {"role": "system", "content": "You are an expert BPMN documentation generator."},
                {"role": "user", "content": prompt}
            ]
        )

        bot_message = response.choices[0].message.content
        #print(bot_message)

        return Response({"reply": bot_message}, status=status.HTTP_200_OK)

    except Exception as e:
        print("Error:", e)
        return Response(
            {"error": "Failed to generate documentation. Please try again."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def optimize(request, encrypted_id):
    try:
        diagram = BPMNDiagram.objects.get(encrypted_id=encrypted_id)
        bpmn_xml = diagram.bpmn_xml
        if not bpmn_xml:
            return Response({"error": "No BPMN XML found for this diagram."}, status=status.HTTP_400_BAD_REQUEST)

        goal = request.data.get('goal', 'comprehensive')
        
        goal_instructions = {
            'parallel': "Focus primarily on parallelization: detect sequential tasks that have no dependencies and convert them into parallel branches using ParallelGateways to reduce total cycle time.",
            'simplify': "Focus primarily on simplification: eliminate redundant checks, merge consecutive tasks of the same nature, remove unnecessary gateways, and streamline the workflow.",
            'resilience': "Focus on error-resilience: ensure all boundary errors, alternative paths, and compensation end-events are properly modeled to prevent dead-ends.",
            'comprehensive': "Optimize the workflow for overall efficiency, parallelism, and readability while strictly preserving business logic and ensuring OMG BPMN 2.0 compliance."
        }

        specific_goal = goal_instructions.get(goal, goal_instructions['comprehensive'])

        system_instruction = f"""You are an expert BPMN 2.0 process optimization architect.
Your goal: {specific_goal}

Rules:
1. Always preserve core business objectives and valid BPMN 2.0 XML schema.
2. Ensure every task and gateway has meaningful names, incoming and outgoing sequence flows, a startEvent, and endEvent.
3. First provide a clear, bulleted summary of optimizations and estimated performance gains inside ```msg ... ```.
4. Then output the complete, valid optimized BPMN 2.0 XML inside ```xml ... ```."""

        prompt = f"Optimize the following BPMN process diagram:\n\n{bpmn_xml}"
        
        client = get_ai_client()
        response = client.chat.completions.create(
            model=AI_MODEL,
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )
        bot_msg = response.choices[0].message.content or ""
        # Robust BPMN XML extraction using tested multi-strategy parser
        xml_data = process_openai_response(bot_msg)

        msg_match = re.search(r'```(?:msg|text)?\s*([\s\S]*?)```', bot_msg)
        if msg_match:
            msg = msg_match.group(1).strip()
        else:
            # Extract text preceding the XML block
            msg = bot_msg.split('```')[0].strip() if '```' in bot_msg else "Optimization completed successfully."

        # Also persist the optimized XML to the diagram in DB so changes aren't lost on refresh
        try:
            new_svg = bpmn_xml_to_svg(xml_data)
            BPMNDiagram.objects.filter(encrypted_id=encrypted_id).update(
                bpmn_xml=xml_data,
                bpmn_svg=new_svg if new_svg else diagram.bpmn_svg
            )
        except Exception as update_err:
            print("Warning: Could not auto-save optimized diagram to DB:", update_err)

        return Response({
            "xml_data": xml_data,
            "msg": msg,
            "goal": goal
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print("Optimization Error:", e)
        return Response(
            {"error": f"Failed to optimize BPMN: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
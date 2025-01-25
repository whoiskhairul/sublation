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

from appointment_chatbot.models import PersonaInstruction # To set instruction for the OpenAI api
from bpmn.models import BPMNDiagram, BPMNConversation, BPMNTemplate, DiagramShare, Message,DiagramVersion # to getthe model of the BPMN diagram
from bpmn.serializers import BpmnDiagramSelializer, BpmnTemplateSerializer, DiagramShareSerializer, MessageSerializer,DiagramVersionSerializer # to serialize the BPMN diagram

from bpmn.utils import check_user_access, save_bpmn, write_bpmn_file,save_imported_diagram
from scripts.encryption import encrypt_data, decrypt_data

User = get_user_model()


openai.api_key = settings.OPENAI_API_KEY
client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

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
        # Retrieve conversation from session
        conversation = request.session.get("conversation", [])

        # Parse incoming user message from browser
        user_message = request.data.get("message", "")
        encrypted_id = request.data.get("encrypted_id", "")
        conversation.append({"role": "user", "content": user_message})
        request.session['conversation'] = conversation

        # Send conversation to OpenAI
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=conversation
        )
        bot_message = response.choices[0].message.content

        # Saving the user message and the bot message to the database
        try:
            diagram = BPMNDiagram.objects.get(encrypted_id=encrypted_id)
            c = BPMNConversation.objects.get(bpmn=diagram)
            Message.objects.create(conversation=c, message_type='user', content=user_message)
            Message.objects.create(conversation=c, message_type='bot', content=bot_message)
        except Exception as e:
            print("Error in saving msg to database:", e)

        # Check if response contains BPMN XML in triple-backticks
        if '```xml' in bot_message:
            # Extract BPMN XML snippet
            bot_message = bot_message.split('```xml')[1].split('```')[0]

            # Add the BPMN snippet to the conversation for the api client
            conversation.append({"role": "assistant", "content": bot_message})
            request.session['conversation'] = conversation

            # save the bpmn xml to the database
            BPMNDiagram.objects.filter(encrypted_id=encrypted_id).update(bpmn_xml=bot_message)

            #save the text as bot msg to the server
            success_response = "The BPMN has been successfully generated."
            Message.objects.create(conversation=c, message_type='bot', content=success_response)


            # Return the newly written diagram
            bpmn_xml = BPMNDiagram.objects.get(encrypted_id=encrypted_id).bpmn_xml

            return Response(
                {
                    "reply": success_response,
                    "XMLdiagram": bpmn_xml
                },
                status=status.HTTP_200_OK
            )
        else:
            # Add the text-based response
            conversation.append({"role": "assistant", "content": bot_message})
            request.session['conversation'] = conversation

            return Response({"reply": bot_message}, status=status.HTTP_200_OK)

    except Exception as e:
        print("Error:", e)
        return Response(
            {"reply": "Sorry, I am not able to generate the BPMN at the moment."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_bpmn_diagram(request):
    try:
        if request.data.get('templateXml') :
            print("Creating BPMN diagram with template")
            template_xml =  request.data.get('templateXml', '')
            template_svg = request.data.get('templateSvg', '')
            save_bpmn(request.user, template_xml, template_svg)
        else:
            print("Creating BPMN diagram without template")
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
        my_diagrams = BPMNDiagram.objects.filter(user = request.user).order_by('-updated_at')
        my_diagrams_serializer = BpmnDiagramSelializer(my_diagrams, many=True)
        my_diagrams = my_diagrams_serializer.data

        shared_diagrams = DiagramShare.objects.filter(user = request.user) #.order_by('-shared_at')
        bpmn_ids = shared_diagrams.values_list('diagram', flat=True)
        shared_diagrams = BPMNDiagram.objects.filter(id__in=bpmn_ids)
        shared_with_me_serializer = BpmnDiagramSelializer(shared_diagrams, many=True)
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


@api_view(['POST'])
@parser_classes([MultiPartParser])
def image_to_bpmn_view(request):


    uploaded_file = request.FILES.get('image')

    if not uploaded_file:
        return Response({"error": "No file uploaded."}, status=400)

    try:
        # Step 1: Open and Process the Image with Pillow
        try:
            image = Image.open(uploaded_file)
        except Exception as e:
            return Response({"error": f"An error occurred while opening the image: {str(e)}"}, status=500)
        print("Image format:", image.format)
        # Resize the image (if needed)
        image = image.resize((256, 256))

        print("Image size:", image.size)
        # Convert the image to grayscale (optional)
        image = image.convert("L")  # 'L' mode is grayscale

        print("Image mode:", image.mode)
        # Save the image to an in-memory buffer
        buffer = io.BytesIO()
        image.save(buffer, format="PNG")  # Save as PNG or JPEG
        buffer.seek(0)

        # Step 2: Convert Image to Base64 String
        image_base64 = base64.b64encode(buffer.read()).decode('utf-8')

        print("Image Base64:", image_base64[:50] + "...")
        # Step 3: Send Image Data to OpenAI API
        # Use OpenAI's GPT-4 or GPT models to process the image data
        prompt = f"Analyze the following image data (base64-encoded) and create a BPMN ready for import into bpmn.io."
        prompt2 = "Analyze the following image data (base64-encoded) and create prompt to create same BPMN. Note: 1.Start Event: Start Event. 2.Task 1: Task 1. 3.End Event: End Event. like this"
        SystemInstruction = '''You are a BPMN 2.0 expert who answers in a short but well detailed response. Given any user prompt about a business process, produce a valid, well-formed BPMN 2.0 XML diagram that can be imported into bpmn.io. Follow these requirements:\r\n\r\nBPMN and XML Structure:\r\n\r\nUse the BPMN 2.0 standard namespaces:\r\nxml\r\nCopy code\r\nxmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"\r\nxmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"\r\nxmlns:dc="http://www.omg.org/spec/DD/20100524/DC"\r\nxmlns:di="http://www.omg.org/spec/DD/20100524/DI"\r\nBegin with a <definitions> element (with targetNamespace).\r\nInclude at least one <process> element with id and isExecutable defined.\r\nProvide <bpmndi:BPMNDiagram> elements for diagram layout and ensure correct references to BPMN elements.\r\nCore BPMN Elements:\r\n\r\nUse Events (Start, Intermediate, End), Activities (Tasks, Sub-processes), and Gateways (Exclusive, Inclusive, Parallel, Event-Based, Complex) as needed.\r\nUse Sequence Flows, Message Flows (for communication between Pools), and Associations.\r\nUse Pools/Lanes to show participants and roles.\r\nUse Artifacts (Data Objects, Data Stores, Annotations) if needed.\r\nStandards and Validity:\r\n\r\nEnsure unique id for all elements.\r\nAvoid non-standard or deprecated BPMN elements.\r\nMaintain correct references between BPMN and DI elements.\r\nAdhere to BPMN 2.0 schema and well-formed XML rules.\r\nModeling Best Practices:\r\n\r\nStart with a high-level flow, then add detail.\r\nUse clear, action-oriented names for Tasks.\r\nKeep diagrams readable; if complex, use Sub-processes.\r\nShow clear start/end points and logical flows.\r\nUse Gateways and Pools/Lanes thoughtfully.\r\nAdd Annotations only if needed for clarity.\r\nUser Prompts and Details:\r\n\r\nInterpret the user’s request, identify participants, activities, triggers, and outcomes.\r\nInclude requested complexity (e.g., message flows, data objects) if it fits the scenario.\r\nProduce a complete BPMN XML model ready for import into bpmn.io.'''
        prompt3 = SystemInstruction+ f"\n Analyze the following image data (base64-encoded) {image_base64} and gererate a possible bpmn 2.0 valid xml"


        try:
           prompt = PersonaInstruction.objects.get(persona="IMGTOBPMN").instruction
        except Exception as e:
           print("Error:", e)



        try:
            print("Sending image data to OpenAI...")
            response = client.chat.completions.create(
                model="gpt-4o",

            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt,
                        },
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/png;base64,{image_base64}"},
                        },
                    ],
                }
            ],
            )
            print("OpenAI Response:", response)
            content= response.choices[0].message.content
            print("Content:", content)
            #
            # prompttocreatebpmn = "Create a BPMN diagram based on the following prompt: " + content
            # print("Prompt to create BPMN:", prompttocreatebpmn)
            # response = client.chat.completions.create(
            # model="gpt-4o",
            #     messages=[
            #         {
            #             "role": "user",
            #             "content": [
            #                 {
            #                     "type": "text",
            #                     "text": prompttocreatebpmn,
            #                 },
            #             ],
            #         }
            #     ],
            # )
            # print("OpenAI Response2:", response)
        except Exception as e:
            return Response({"error": f"An error occurred while processing the image: {str(e)}"}, status=500)


        # Extract the response
        bpmn_xml = process_openai_response(content)
        bpmn_svg  = """<?xml version="1.0" encoding="utf-8"?>
        <!-- created with bpmn-js / http://bpmn.io -->
        <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="0" height="0" viewBox="0 0 0 0" version="1.1"></svg>"""
        save_imported_diagram(request.user, bpmn_xml, bpmn_svg)
        latest_diagram = BPMNDiagram.objects.filter(user = request.user).latest('created_at')
        encrypted_id = latest_diagram.encrypted_id

    except Exception as e:
        return Response({"error": f"An error occurred: {str(e)}"}, status=500)

    return Response({"bpmn_xml": bpmn_xml, "encrypted_id": encrypted_id}, status=200)

def process_openai_response(response):

    bpmn_xml = """<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL">
        <bpmn:process id="Process_1" isExecutable="false">
            <bpmn:startEvent id="StartEvent_1" />
            <bpmn:task id="Task_1" name="Generated Task" />
            <bpmn:endEvent id="EndEvent_1" />
        </bpmn:process>
    </bpmn:definitions>"""

    bot_message = response.split('```xml')[1].split('```')[0]
    write_bpmn_file(bot_message)
    bpmn_xml = bot_message

    return bpmn_xml

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
     print("Version ID:", version_id)
     print("Encrypted ID:", encrypted_id)

     version= DiagramVersion.objects.get(id=version_id)
     print("Version:", version)
     diagram = BPMNDiagram.objects.get(encrypted_id=encrypted_id)
     print("Diagram:", diagram)
     diagram.bpmn_xml = version.bpmn_xml
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
        bpmn_templates = BPMNTemplate.objects.all()
        serializer = BpmnTemplateSerializer(bpmn_templates, many=True)
        serialized_templates = serializer.data
        print("Templates:", bpmn_templates)
        return Response({"templates": serialized_templates})
    except Exception as e:
        print("Error:", e)
        return Response(
            {"reply": "Sorry, I am not able to get the BPMN templates at the moment."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
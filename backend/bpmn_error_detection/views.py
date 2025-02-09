from django.http import JsonResponse
from rest_framework.decorators import api_view
import xml.etree.ElementTree as ET
from django.conf import settings

import uuid
import openai  

openai.api_key = settings.OPENAI_API_KEY
client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)


@api_view(['POST'])
def generate_bpmn_diagram(request):
    """
    Receives an XML file, processes it, and returns a BPMN diagram with an encrypted_id.
    """
    # Check if the file is provided
    file = request.FILES.get('file')
    if not file:
        return JsonResponse({'error': 'No file provided'}, status=400)

    try:
        # Read the uploaded file content
        xml_content = file.read()

        # Parse the XML to ensure it's valid
        try:
            ET.ElementTree(ET.fromstring(xml_content))
        except ET.ParseError as e:
            return JsonResponse({'error': f"Invalid XML format: {str(e)}"}, status=400)

        # Generate a unique encrypted ID for the BPMN diagram
        encrypted_id = str(uuid.uuid4())

        # Mocked response with the uploaded XML as the BPMN diagram
        # In a real-world case, you may process the XML into BPMN if necessary
        bpmn_diagram = xml_content.decode('utf-8')  # Assuming the file is UTF-8 encoded

        return JsonResponse({
            'encrypted_id': encrypted_id,
            'XMLdiagram': bpmn_diagram,
        }, status=200)

    except Exception as e:
        return JsonResponse({'error': f"Failed to process file: {str(e)}"}, status=500)


@api_view(['POST'])
def validate_bpmn(request):
    file = request.FILES.get('file')
    if not file:
        return JsonResponse({'errors': ['No file provided']}, status=400)

    errors = []
    try:
        xml_content = file.read()

        # Try parsing the XML
        try:
            tree = ET.ElementTree(ET.fromstring(xml_content))
            root = tree.getroot()
        except ET.ParseError as parse_error:
            errors.append({
                "elementId": None,
                "message": f"XML Parsing Error: {str(parse_error)}",
                "suggestion": "Ensure the BPMN XML file is well-formed and valid."
            })
            return JsonResponse({'errors': errors}, status=200)

        # Initialize containers for elements and flows
        elements = {}
        sequence_flows = {}

        # Collect all BPMN elements and sequence flows
        for elem in root.iter():
            tag_name = elem.tag.split("}")[-1]  # Get the tag name without namespace
            elem_id = elem.attrib.get('id', None)
            if not elem_id:
                continue

            if tag_name == "sequenceFlow":
                source_ref = elem.attrib.get('sourceRef', None)
                target_ref = elem.attrib.get('targetRef', None)
                sequence_flows[elem_id] = {"source": source_ref, "target": target_ref}
            else:
                elements[elem_id] = {"tag": tag_name, "name": elem.attrib.get('name', elem_id)}

        # Validation Rules
        # -----------------

        # 1. Missing Start Event
        if not any(e["tag"] == "startEvent" for e in elements.values()):
            errors.append({
                "elementId": None,
                "message": "Missing Start Event",
                "suggestion": "Add a Start Event to begin the process."
            })

        # 2. Missing End Event
        if not any(e["tag"] == "endEvent" for e in elements.values()):
            errors.append({
                "elementId": None,
                "message": "Missing End Event",
                "suggestion": "Add an End Event to properly terminate the process."
            })

        # 3. Unconnected Tasks (No incoming or outgoing sequence flows)
        for elem_id, elem in elements.items():
            if elem["tag"] in ["task", "exclusiveGateway", "parallelGateway"]:
                incoming = [flow_id for flow_id, flow in sequence_flows.items() if flow["target"] == elem_id]
                outgoing = [flow_id for flow_id, flow in sequence_flows.items() if flow["source"] == elem_id]
                if not incoming:
                    errors.append({
                        "elementId": elem_id,
                        "message": f"Element '{elem['name']}' ({elem['tag']}) is missing incoming flows.",
                        "suggestion": f"Add an incoming sequence flow to '{elem['name']}'."
                    })
                if not outgoing:
                    errors.append({
                        "elementId": elem_id,
                        "message": f"Element '{elem['name']}' ({elem['tag']}) is missing outgoing flows.",
                        "suggestion": f"Add an outgoing sequence flow from '{elem['name']}'."
                    })

        # 4. Orphaned Sequence Flows
        for flow_id, flow in sequence_flows.items():
            if flow["source"] not in elements:
                errors.append({
                    "elementId": flow_id,
                    "message": f"Sequence flow '{flow_id}' has an invalid source '{flow['source']}'.",
                    "suggestion": "Ensure the source element exists and is correctly connected."
                })
            if flow["target"] not in elements:
                errors.append({
                    "elementId": flow_id,
                    "message": f"Sequence flow '{flow_id}' has an invalid target '{flow['target']}'.",
                    "suggestion": "Ensure the target element exists and is correctly connected."
                })

        # 5. Isolated Elements (No connections at all)
        for elem_id, elem in elements.items():
            if elem["tag"] in ["task", "exclusiveGateway", "parallelGateway"]:
                incoming = [flow_id for flow_id, flow in sequence_flows.items() if flow["target"] == elem_id]
                outgoing = [flow_id for flow_id, flow in sequence_flows.items() if flow["source"] == elem_id]
                if not incoming and not outgoing:
                    errors.append({
                        "elementId": elem_id,
                        "message": f"Element '{elem['name']}' ({elem['tag']}) is completely isolated.",
                        "suggestion": f"Connect '{elem['name']}' to other elements using sequence flows."
                    })

        # 6. Invalid or Empty Diagram
        if not elements:
            errors.append({
                "elementId": None,
                "message": "The BPMN diagram is empty or invalid.",
                "suggestion": "Add BPMN elements to create a valid diagram."
            })
        
        # 7. Missing Name or Title for Tasks
        # for elem_id, elem in elements.items():
        #     if elem["tag"] == "task" and (not elem.get("name") or elem["name"] == elem_id):
        #         errors.append({
        #             "elementId": elem_id,
        #             "message": f"Task '{elem_id}' does not have a name or title.",
        #             "suggestion": f"Provide a meaningful name for the task '{elem_id}'."
        #         })
        
        for elem_id, elem in elements.items(): 
            if elem["tag"] in ["task", "exclusiveGateway", "parallelGateway", "startEvent", "endEvent", "userTask", "manualTask", "subProcess"] and (not elem.get("name") or elem["name"] == elem_id):
                errors.append({
                    "elementId": elem_id,
                    "message": f"Element '{elem_id}' ({elem['tag']}) does not have a name or title.",
                    "suggestion": f"Provide a meaningful name for the element '{elem_id}' to enhance readability and understanding."
        })
        # 8. Converging Deadlocks
        for elem_id, elem in elements.items():
            if elem["tag"] == "parallelGateway":
                incoming = [flow_id for flow_id, flow in sequence_flows.items() if flow["target"] == elem_id]
                if len(incoming) > 1:
                    errors.append({
                        "elementId": elem_id,
                        "message": f"Parallel gateway '{elem['name']}' may cause a deadlock.",
                        "suggestion": "Ensure all parallel branches complete before convergence."
                    })
        
        # 8. Overlapping or Duplicate Sequence Flows
        seen_flows = set()
        for flow_id, flow in sequence_flows.items():
            key = (flow["source"], flow["target"])
            if key in seen_flows:
                errors.append({
                    "elementId": flow_id,
                    "message": f"Duplicate sequence flow from '{flow['source']}' to '{flow['target']}'.",
                    "suggestion": "Remove the duplicate sequence flow."
                })
            else:
                seen_flows.add(key)
        
        # 9. Inconsistent Gateways
        gateway_stack = []

        for elem_id, elem in elements.items():
            if elem["tag"] in ["exclusiveGateway", "parallelGateway"]:
                if "diverging" in elem.get("name", "").lower():  # Diverging gateway
                    gateway_stack.append(elem_id)
                elif "converging" in elem.get("name", "").lower():  # Converging gateway
                    if not gateway_stack:
                        errors.append({
                            "elementId": elem_id,
                            "message": f"Converging gateway '{elem['name']}' has no matching diverging gateway.",
                            "suggestion": "Ensure the gateway has a corresponding diverging gateway."
                        })
                    else:
                        gateway_stack.pop()

        for elem_id in gateway_stack:
            errors.append({
                "elementId": elem_id,
                "message": f"Diverging gateway '{elements[elem_id]['name']}' has no matching converging gateway.",
                "suggestion": "Ensure the gateway has a corresponding converging gateway."
            })
        
        # 10. Isolated Start or End Events
        for elem_id, elem in elements.items():
            if elem["tag"] in ["startEvent", "endEvent"]:
                incoming = [flow_id for flow_id, flow in sequence_flows.items() if flow["target"] == elem_id]
                outgoing = [flow_id for flow_id, flow in sequence_flows.items() if flow["source"] == elem_id]
                if elem["tag"] == "startEvent" and not outgoing:
                    errors.append({
                        "elementId": elem_id,
                        "message": f"Start Event '{elem['name']}' is isolated.",
                        "suggestion": f"Connect '{elem['name']}' to other elements using an outgoing sequence flow."
                    })
                if elem["tag"] == "endEvent" and not incoming:
                    errors.append({
                        "elementId": elem_id,
                        "message": f"End Event '{elem['name']}' is isolated.",
                        "suggestion": f"Connect '{elem['name']}' to other elements using an incoming sequence flow."
                    })


        return JsonResponse({'errors': errors}, status=200)
    except Exception as e:
        # Catch any unexpected errors and return them
        return JsonResponse({'errors': [{
            "elementId": None,
            "message": f"Unexpected error: {str(e)}",
            "suggestion": "Check the BPMN XML and server logs for details."
        }]}, status=500)



def generate_natural_description(element_data):
    """
    Convert BPMN elements into structured natural language descriptions.
    """
    description = []
    
    for elem in element_data:
        if elem['type'] == "task":
            description.append(f"The process includes a task: '{elem['name']}', which is responsible for {elem['description']}.")
        elif elem['type'] == "startEvent":
            description.append(f"The workflow begins with '{elem['name']}'.")
        elif elem['type'] == "endEvent":
            description.append(f"The process ends with '{elem['name']}'.")
        elif elem['type'] == "exclusiveGateway":
            description.append(f"A decision point occurs at '{elem['name']}', where the process splits based on conditions.")
        elif elem['type'] == "parallelGateway":
            description.append(f"The workflow branches into multiple paths at '{elem['name']}' and later synchronizes.")
    
    return " ".join(description)

def enhance_with_ai(text):
    """
    Uses OpenAI GPT to refine BPMN workflow descriptions.
    """
    openai.api_key = OPENAI_API_KEY
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "Refine this BPMN workflow description into a structured, professional, and easy-to-read explanation."},
                {"role": "user", "content": text}
            ]
        )
        return response['choices'][0]['message']['content']
    except Exception as e:
        return text  # Fallback to the original text if API fails

@api_view(['POST'])
def generate_workflow_description(request):
    """
    API to generate natural language descriptions from BPMN XML
    """
    file = request.FILES.get('file')
    if not file:
        return JsonResponse({'error': 'No file provided'}, status=400)

    try:
        xml_content = file.read()
        root = ET.ElementTree(ET.fromstring(xml_content)).getroot()

        elements = []
        for elem in root.iter():
            tag_name = elem.tag.split("}")[-1]  # Extract tag without namespace
            elem_id = elem.attrib.get('id', None)
            elem_name = elem.attrib.get('name', f"Unnamed {tag_name}")

            if tag_name in ["task", "startEvent", "endEvent", "exclusiveGateway", "parallelGateway"]:
                elements.append({
                    "id": elem_id,
                    "name": elem_name,
                    "type": tag_name,
                    "description": elem.attrib.get('documentation', "No additional details available.")
                })

        # Generate basic workflow description
        workflow_description = generate_natural_description(elements)

        # Enhance with AI for better readability
        enhanced_description = enhance_with_ai(workflow_description)

        return JsonResponse({
            'workflow_description': enhanced_description
        }, status=200)

    except Exception as e:
        return JsonResponse({'error': f"Failed to process BPMN: {str(e)}"}, status=500)
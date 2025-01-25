from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import xml.etree.ElementTree as ET
from io import BytesIO

@csrf_exempt
def detect_optimization_scope(request):
    """
    Detect optimization scopes in the BPMN XML.
    """
    if request.method == "POST":
        try:
            # Get the BPMN XML from the request
            bpmn_xml = request.FILES['file'].read().decode('utf-8')
            tree = ET.parse(BytesIO(bpmn_xml.encode('utf-8')))
            root = tree.getroot()

            # Example logic: Detect tasks that don't have outgoing or incoming flows
            namespaces = {
                'bpmn': 'http://www.omg.org/spec/BPMN/20100524/MODEL'
            }
            tasks = root.findall(".//bpmn:task", namespaces)
            scopes = []

            for task in tasks:
                task_id = task.get('id')
                task_name = task.get('name', 'Unnamed Task')

                # Check for incoming and outgoing flows
                incoming = task.findall(".//bpmn:incoming", namespaces)
                outgoing = task.findall(".//bpmn:outgoing", namespaces)

                if not incoming or not outgoing:
                    scopes.append({
                        "elementId": task_id,
                        "description": f"Task '{task_name}' has missing incoming or outgoing flows."
                    })

            return JsonResponse({
                "message": "Optimization scopes detected successfully.",
                "scopes": scopes
            }, status=200)

        except Exception as e:
            return JsonResponse({
                "error": f"Error detecting optimization scopes: {str(e)}"
            }, status=500)
    return JsonResponse({"error": "Invalid request method."}, status=400)


@csrf_exempt
def apply_optimizations(request):
    """
    Apply optimizations to the BPMN XML.
    """
    if request.method == "POST":
        try:
            # Get the BPMN XML from the request
            bpmn_xml = request.FILES['file'].read().decode('utf-8')
            tree = ET.parse(BytesIO(bpmn_xml.encode('utf-8')))
            root = tree.getroot()

            namespaces = {
                'bpmn': 'http://www.omg.org/spec/BPMN/20100524/MODEL'
            }

            # Example logic: Add outgoing flows for tasks without outgoing flows
            tasks = root.findall(".//bpmn:task", namespaces)
            for task in tasks:
                task_id = task.get('id')
                outgoing = task.findall(".//bpmn:outgoing", namespaces)

                if not outgoing:
                    # Create a new outgoing flow
                    sequence_flow_id = f"{task_id}_outgoing"
                    process = root.find(".//bpmn:process", namespaces)
                    if process is not None:
                        new_sequence_flow = ET.SubElement(process, 'bpmn:sequenceFlow', {
                            'id': sequence_flow_id,
                            'sourceRef': task_id,
                            'targetRef': 'EndEvent_1'  # Example: Connect to an End Event
                        })
                        outgoing_element = ET.SubElement(task, 'bpmn:outgoing')
                        outgoing_element.text = sequence_flow_id

            # Serialize the modified XML
            optimized_xml = BytesIO()
            tree.write(optimized_xml, encoding='unicode')
            optimized_xml.seek(0)

            return JsonResponse({
                "message": "Optimizations applied successfully.",
                "optimizedXml": optimized_xml.read().decode('utf-8')
            }, status=200)

        except Exception as e:
            return JsonResponse({
                "error": f"Error applying optimizations: {str(e)}"
            }, status=500)
    return JsonResponse({"error": "Invalid request method."}, status=400)

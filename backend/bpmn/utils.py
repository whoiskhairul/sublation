from uuid import uuid4
from .models import BPMNDiagram, DiagramShare



def write_bpmn_file(bot_message):
    with open('static/testfile.bpmn', 'w') as f:
        f.write(bot_message)
    return

def save_bpmn(user, template_xml = '', template_svg = '', folder = None):
    if template_xml:
        bpmn_xml = template_xml
        bpmn_svg = template_svg
    else:
        bpmn_xml = """<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd">
  <bpmn:process id="Process_1" isExecutable="false" />
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1" />
  </bpmndi:BPMNDiagram>
</bpmn:definitions>"""
        bpmn_svg  = """<?xml version="1.0" encoding="utf-8"?>
<!-- created with bpmn-js / http://bpmn.io -->
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="0" height="0" viewBox="0 0 0 0" version="1.1"></svg>"""
    name = "Untitled Diagram"
    bpmn = BPMNDiagram(user = user, name = name, bpmn_xml = bpmn_xml, bpmn_svg= bpmn_svg, folder = folder)
    bpmn.save()
    return

def save_imported_diagram(user, bpmn_xml, bpmn_svg):
    name = "Imported Diagram"
    bpmn = BPMNDiagram(user=user, name=name, bpmn_xml=bpmn_xml, bpmn_svg=bpmn_svg)
    bpmn.save()
    return


def create_public_share_link(encrypted_id):
    share_id = str(uuid4())  # Generate a unique ID for the share link
    share_link = f"https://example.com/bpmn/view/{share_id}"
    DiagramShare.objects.create(diagram_id=diagram_id, share_link=share_link, access_type='public')
    return share_link

def create_private_share_link(encrypted_id, email_list):
    share_id = str(uuid4())  # Unique link
    share_link = f"https://example.com/bpmn/private/{share_id}"
    for email in email_list:
        DiagramShare.objects.create(diagram_id=diagram_id, share_link=share_link, email=email, access_type='private')
    return share_link

def check_user_access(request, encrypted_id):
    """
    Check if the requesting user has access to the given BPMNDiagram.
    """
    try:
        # Get the BPMNDiagram object by its ID
        diagram = BPMNDiagram.objects.get(encrypted_id=encrypted_id)

        
        # Check if the user has access to the BPMNDiagram
        if diagram.user == request.user:
            permission = 'editor'
            return diagram, permission
        elif DiagramShare.objects.filter(user=request.user.id, diagram=diagram).exists():
            permission = DiagramShare.objects.get(user=request.user, diagram=diagram).permission
            return diagram, permission
        elif diagram.privacy == 'public':
            permission = 'viewer'
            return diagram, permission
        elif diagram.privacy == 'restricted':
            permission = 'restricted'
            return diagram, permission
        
    except BPMNDiagram.DoesNotExist:
        return diagram.DoesNotExist, None


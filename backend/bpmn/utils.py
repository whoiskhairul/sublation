from uuid import uuid4
from .models import BPMNDiagram, DiagramShare



def write_bpmn_file(bot_message):
    with open('static/testfile.bpmn', 'w') as f:
        f.write(bot_message)
    return

DEFAULT_STARTER_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" width="100%" height="100%" style="background:#f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <rect width="100%" height="100%" fill="#f8fafc"/>
  <circle cx="90" cy="100" r="18" fill="#ecfdf5" stroke="#10b981" stroke-width="2.5" />
  <line x1="108" y1="100" x2="160" y2="100" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 3" marker-end="url(#arrowhead)"/>
  <rect x="160" y="78" width="80" height="44" rx="8" fill="#ffffff" stroke="#3b82f6" stroke-width="2" />
  <text x="200" y="104" text-anchor="middle" fill="#64748b" font-size="11" font-weight="500">Draft</text>
</svg>"""

def save_bpmn(user, template_xml = '', template_svg = '', folder = None, name = "Untitled Diagram"):
    if template_xml:
        bpmn_xml = template_xml
        bpmn_svg = template_svg if template_svg and 'width="0"' not in template_svg else bpmn_xml_to_svg(bpmn_xml)
    else:
        bpmn_xml = """<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd">
  <bpmn:process id="Process_1" isExecutable="false" />
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1" />
  </bpmndi:BPMNDiagram>
</bpmn:definitions>"""
        bpmn_svg = DEFAULT_STARTER_SVG
    if not bpmn_svg or 'width="0"' in bpmn_svg:
        bpmn_svg = DEFAULT_STARTER_SVG
    bpmn = BPMNDiagram(user = user, name = name, bpmn_xml = bpmn_xml, bpmn_svg= bpmn_svg, folder = folder)
    bpmn.save()
    return bpmn

def save_imported_diagram(user, bpmn_xml, bpmn_svg=''):
    name = "Imported Diagram"
    if not bpmn_svg or bpmn_svg.strip() == "" or 'width="0"' in bpmn_svg:
        bpmn_svg = bpmn_xml_to_svg(bpmn_xml)
    if not bpmn_svg or 'width="0"' in bpmn_svg:
        bpmn_svg = DEFAULT_STARTER_SVG
    bpmn = BPMNDiagram.objects.create(user=user, name=name, bpmn_xml=bpmn_xml, bpmn_svg=bpmn_svg)
    return bpmn



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
        return BPMNDiagram.DoesNotExist, None


def bpmn_xml_to_svg(xml_content):
    import xml.etree.ElementTree as ET
    import html

    NS = {
        'bpmn': 'http://www.omg.org/spec/BPMN/20100524/MODEL',
        'bpmndi': 'http://www.omg.org/spec/BPMN/20100524/DI',
        'dc': 'http://www.omg.org/spec/DD/20100524/DC',
        'di': 'http://www.omg.org/spec/DD/20100524/DI',
    }

    try:
        root = ET.fromstring(xml_content)
    except Exception:
        return ""

    plane = root.find('.//bpmndi:BPMNPlane', NS)
    if plane is None:
        return ""

    element_map = {}
    for elem in root.iter():
        elem_id = elem.attrib.get('id')
        if elem_id:
            tag = elem.tag.split('}')[-1]
            element_map[elem_id] = {
                'tag': tag,
                'name': elem.attrib.get('name', ''),
                'element': elem
            }

    shapes = plane.findall('bpmndi:BPMNShape', NS)
    edges = plane.findall('bpmndi:BPMNEdge', NS)

    all_x, all_y = [], []
    for s in shapes:
        b = s.find('dc:Bounds', NS)
        if b is not None:
            try:
                x, y, w, h = float(b.attrib['x']), float(b.attrib['y']), float(b.attrib['width']), float(b.attrib['height'])
                all_x.extend([x, x + w])
                all_y.extend([y, y + h])
            except (KeyError, ValueError):
                continue

    for e in edges:
        for pt in e.findall('di:waypoint', NS):
            try:
                all_x.append(float(pt.attrib['x']))
                all_y.append(float(pt.attrib['y']))
            except (KeyError, ValueError):
                continue

    if not all_x or not all_y:
        return DEFAULT_STARTER_SVG

    pad = 40
    min_x, max_x = min(all_x) - pad, max(all_x) + pad
    min_y, max_y = min(all_y) - pad, max(all_y) + pad
    width = max(max_x - min_x, 100)
    height = max(max_y - min_y, 100)

    svg_parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{min_x:.1f} {min_y:.1f} {width:.1f} {height:.1f}" width="100%" height="100%" style="background:#ffffff; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif;">',
        '<defs>',
        '  <marker id="arrowhead" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">',
        '    <polygon points="0 1.5, 8 4.5, 0 7.5" fill="#525f7f" />',
        '  </marker>',
        '  <filter id="card-shadow" x="-5%" y="-5%" width="115%" height="115%">',
        '    <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#0f172a" flood-opacity="0.08"/>',
        '  </filter>',
        '</defs>',
    ]

    for e in edges:
        pts = e.findall('di:waypoint', NS)
        if len(pts) >= 2:
            coords = " ".join([f"{float(pt.attrib['x'])},{float(pt.attrib['y'])}" for pt in pts])
            svg_parts.append(f'<polyline points="{coords}" fill="none" stroke="#525f7f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#arrowhead)" />')

    for s in shapes:
        b = s.find('dc:Bounds', NS)
        if b is None:
            continue
        try:
            x, y, w, h = float(b.attrib['x']), float(b.attrib['y']), float(b.attrib['width']), float(b.attrib['height'])
        except (KeyError, ValueError):
            continue
        bpmn_el_id = s.attrib.get('bpmnElement')
        info = element_map.get(bpmn_el_id, {})
        tag = info.get('tag', '')
        name = info.get('name', '')

        if 'start' in tag.lower():
            cx = x + w / 2
            cy = y + h / 2
            r = min(w, h) / 2
            svg_parts.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="#ecfdf5" stroke="#10b981" stroke-width="2.5" />')
            if name:
                escaped = html.escape(name)
                svg_parts.append(f'<text x="{cx:.1f}" y="{cy + r + 18:.1f}" text-anchor="middle" fill="#1e293b" font-size="11" font-weight="600">{escaped}</text>')

        elif 'end' in tag.lower():
            cx = x + w / 2
            cy = y + h / 2
            r = min(w, h) / 2
            svg_parts.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="#fef2f2" stroke="#ef4444" stroke-width="4" />')
            if name:
                escaped = html.escape(name)
                svg_parts.append(f'<text x="{cx:.1f}" y="{cy + r + 18:.1f}" text-anchor="middle" fill="#1e293b" font-size="11" font-weight="600">{escaped}</text>')

        elif 'gateway' in tag.lower():
            cx = x + w / 2
            cy = y + h / 2
            points = f"{cx:.1f},{y:.1f} {x+w:.1f},{cy:.1f} {cx:.1f},{y+h:.1f} {x:.1f},{cy:.1f}"
            svg_parts.append(f'<polygon points="{points}" fill="#fffbeb" stroke="#f59e0b" stroke-width="2.5" stroke-linejoin="round" />')
            if 'parallel' in tag.lower():
                arm = min(w, h) * 0.22
                svg_parts.append(f'<line x1="{cx - arm:.1f}" y1="{cy:.1f}" x2="{cx + arm:.1f}" y2="{cy:.1f}" stroke="#d97706" stroke-width="3" stroke-linecap="round" />')
                svg_parts.append(f'<line x1="{cx:.1f}" y1="{cy - arm:.1f}" x2="{cx + arm:.1f}" y2="{cy:.1f}" stroke="#d97706" stroke-width="3" stroke-linecap="round" />')
            else:
                arm = min(w, h) * 0.18
                svg_parts.append(f'<line x1="{cx - arm:.1f}" y1="{cy - arm:.1f}" x2="{cx + arm:.1f}" y2="{cy + arm:.1f}" stroke="#d97706" stroke-width="3" stroke-linecap="round" />')
                svg_parts.append(f'<line x1="{cx - arm:.1f}" y1="{cy + arm:.1f}" x2="{cx + arm:.1f}" y2="{cy - arm:.1f}" stroke="#d97706" stroke-width="3" stroke-linecap="round" />')
            if name:
                escaped = html.escape(name)
                svg_parts.append(f'<text x="{cx:.1f}" y="{y - 10:.1f}" text-anchor="middle" fill="#1e293b" font-size="11" font-weight="600">{escaped}</text>')

        else:
            svg_parts.append(f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="10" ry="10" fill="#ffffff" stroke="#2563eb" stroke-width="2" filter="url(#card-shadow)" />')
            svg_parts.append(f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="4" rx="2" fill="#3b82f6" />')
            if name:
                words = name.split()
                lines = []
                current = ""
                for word in words:
                    test_line = f"{current} {word}".strip()
                    if len(test_line) > 18:
                        if current:
                            lines.append(current)
                        current = word
                    else:
                        current = test_line
                if current:
                    lines.append(current)

                line_height = 15
                total_text_h = len(lines) * line_height
                start_text_y = y + (h - total_text_h) / 2 + 11

                for idx, line in enumerate(lines):
                    escaped = html.escape(line)
                    svg_parts.append(f'<text x="{x + w / 2:.1f}" y="{start_text_y + idx * line_height:.1f}" text-anchor="middle" fill="#1e293b" font-size="12" font-weight="500">{escaped}</text>')

    svg_parts.append('</svg>')
    return "".join(svg_parts)



import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from bpmn.default_templates import TEMPLATES
from bpmn.utils import bpmn_xml_to_svg
from bpmn.models import BPMNTemplate

def seed():
    print('Testing SVG generation and seeding templates...')
    for t in TEMPLATES:
        svg = bpmn_xml_to_svg(t['xml'])
        print(f"Generating: {t['name']} (XML: {len(t['xml'])} chars, SVG: {len(svg)} chars)")
        obj, created = BPMNTemplate.objects.get_or_create(
            name=t['name'],
            defaults={
                'description': f"<p>{t['description']}</p>",
                'bpmn_xml': t['xml'],
                'bpmn_svg': svg
            }
        )
        if not created:
            obj.description = f"<p>{t['description']}</p>"
            obj.bpmn_xml = t['xml']
            obj.bpmn_svg = svg
            obj.save()
        print(f"Saved: {obj.name} (id={obj.id}, created={created})")

    print('Total templates in DB now:', BPMNTemplate.objects.count())

if __name__ == '__main__':
    seed()

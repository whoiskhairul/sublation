from rest_framework import serializers
from .models import BPMNDiagram, DiagramShare, Message, BPMNConversation, BPMNTemplate,DiagramVersion

class BpmnDiagramSelializer(serializers.ModelSerializer):
    updated_at = serializers.DateTimeField(format=" %I:%M %p, %d %b, %Y")
    class Meta:
        model = BPMNDiagram
        fields = ['id', 'name', 'bpmn_xml', 'bpmn_svg', 'encrypted_id', 'updated_at','created_at']

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['message_type', 'content', 'timestamp']


class DiagramShareSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    class Meta:
        model = DiagramShare
        fields = ['name', 'permission', ]
    def get_name(self, obj):
        return obj.user.email

class DiagramVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiagramVersion
        fields = ['version_number', 'version_name', 'created_at', 'bpmn_xml','id']


class BpmnTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BPMNTemplate
        fields = '__all__'
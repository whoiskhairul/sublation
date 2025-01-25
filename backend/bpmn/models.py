from authentication.models import User
from django.db import models
from ckeditor.fields import RichTextField
from scripts.encryption import encrypt_data

# Existing Models: User, Tag, Project, etc.

class BPMNDiagram(models.Model):
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='diagrams'
    )
    name = models.CharField(max_length=255)
    encrypted_id = models.CharField(max_length=255, blank=True, null=True)
    # description = models.TextField(blank=True, null=True)
    
    bpmn_xml = models.TextField()
    bpmn_svg = models.TextField(blank=True, null=True)
    generated_from_text = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Access Control
    PRIVACY_CHOICES = [
        # ('private', 'Private'),
        ('public', 'Public'),
        ('restricted', 'Restricted'),
    ]
    privacy = models.CharField(
        max_length=10,
        choices=PRIVACY_CHOICES,
        default='restricted'
    )
    shared_with = models.ManyToManyField(
        User, 
        through='DiagramShare', 
        related_name='shared_diagrams'
    )
    
    # Versioning
    # current_version = models.ForeignKey(
    #     'DiagramVersion', 
    #     on_delete=models.SET_NULL, 
    #     null=True, 
    #     related_name='+'
    # )

    
    # Statistics
    view_count = models.PositiveIntegerField(default=0)
    # edit_count = models.PositiveIntegerField(default=0)
    # favorite_count = models.PositiveIntegerField(default=0)
    


    


    # Status and Workflow
    # STATUS_CHOICES = [
    #     ('draft', 'Draft'),
    #     ('approved', 'Approved'),
    # ]
    # status = models.CharField(
    #     max_length=10,
    #     choices=STATUS_CHOICES,
    #     default='draft'
    # )
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        # Generate and Save the encrypted ID in the database
        if not self.encrypted_id:
            self.encrypted_id = encrypt_data(str(self.id))
            
            super().save(*args, **kwargs)
        
        #Create BPMNConversation object from the BPMNDiagram object
        BPMNConversation.objects.get_or_create(user=self.user, bpmn=self)
    
    

    def __str__(self):
        return f"{self.id}.{self.name} (owned by {self.user.username})"

class DiagramShare(models.Model):
    diagram = models.ForeignKey(BPMNDiagram, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    PERMISSION_CHOICES = [
        ('viewer', 'Viewer'),
        ('editor', 'Editor'),
        ('commenter', 'Commenter'),
    ]
    permission = models.CharField(
        max_length=10,
        choices=PERMISSION_CHOICES,
        default='viewer',
        help_text="Permission level for the shared user."
    )
    shared_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.diagram.name} ({self.permission})"


class BPMNConversation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Link to the user
    bpmn = models.OneToOneField(BPMNDiagram, on_delete=models.CASCADE)  # Link to the specific BPMN
    created_at = models.DateTimeField(auto_now_add=True)  # When the conversation started

    def __str__(self):
        return f"Conversation for--- BPMN ID: {self.bpmn.id}. {self.bpmn.name} - by user: {self.user.username}"


class Message(models.Model):
    # Link the message to a specific BPMN conversation
    conversation = models.ForeignKey(BPMNConversation, related_name="messages", on_delete=models.CASCADE)
    MESSAGE_TYPE = {
        ('user', 'User'),
        ('bot', 'Bot'),
    }
    message_type = models.CharField(max_length=50, choices=MESSAGE_TYPE)  # Either 'user' or 'bot'
    content = models.TextField()  # The message content (either user or bot's reply)
    timestamp = models.DateTimeField(auto_now_add=True)  # When the message was sent

    def __str__(self):
        return f"{self.message_type.capitalize()} message at {self.timestamp}"



class DiagramVersion(models.Model):
    diagram = models.ForeignKey(BPMNDiagram, on_delete=models.CASCADE, related_name='versions')
    version_number = models.PositiveIntegerField()
    version_name = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    bpmn_xml = models.TextField()

    class Meta:
        unique_together = ('diagram', 'version_number')

    def __str__(self):
        return f"{self.diagram.name} - Version {self.version_number}"


class BPMNTemplate(models.Model):
    name = models.CharField(max_length=255)  # Name of the template
    description = RichTextField(blank=True, null= True)  # Description of the process
    bpmn_xml = models.TextField()  # XML representation of the BPMN diagram
    bpmn_svg = models.TextField(blank=True)  # SVG representation of the BPMN diagram
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

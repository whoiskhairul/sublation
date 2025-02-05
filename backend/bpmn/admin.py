
from django.contrib import admin
from .models import BPMNConversation, Folder, Message, BPMNDiagram, DiagramShare, DiagramVersion,BPMNTemplate

class DiagramShareInline(admin.TabularInline):

    # Allows editing DiagramShare instances directly within BPMNDiagram admin.

    model = DiagramShare
    extra = 0  # Number of extra blank DiagramShare forms to display
    autocomplete_fields = ['user']
    list_display = ('user', 'permission', 'shared_at')
    readonly_fields = ('shared_at',)
    fields = ('user', 'permission', 'shared_at')
    verbose_name = 'Shared User'
    verbose_name_plural = 'Shared Users'


@admin.register(BPMNDiagram)
class BPMNDiagramAdmin(admin.ModelAdmin):

    # Admin interface customization for BPMNDiagram model.
    list_display = (
        'name',
        'user',
        'created_at',
        'updated_at',
        'privacy',
        'view_count',  
    )
    list_filter = ('privacy', 'user')
    search_fields = ('name', 'user__username', 'bpmn_xml', 'generated_from_text')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [DiagramShareInline]
    ordering = ('-created_at',)
    fieldsets = (
        (None, {
            'fields': ('name', 'user', 'privacy', 'encrypted_id', )
        }),
        ('BPMN Content', {
            'fields': ('bpmn_xml', 'bpmn_svg', 'generated_from_text', 'folder', )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    autocomplete_fields = ['user']


@admin.register(DiagramShare)
class DiagramShareAdmin(admin.ModelAdmin):

    # Admin interface customization for DiagramShare model.

    list_display = ('diagram', 'user', 'permission', 'shared_at')
    list_filter = ('permission', 'shared_at', 'diagram__name', 'user__username')
    search_fields = ('diagram__name', 'user__username', 'permission')
    readonly_fields = ('shared_at',)
    autocomplete_fields = ['diagram', 'user']
    ordering = ('-shared_at',)
    fieldsets = (
        (None, {
            'fields': ('diagram', 'user', 'permission')
        }),
        ('Timestamp', {
            'fields': ('shared_at',)
        }),
    )

@admin.register(BPMNConversation)
class BPMNConversationAdmin(admin.ModelAdmin):
    list_display = ( 'user', 'bpmn', 'created_at',)
    ordering = ('-created_at',)

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ( 'conversation', 'message_type', 'timestamp')

@admin.register(DiagramVersion)
class DiagramVersionAdmin(admin.ModelAdmin):
    list_display = ( 'diagram', 'version_number', 'version_name', 'created_at')
    ordering = ('-created_at',)

@admin.register(BPMNTemplate)
class BPMNTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')

@admin.register(Folder)
class FolderAdmin(admin.ModelAdmin):
    list_display = ('name', 'user')
    search_fields = ('name', 'user__username')
from django.urls import path
from . import views
from .views import image_to_bpmn_view,save_diagram_version

urlpatterns = [
    path('', views.bpmn_get, name='bpmn_page'), #testing bpmn generator
    path('generate/', views.bpmn_chatbot, name='bpmn_generator'), #testing bpmn generator
    path('save-bpmn/<str:encrypted_id>', views.BPMNDiagramUpdateView.as_view(), name='bpmn_save'), #save BPMN diagram
    path('create-bpmn-diagram/', views.create_bpmn_diagram, name='text_to_bpmn'), #convert text to BPMN diagram
    path('get-all-diagram/', views.get_all_diagram, name='all_diagram'), #view BPMN diagram
    path('get-xml/<str:encrypted_id>', views.get_xml, name='get_xml'), #get BPMN XML
    path('conversation/<str:encrypted_id>', views.delete_conversations, name='conversations'), #delete conversations
    path('delete-diagram/<str:encrypted_id>', views.delete_diagram, name='get_diagram'), #get BPMN diagram
    path('update-diagram/<str:encrypted_id>', views.BPMNDiagramUpdateView.as_view(), name='update_diagram'), #update BPMN diagram
    path('diagram-share/<str:encrypted_id>', views.diagram_share, name='diagram_share'), #share BPMN diagram
    path('image-to-bpmn/', image_to_bpmn_view, name='image_to_bpmn'), #image to BPMN
    path('save-diagram-version/',save_diagram_version,name='save_diagram_version'), #save diagram version
    path('restore-diagram-version/',views.restore_diagram_version,name='restore_diagram_version'), #restore diagram version
    path('get-versions/<str:encrypted_id>', views.get_versions, name='get_versions'),
    path('templates/', views.templates, name='templates'), #get provided BPMN templates
]
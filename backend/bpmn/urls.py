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

    path('create-folder/', views.create_folder, name='create_folder'), #create folder
    path('move-diagram-to-folder/', views.move_to_folder, name='move_to_folder'), #move diagram to folder
    path('get-folders/', views.get_folders, name='get_folders'), #get folder
    path('get-folder-diagrams/<str:encrypted_folder_id>', views.get_folder_diagrams, name='get_folder_diagrams'), #get folder diagrams
    path('delete-folder/<str:encrypted_folder_id>', views.delete_folder, name='delete_folder'), #delete folder
    path('generate-bpmn-documentation/', views.generate_bpmn_documentation, name='generate_bpmn_documentation'), #generate BPMN documentation
    
    path('optimize/<str:encrypted_id>', views.optimize, name='optimize'), #get shared diagrams
    path('generate-bpmn-documentation/', views.generate_bpmn_documentation, name='generate_bpmn_documentation'), #generate BPMN documentation
    
]
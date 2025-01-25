from django.urls import path
#from .views import detect_and_fix_bpmn
from .views import validate_bpmn

urlpatterns = [
    #path('detect-fix/', detect_and_fix_bpmn, name='detect_fix_bpmn'),
    path('validate/', validate_bpmn, name='validate_bpmn'),
]

from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/bpmn/(?P<room_name>\w+)/$', consumers.BPMNConsumer.as_asgi()),  # WebSocket URL pattern
]

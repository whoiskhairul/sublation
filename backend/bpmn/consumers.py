import json
from channels.generic.websocket import AsyncWebsocketConsumer

class BPMNConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'bpmn_{self.room_name}'

        # Join the WebSocket group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Notify others to remove this user's cursor and presence
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_left',
                'user': self.channel_name,
            }
        )

        # Leave the WebSocket group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)

        if data['action'] == 'update_cursor':
            # Broadcast cursor position to the room
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'update_cursor',
                    'user': data['user'],
                    'position': data['position'],
                    'color': data['color'],
                }
            )
        elif data['action'] == 'remove_cursor':
            # Notify the room to remove the user's cursor
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'remove_cursor',
                    'user': data['user'],
                }
            )
        elif data['action'] == 'update_xml':
            # Broadcast XML updates to the room
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'update_xml',
                    'xml': data['xml'],
                    'user': data['user'],
                    
                }
            )
        elif data['action'] == 'user_joined':
            # Notify the room of a new user
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_joined',
                    'user': data['user'],
                }
            )
        elif data['action'] == 'user_left':
            # Notify the room that a user has left
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_left',
                    'user': data['user'],
                }
            )

    async def update_cursor(self, event):
        # Send cursor update to WebSocket
        await self.send(text_data=json.dumps({
            'action': 'update_cursor',
            'user': event['user'],
            'position': event['position'],
            'color': event['color'],
        }))

    async def remove_cursor(self, event):
        # Notify clients to remove cursor
        await self.send(text_data=json.dumps({
            'action': 'remove_cursor',
            'user': event['user'],
        }))

    async def update_xml(self, event):
        # Broadcast XML changes
        await self.send(text_data=json.dumps({
            'action': 'update_xml',
            'xml': event['xml'],
            'user': event['user'],

        }))

    async def user_joined(self, event):
        # Notify clients of a new user
        await self.send(text_data=json.dumps({
            'action': 'user_joined',
            'user': event['user'],
        }))

    async def user_left(self, event):
        # Notify clients that a user has left
        await self.send(text_data=json.dumps({
            'action': 'user_left',
            'user': event['user'],
        }))

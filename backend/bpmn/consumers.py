import json
from channels.generic.websocket import AsyncWebsocketConsumer

class BPMNConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'bpmn_{self.room_name}'
        self.user = None

        # Join the WebSocket group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Notify others to remove this user's cursor, selections, and presence
        if self.user:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_left',
                    'user': self.user,
                }
            )

        # Leave the WebSocket group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')

        if action == 'ping':
            # Keepalive ping/pong to prevent proxy and browser timeout disconnects
            await self.send(text_data=json.dumps({'action': 'pong'}))
            return

        if action == 'update_cursor':
            # Broadcast cursor position in diagram canvas coordinates
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'update_cursor',
                    'user': data.get('user'),
                    'position': data.get('position'),
                    'color': data.get('color'),
                }
            )
        elif action == 'remove_cursor':
            # Notify the room to remove the user's cursor
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'remove_cursor',
                    'user': data.get('user'),
                }
            )
        elif action == 'element_selected':
            # Broadcast element selection footprint to the room
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'element_selected',
                    'user': data.get('user'),
                    'elementIds': data.get('elementIds', []),
                    'color': data.get('color'),
                }
            )
        elif action == 'element_deselected':
            # Broadcast element deselection to the room
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'element_deselected',
                    'user': data.get('user'),
                    'elementIds': data.get('elementIds', []),
                }
            )
        elif action == 'update_xml':
            # Broadcast XML updates to the room
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'update_xml',
                    'xml': data.get('xml'),
                    'user': data.get('user'),
                }
            )
        elif action == 'user_joined':
            self.user = data.get('user')
            # Notify the room of a new user
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_joined',
                    'user': data.get('user'),
                    'color': data.get('color'),
                }
            )
        elif action == 'user_left':
            # Notify the room that a user has left
            user_leaving = data.get('user') or self.user
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_left',
                    'user': user_leaving,
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

    async def element_selected(self, event):
        # Notify clients of element selection footprint
        await self.send(text_data=json.dumps({
            'action': 'element_selected',
            'user': event['user'],
            'elementIds': event['elementIds'],
            'color': event.get('color', '#3357FF'),
        }))

    async def element_deselected(self, event):
        # Notify clients of element deselection
        await self.send(text_data=json.dumps({
            'action': 'element_deselected',
            'user': event['user'],
            'elementIds': event.get('elementIds', []),
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
            'color': event.get('color'),
        }))

    async def user_left(self, event):
        # Notify clients that a user has left
        await self.send(text_data=json.dumps({
            'action': 'user_left',
            'user': event['user'],
        }))

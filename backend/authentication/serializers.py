from dj_rest_auth.registration.serializers import RegisterSerializer
from rest_framework import serializers
from django.contrib.auth.models import User

class CustomRegisterSerializer(RegisterSerializer):
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    def custom_signup(self, request, user):
        # Set email as username
        user.username = self.validated_data.get('email')
        user.first_name = self.validated_data.get('first_name')
        user.last_name = self.validated_data.get('last_name')
        user.email = self.validated_data.get('email')
        user.save()
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class CustomUserDetailsSerializer(serializers.ModelSerializer):
    # Mark username as read-only so it won't be required for updates
    username = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = ['username',  'first_name', 'last_name', 'email']  # Include only fields you need

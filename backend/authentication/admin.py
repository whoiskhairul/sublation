from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """
    Custom admin view for the extended User model.
    """
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('BPMN Platform Details', {'fields': (
            'role',
            'subscription_level',
            'text_generation_credits',
            'theme_preference',
        )}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    list_display = ('username', 'email', 'role', 'subscription_level', 'is_staff')
    search_fields = ('username', 'email', 'role', 'subscription_level')

# myapp/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """
    Custom User model for a BPMN platform.
    Inherits from AbstractUser, which already provides:
      - username
      - password
      - email
      - first_name, last_name
      - is_staff, is_superuser, is_active
      - date_joined
    """

    # 1. Role or Access Level
    #   - You may define role-based access (e.g., 'admin', 'designer', 'viewer').
    USER_ROLES = [
        # ('admin', 'Admin'),
        ('editor', 'Editor'),
        # ('designer', 'Designer'),
        ('viewer', 'Viewer'),
    ]
    role = models.CharField(
        max_length=20,
        choices=USER_ROLES,
        default='viewer',
        help_text="Role determining user privileges in the BPMN platform."
    )

    # 2. Subscription / Plan
    #   - If you offer tiered plans (Free, Pro, Enterprise, etc.).
    SUBSCRIPTION_LEVELS = [
        ('free', 'Free'),
        ('pro', 'Pro'),
    ]
    subscription_level = models.CharField(
        max_length=20,
        choices=SUBSCRIPTION_LEVELS,
        default='free',
        help_text="Subscription plan for the user."
    )

    # 3. Credits or Usage Quotas
    #   - If text-to-BPMN or image-to-BPMN is resource-intensive, you might use a credit system.
    text_generation_credits = models.PositiveIntegerField(
        default=0,
        help_text="Number of text-to-BPMN conversions left."
    )
    # image_generation_credits = models.PositiveIntegerField(
    #     default=0,
    #     help_text="Number of image-to-BPMN conversions left."
    # )

    # 4. Preferences (Language, Theme, Timezone, etc.)
    # LANGUAGE_CHOICES = [
    #     ('en', 'English'),
    #     ('es', 'Spanish'),
    #     ('de', 'German'),
    #     ('fr', 'French'),
    # ]
    # language_preference = models.CharField(
    #     max_length=5,
    #     choices=LANGUAGE_CHOICES,
    #     default='en',
    #     help_text="Preferred language for the user interface."
    # )

    THEME_CHOICES = [
        ('light', 'Light'),
        ('dark', 'Dark'),
    ]
    theme_preference = models.CharField(
        max_length=10,
        choices=THEME_CHOICES,
        default='light',
        help_text="UI theme preference."
    )

    # time_zone = models.CharField(
    #     max_length=50,
    #     blank=True,
    #     null=True,
    #     help_text="User's preferred time zone."
    # )

    # 5. Optional Profile Fields
    #   - E.g., Profile pictures, phone number, organization, etc.
    # profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    organization = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.username}"

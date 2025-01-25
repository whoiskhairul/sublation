from django.contrib import admin
from django_json_widget.widgets import JSONEditorWidget
from bootstrap_datepicker_plus.widgets import TimePickerInput
from django.forms import ModelForm
from django.db import models
from .models import Appointment, Doctor, PersonaInstruction


class DoctorForm(ModelForm):
    class Meta:
        model = Doctor
        fields = '__all__'
        widgets = {
            'start_time': TimePickerInput(),  # Add a time picker
            'end_time': TimePickerInput(),
        }


from django.utils.html import format_html, format_html_join

class DoctorAdmin(admin.ModelAdmin):
    form = DoctorForm
    formfield_overrides = {
        models.JSONField: {'widget': JSONEditorWidget},
    }
    list_display = ('name', 'specialization', 'email')  # Add custom field to list display

    # readonly_fields = ('generated_slots',)  # Add the custom read-only field

    # def generated_slots(self, obj):
    #     """Custom read-only field to display generated slots in a better format."""
    #     if obj:
    #         slots = obj.generate_slots()
    #         # Format as a bulleted list
    #         return format_html("<ul>{}</ul>", format_html_join("", "<li>{}</li>", ((slot,) for slot in slots)))
    #     return "No slots available."

    # generated_slots.short_description = "Available slots"

    # def display_slots(self, obj):
    #     """Custom field for list display."""
    #     slots = obj.generate_slots()
    #     return ", ".join(slots[:3]) + ("..." if len(slots) > 3 else "")  # Show first 3 slots for preview

    # display_slots.short_description = "Slots (Preview)"

    class Media:
        js = [
            'https://code.jquery.com/jquery-3.6.0.min.js',  # Load jQuery first
        ]

class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('doctor', 'date', 'slot', 'patient_name', 'status')
    list_filter = ('doctor', 'date', 'status')  # Filters for easy navigation
    search_fields = ('patient_name', 'patient_contact')  # Enable search functionality
    ordering = ('date', 'slot')  # Default ordering

    fieldsets = (
        ("Appointment Details", {
            'fields': ('doctor', 'date', 'slot', 'status')
        }),
        ("Patient Details", {
            'fields': ('patient_name', 'patient_contact', 'symptoms')
        }),
    )

class PersonaInstructionAdmin(admin.ModelAdmin):
    list_display = ('persona', 'instruction')

admin.site.register(Doctor, DoctorAdmin)
admin.site.register(Appointment, AppointmentAdmin)
admin.site.register(PersonaInstruction, PersonaInstructionAdmin)

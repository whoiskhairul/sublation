from django.db import models
from datetime import datetime, timedelta


class Doctor(models.Model):
    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    ]

    name = models.CharField(max_length=100)  # Example: "Dr. John Doe"
    email = models.EmailField(unique=True)  # Example: "johndoe@example.com"
    phone_number = models.CharField(max_length=15)  # Example: "+1234567890"
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, null=True)

    
    specialization = models.CharField(max_length=100)  # Example: "Cardiologist"
    # qualification = models.TextField()  # Example: "MD in Cardiology, 10 years of practice"
    # experience_years = models.PositiveIntegerField()  # Example: 15
    # bio = models.TextField(blank=True, null=True)  # Example: "Experienced cardiologist specializing in heart care."

    clinic_name = models.CharField(max_length=200)  # Example: "Heart Care Clinic"
    clinic_address = models.TextField()  # Example: "123 Main Street, Springfield"
    # city = models.CharField(max_length=100)  # Example: "Springfield"
    # zip_code = models.CharField(max_length=20)  # Example: "12345"
    
    # working_days = models.JSONField(default=list)  # Example: ["Monday", "Tuesday", "Thursday"]
    # start_time = models.TimeField()  # Example: "09:00:00"
    # end_time = models.TimeField()  # Example: "17:00:00"
    # break_times = models.JSONField(default=list, blank=True, null=True)  # Example: ["10:00-10:30", "12:00-12:15"]
    
    # slot_duration = models.PositiveIntegerField(default=30)  # Example: 15 (in minutes)
    # languages_spoken = models.JSONField(default=list, blank=True, null=True)  # Example: ["English", "Spanish"]


    available_time_slots = models.JSONField(default=dict, blank=True, help_text="""Doctor's available time slots in JSON format(eg: {
    "2024-12-06": ["10:00 AM", "11:00 AM", "2:00 PM"],
    "2024-12-07": ["9:00 AM", "1:00 PM", "3:00 PM"]
})""")


    def __str__(self):
        return f"Dr. {self.name} - {self.specialization}"

    # def generate_slots(self):
    #     """Generate all possible slots for the doctor's availability, excluding breaks."""
    #     slots = []
    #     start = datetime.combine(datetime.today(), self.start_time)
    #     end = datetime.combine(datetime.today(), self.end_time)
    #     slot_duration = timedelta(minutes=self.slot_duration)

    #     # Parse break times into datetime ranges
    #     break_ranges = []
    #     for break_time in self.break_times:
    #         break_start_str, break_end_str = break_time.split('-')
    #         break_start = datetime.combine(datetime.today(), datetime.strptime(break_start_str, "%H:%M").time())
    #         break_end = datetime.combine(datetime.today(), datetime.strptime(break_end_str, "%H:%M").time())
    #         break_ranges.append((break_start, break_end))

    #     # Generate slots while excluding break times
    #     current_time = start
    #     while current_time + slot_duration <= end:
    #         # Check if the current slot overlaps with any break range
    #         overlapping = any(break_start <= current_time < break_end for break_start, break_end in break_ranges)

    #         if not overlapping:
    #             slot_start = current_time.strftime("%H:%M")
    #             slot_end = (current_time + slot_duration).strftime("%H:%M")
    #             slots.append(f"{slot_start}-{slot_end}")

    #         # Increment the current time by slot duration
    #         current_time += slot_duration

    #     return slots

    # def get_available_slots(self, date):
    #     """Get available slots for the doctor on a specific date, excluding breaks and booked slots."""
    #     all_slots = self.generate_slots()
    #     booked_slots = Appointment.objects.filter(doctor=self, date=date, status='Booked').values_list('slot', flat=True)
    #     available_slots = [slot for slot in all_slots if slot not in booked_slots]
    #     return available_slots


class Appointment(models.Model):
    """Appointment model to store scheduled appointments."""
    STATUS_CHOICES = [
        ('Booked', 'Booked'),
        ('Cancelled', 'Cancelled'),
        ('Completed', 'Completed'),
    ]

    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name="appointments")
    date = models.DateField()  # Example: "2024-12-12"
    slot = models.CharField(max_length=20)  # Example: "09:00-09:15"
    patient_name = models.CharField(max_length=100)  # Example: "Jane Smith"
    patient_contact = models.CharField(max_length=15, blank=True, null=True)  # Example: "+1234567890"
    symptoms = models.TextField(blank=True, null=True)  # Example: "Fever, headache"
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Booked')

    def __str__(self):
        return f"Appointment with Dr. {self.doctor.name} on {self.date} at {self.slot}"


class PersonaInstruction(models.Model):
    """Persona instruction model to store instructions for a specific persona."""
    persona = models.CharField(max_length=100, unique=True)
    instruction = models.TextField()

    def __str__(self):
        return self.persona
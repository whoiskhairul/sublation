import random
from faker import Faker
from appointment_chatbot.models import Doctor
# Initialize Faker
faker = Faker()

# Create fake data for the Doctor model
def populate_doctors(n):
    genders = ['Male', 'Female', 'Other']  # Gender choices
    specializations = [
        'Cardiologist', 'Dentist', 'Pediatrician', 'Orthopedic',
        'Neurologist', 'Dermatologist', 'Ophthalmologist', 'Psychiatrist',
        'General Surgeon', 'Gynecologist', 'Oncologist', 'Radiologist',
        'Pulmonologist', 'ENT Specialist', 'Gastroenterologist'
    ]
    languages = ['English', 'Spanish', 'French', 'German']

    for _ in range(n):
        doctor = Doctor(
            name=faker.name(),
            email=faker.unique.email(),
            phone_number=faker.phone_number(),
            gender=random.choice(genders),
            specialization=random.choice(specializations),
            clinic_name=faker.company(),
            clinic_address=faker.address(),
            
        )
        doctor.save()

# Populate 10 fake doctors
populate_doctors(10)

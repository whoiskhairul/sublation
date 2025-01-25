from django.http import JsonResponse
from django.shortcuts import render
from django.core.serializers import serialize
from django.views.decorators.csrf import csrf_exempt
import json

from django.conf import settings

import openai

from .models import Appointment, Doctor, PersonaInstruction

openai.api_key = settings.OPENAI_API_KEY
client = openai.OpenAI(api_key = settings.OPENAI_API_KEY)

# Create your views here.

# This view just loads the chatbot page 
def chatbot_page(request, *args, **kwargs):
    # print(PersonaInstruction.objects.get(persona="PatientChatBot").instruction)

    request.session['conversation'] = []
    # return render(request, 'appointment_chatbot/chatbot_page.html')
    return render(request, 'appointment_chatbot/testing.html')

@csrf_exempt
def chatbot_response(request):
    if request.method == "POST":
        try:
            # Parse the user message from the request
            data = json.loads(request.body)
            instruction = PersonaInstruction.objects.get(persona="BPMNGenerator").instruction
            print(instruction)
            user_message = data.get("message", "")

            #getting information from the database of doctors
            doctors = Doctor.objects.all()
            doctors = serialize('json', doctors)
            # print(doctors)

            

            # Store the user message in the session for later reference
            conversation = request.session.get('conversation')
            conversation.append({"role": "user", "content": user_message})
            request.session['conversation'] = conversation
            # print(request.session.get('conversation'))


            if not user_message:
                return JsonResponse({"error": "Message cannot be empty."}, status=400)
            
            prompts=[
                    {"role": "system", "content": instruction},
                    {"role": "system", "content": doctors},
                ]
            prompts.extend(request.session.get('conversation'))

            # Generate a response using the OpenAI ChatCompletion API
            response = client.chat.completions.create(
                model="gpt-4o", 
                messages=prompts
                )

            bot_message = response.choices[0].message.content
            print(bot_message)
            if '```json' in bot_message:
                try:
                    parsed_data = bot_message.split("```json")[1].split('```')[0]
                    print(parsed_data)
                    doctor_name = json.loads(parsed_data).get('doctors_name')
                    date = json.loads(parsed_data).get('date')
                    slot = json.loads(parsed_data).get('slot')
                    patient_name = json.loads(parsed_data).get('patient_name')
                    patient_contact = json.loads(parsed_data).get('patient_phone')
                    patient_email = json.loads(parsed_data).get('patient_email')

                    symptoms = json.loads(parsed_data).get('symptoms')
                    status = 'Booked'

                    try:
                        # Check if the doctor exists in the database
                        doctor_instance = Doctor.objects.get(name=doctor_name)
                    except:
                        doctor_instance = Doctor.objects.get(name=doctor_name.split('Dr. ')[1])
                    
                    # Create a new appointment object and save it to the database
                    obj = Appointment.objects.create(
                    doctor=doctor_instance,
                    date= date,
                    slot= slot,
                    patient_name=patient_name,
                    patient_contact=patient_contact,
                    symptoms=symptoms,
                    status=status
                    )
                    
                    if obj:
                        send_appointment_email(doctor_name, patient_name, patient_contact, date, slot, patient_email, symptoms)
                        conversation.append({"role": "assistant", "content": "write: 'Your appointment has been successfully booked. You will receive an email confirmation shortly.'"}) 
                    else:
                        conversation.append({"role": "assistant", "content": "Sorry, I was not able to book the appointment. Please try again."})
                    
                except Exception as e:
                        print(e)
            else:
                paragraphs = bot_message.split("\n")
                bot_message = "<br>".join([f"{para.strip()}" for para in paragraphs if para.strip()])
                

                # Store the bot message in the session for later reference
                conversation = request.session.get('conversation')
                conversation.append({"role": "assistant", "content": bot_message})
                request.session['conversation'] = conversation

            if '```json' in bot_message:
                return JsonResponse({"reply": "Your appointment has been successfully booked. You will receive an email confirmation shortly."})
            else:
                return JsonResponse({"reply": bot_message})

        except Exception as e:
            print(e)
            # Handle OpenAI API errors
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method. Only POST allowed."}, status=405)



from django.core.mail import send_mail
from django.conf import settings

def send_appointment_email(doctor_name, patient_name, patient_contact, date, slot, patient_email, symptoms):
    subject = 'Appointment Confirmation'
    message = f"Hello {patient_name},\n\nYour appointment has been successfully booked.\n\nDoctor: {doctor_name}\nDate: {date}\nTime: {slot}\nsymptoms:{symptoms}\n\nThank you!\n\nBest Regards,\nSalus"
    recipient_email = patient_email  # Assuming patient_contact is their email
    print(patient_email)

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [recipient_email],
        fail_silently=False,
    )


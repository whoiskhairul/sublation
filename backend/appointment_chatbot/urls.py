from django.urls import path
from . import views

urlpatterns = [
    # Add your URL patterns here
    path('', views.chatbot_page, name='chatbot_page'), #renders chatbot page
    path('chat/', views.chatbot_response, name='chatbot_response'), # handles user input and returns response from the chatbot
    path('testing/', views.chatbot_page, name='testing_chatbot_page'), #renders chatbot page

]
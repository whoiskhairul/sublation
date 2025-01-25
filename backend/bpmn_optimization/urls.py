from django.urls import path
from . import views

urlpatterns = [
    path('scope/', views.detect_optimization_scope, name='detect_optimization_scope'),
    path('apply/', views.apply_optimizations, name='apply_optimizations'),
]

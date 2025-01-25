from django.urls import path, include
from django.contrib.auth import views as auth_views


from rest_framework_simplejwt.views import ( TokenObtainPairView, TokenRefreshView)

from authentication.views import protected_view


urlpatterns = [
    # dj-rest-auth endpoints
    path('dj-rest-auth/', include('dj_rest_auth.urls')),
    path('dj-rest-auth/registration/', include('dj_rest_auth.registration.urls')),

    # For social auth endpoints
    path('dj-rest-auth/google/', include('allauth.socialaccount.providers.google.urls')),

    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('api/protected/', protected_view, name='protected_view'),

     # Add password reset URL patterns
    path('dj-rest-auth/password/reset/', auth_views.PasswordResetView.as_view(), name='password_reset'),
    path('dj-rest-auth/password/reset/done/', auth_views.PasswordResetDoneView.as_view(), name='password_reset_done'),
    path('dj-rest-auth/password/reset/confirm/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('dj-rest-auth/password/reset/complete/', auth_views.PasswordResetCompleteView.as_view(), name='password_reset_complete'),
]
    


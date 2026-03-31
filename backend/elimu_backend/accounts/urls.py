from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    LoginView,
    RegisterView,
    get_current_user,
    update_profile,
    logout_view
)

app_name = 'accounts'

urlpatterns = [
    # Authentication
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', logout_view, name='logout'),
    
    # User Profile
    path('me/', get_current_user, name='current_user'),
    path('profile/', update_profile, name='update_profile'),
]

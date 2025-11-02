from django.urls import path
from django.contrib.auth import views as auth_views
from . import views


urlpatterns = [
    path('login/', auth_views.LoginView.as_view(template_name='registration/login.html'), name='login'),
    path('logout/instant/', views.instant_logout, name='instant_logout'),
    path('register/', views.register, name='register'),
   
]
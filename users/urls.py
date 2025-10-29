from django.urls import path
from django.contrib.auth import views as auth_views
from . import views


urlpatterns = [
    path('login/', auth_views.LoginView.as_view(template_name='registration/login.html'), name='login'),
    # path('register/', auth_views.LoginView.as_view(template_name='registration/register.html'), name='register'),
    # path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('logout/instant/', views.instant_logout, name='instant_logout'),
    path('register/', views.register, name='register'),
   
]
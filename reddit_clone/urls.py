from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.views.generic import RedirectView
from django.contrib.auth import views as auth_views
from django.contrib.auth import logout
from django.shortcuts import redirect
from django.conf import settings
from django.conf.urls.static import static

def instant_logout(request):
    logout(request)
    return redirect('home')


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('home.urls')),
    path('posts/', include('posts.urls')),
    path('communities/', include('communities.urls')),
    path('comments/', include('comments.urls')),
    path('users/', include('users.urls')), 
     path('login/', auth_views.LoginView.as_view(template_name='registration/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='post_list'), name='logout'),

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)


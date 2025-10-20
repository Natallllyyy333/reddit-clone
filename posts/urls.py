from django.urls import path
from . import views

urlpatterns = [
    path('', views.post_list, name='post_list'),
    path('create/', views.create_post, name='create_post'),
    path('<int:pk>/', views.post_detail, name='post_detail'),
    path('<int:post_id>/vote/<str:vote_type>/', views.vote_post, name='vote_post'),
]
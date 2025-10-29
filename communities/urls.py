from django.urls import path
from . import views

app_name = 'communities'

urlpatterns = [
    path('', views.community_list, name='community_list'),
    path('create/', views.create_community, name='create_community'),
    path('my/', views.my_communities, name='my_communities'),
    path('<str:community_name>/', views.community_detail, name='community_detail'),
    path('<str:community_name>/join/', views.join_community, name='join_community'),
    path('<str:community_name>/leave/', views.leave_community, name='leave_community'),
]
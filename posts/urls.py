from django.urls import path
from .views import PostListView, PostDetailView, PostCreateView, vote_post
from . import views

urlpatterns = [
    path('', PostListView.as_view(), name='post_list'),
    path('<int:pk>/', PostDetailView.as_view(), name='post_detail'),
    path('create/', PostCreateView.as_view(), name='create_post'),
    path('<int:pk>/vote/<str:vote_type>/', vote_post, name='vote_post'),
    path('<int:post_id>/share/', views.share_post, name='share_post'),
]
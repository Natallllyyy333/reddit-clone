from django.urls import path
from .views import PostListView, PostDetailView, PostCreateView, vote_post

urlpatterns = [
    path('', PostListView.as_view(), name='post_list'),
    path('<int:pk>/', PostDetailView.as_view(), name='post_detail'),
    path('create/', PostCreateView.as_view(), name='create_post'),
    path('<int:pk>/vote/<str:vote_type>/', vote_post, name='vote_post'),
]
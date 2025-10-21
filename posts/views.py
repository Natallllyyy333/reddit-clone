from django.shortcuts import render, get_object_or_404, redirect
from django.views.generic import ListView, DetailView, CreateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.decorators import login_required
from django.urls import reverse_lazy
from django.http import JsonResponse
from .models import Post

class PostListView(ListView):
    model = Post
    template_name = 'posts/post_list.html'
    context_object_name = 'posts'
    ordering = ['-created_at']
    paginate_by = 10

class PostDetailView(DetailView):
    model = Post
    template_name = 'posts/post_detail.html'
    context_object_name = 'post'

class PostCreateView(LoginRequiredMixin, CreateView):
    model = Post
    template_name = 'posts/post_form.html'
    fields = ['title', 'content']
    success_url = reverse_lazy('post_list')
    
    def form_valid(self, form):
        form.instance.author = self.request.user
        return super().form_valid(form)

@login_required
def vote_post(request, pk, vote_type):
    post = get_object_or_404(Post, pk=pk)
    
    if vote_type == 'upvote':
        if post.downvotes.filter(id=request.user.id).exists():
            post.downvotes.remove(request.user)
        if post.upvotes.filter(id=request.user.id).exists():
            post.upvotes.remove(request.user)
        else:
            post.upvotes.add(request.user)
    
    elif vote_type == 'downvote':
        if post.upvotes.filter(id=request.user.id).exists():
            post.upvotes.remove(request.user)
        if post.downvotes.filter(id=request.user.id).exists():
            post.downvotes.remove(request.user)
        else:
            post.downvotes.add(request.user)
    
    # Для AJAX запросов возвращаем JSON
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return JsonResponse({
            'total_votes': post.total_votes(),
            'user_vote': post.user_vote(request.user)
        })
    
    return redirect('post_list')
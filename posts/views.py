from django.shortcuts import render, get_object_or_404, redirect
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.decorators import login_required
from django.urls import reverse_lazy
from django.http import JsonResponse
from django.contrib import messages
from django.views.decorators.http import require_POST
from .models import Post, Comment, PostMedia
from .forms import PostForm, CommentForm

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
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['comments'] = self.object.comments.all().order_by('-created_at')
        context['comment_form'] = CommentForm()
        return context
    
    def post(self, request, *args, **kwargs):
        self.object = self.get_object()
        
        if 'content' in request.POST and request.user.is_authenticated:
            comment_form = CommentForm(request.POST)
            if comment_form.is_valid():
                comment = comment_form.save(commit=False)
                comment.post = self.object
                comment.author = request.user
                comment.save()
                messages.success(request, 'Comment added successfully.')
            else:
                messages.error(request, 'Error adding comment.')
        
        return redirect('post_detail', pk=self.object.pk)

class PostCreateView(LoginRequiredMixin, CreateView):
    model = Post
    form_class = PostForm
    template_name = 'posts/create_post.html'
    success_url = reverse_lazy('post_list')
    
    def form_valid(self, form):
        form.instance.author = self.request.user
        post = form.save(commit=False)
        post.media_file = None
        post.media_type = 'none'
        post.save()
        
        media_files = self.request.FILES.getlist('media_files')
        for media_file in media_files:
            if media_file:
                PostMedia.objects.create(post=post, media_file=media_file)
        
        messages.success(self.request, 'Post created successfully!')
        return redirect(self.success_url)

class PostUpdateView(LoginRequiredMixin, UpdateView):
    model = Post
    form_class = PostForm
    template_name = 'posts/post_edit.html'
    
    def get_queryset(self):
        return Post.objects.filter(author=self.request.user)
    
    def get_success_url(self):
        return reverse_lazy('post_detail', kwargs={'pk': self.object.pk})
    
    def form_valid(self, form):
        messages.success(self.request, 'Post updated successfully!')
        return super().form_valid(form)

class PostDeleteView(LoginRequiredMixin, DeleteView):
    model = Post
    template_name = 'posts/post_delete.html'
    success_url = reverse_lazy('post_list')
    
    def get_queryset(self):
        return Post.objects.filter(author=self.request.user)
    
    def delete(self, request, *args, **kwargs):
        messages.success(request, 'Post deleted successfully!')
        return super().delete(request, *args, **kwargs)

@require_POST
@login_required
def vote_post(request, pk, vote_type):
    post = get_object_or_404(Post, pk=pk)
    
    if vote_type == 'upvote':
        if post.upvotes.filter(id=request.user.id).exists():
            post.upvotes.remove(request.user)
        else:
            post.upvotes.add(request.user)
            post.downvotes.remove(request.user)
    elif vote_type == 'downvote':
        if post.downvotes.filter(id=request.user.id).exists():
            post.downvotes.remove(request.user)
        else:
            post.downvotes.add(request.user)
            post.upvotes.remove(request.user)
    
    # Простой возврат JSON
    return JsonResponse({
        'total_votes': post.total_votes(),
        'user_vote': post.user_vote(request.user)
    })

    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'total_votes': post.total_votes(),
                'user_vote': post.user_vote(request.user)
            })
    else:
            # Если не AJAX, редиректим обратно
            return redirect(request.META.get('HTTP_REFERER', 'post_list'))

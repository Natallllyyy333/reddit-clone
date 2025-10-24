from django.shortcuts import render, get_object_or_404, redirect
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.decorators import login_required
from django.urls import reverse_lazy
from django.http import JsonResponse
from django.contrib import messages
from .models import Post, Comment, Share, PostMedia
from .forms import PostForm, CommentForm
from django.views.decorators.http import require_POST

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
        
        # Обработка комментариев
        if 'content' in request.POST:
            if not request.user.is_authenticated:
                messages.error(request, 'You need to log in to comment.')
                return redirect('login')
            
            comment_form = CommentForm(request.POST)
            if comment_form.is_valid():
                comment = comment_form.save(commit=False)
                comment.post = self.object
                comment.author = request.user
                comment.save()
                messages.success(request, 'Comment added successfully.')
                return redirect('post_detail', pk=self.object.pk)
            else:
                # Если форма невалидна, показываем ошибки
                messages.error(request, 'Error adding comment. Please check your input.')
        
        return self.get(request, *args, **kwargs)

class PostCreateView(LoginRequiredMixin, CreateView):
    model = Post
    form_class = PostForm 
    template_name = 'posts/create_post.html'
    success_url = reverse_lazy('post_list')
    
    def form_valid(self, form):
        form.instance.author = self.request.user
        
        # Сохраняем пост БЕЗ медиафайла в старое поле
        post = form.save(commit=False)
        post.media_file = None  # Убедимся что старое поле пустое
        post.media_type = 'none'
        post.save()
        
        # Обрабатываем множественные файлы через PostMedia
        media_files = self.request.FILES.getlist('media_files')
        for media_file in media_files:
            if media_file:
                PostMedia.objects.create(
                    post=post,
                    media_file=media_file
                )
        
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

# ========== ИСПРАВЛЕННАЯ ФУНКЦИЯ ЛАЙКОВ (ОДНА ВЕРСИЯ) ==========
@require_POST
@login_required
def vote_post(request, pk, vote_type):
    post = get_object_or_404(Post, pk=pk)
    
    if vote_type == 'upvote':
        if post.upvotes.filter(id=request.user.id).exists():
            post.upvotes.remove(request.user)
            action = 'removed_upvote'
        else:
            post.upvotes.add(request.user)
            post.downvotes.remove(request.user)
            action = 'added_upvote'
    elif vote_type == 'downvote':
        if post.downvotes.filter(id=request.user.id).exists():
            post.downvotes.remove(request.user)
            action = 'removed_downvote'
        else:
            post.downvotes.add(request.user)
            post.upvotes.remove(request.user)
            action = 'added_downvote'
    else:
        return JsonResponse({'error': 'Invalid vote type'}, status=400)
    
    # Для AJAX запросов возвращаем JSON
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({
            'total_votes': post.total_votes(),
            'user_vote': post.user_vote(request.user),
            'action': action
        })
    
    # Для обычных запросов редирект
    referer = request.META.get('HTTP_REFERER', 'post_list')
    if 'post_detail' in referer:
        return redirect('post_detail', pk=post.pk)
    else:
        return redirect('post_list')

@login_required
def share_post(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    
    if request.method == 'POST':
        platform = request.POST.get('platform', '')
        
        # Create share record
        share, created = Share.objects.get_or_create(
            post=post,
            user=request.user,
            defaults={'shared_to': platform}
        )
        
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'success': True,
                'shares_count': post.shares.count(),
                'message': 'Post shared successfully!'
            })
        
        return redirect('post_detail', pk=post.id)
    
    # For GET requests, show share options
    context = {
        'post': post,
        'share_url': request.build_absolute_uri(post.get_absolute_url())
    }
    return render(request, 'posts/share_modal.html', context)
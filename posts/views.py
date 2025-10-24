from django.shortcuts import render, get_object_or_404, redirect
from django.views.generic import ListView, DetailView, CreateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.decorators import login_required
from django.urls import reverse_lazy
from django.http import JsonResponse
from .models import Post, Comment, Share, PostMedia
from comments.models import Comment  # Импортируем Comment из comments
from .forms import PostForm 

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
        # ИСПРАВЛЕНО: используем post_comments вместо comments
        context['comments'] = self.object.comments.all().order_by('-created_at')
        return context
    
    def post(self, request, *args, **kwargs):
        post = self.get_object()
        if request.user.is_authenticated:
            content = request.POST.get('content')
            if content:
                Comment.objects.create(
                    post=post,
                    author=request.user,
                    content=content
                )
        return self.get(request, *args, **kwargs)

class PostCreateView(LoginRequiredMixin, CreateView):
    model = Post
    form_class = PostForm 
    template_name = 'posts/create_post.html'
    # fields = ['title', 'content', 'community', 'media_file']
    success_url = reverse_lazy('post_list')
    
    def form_valid(self, form):
        form.instance.author = self.request.user

        # # Обрабатываем загрузку файла
        # print("=== DEBUG CREATE POST ===")
        # print(f"FILES в запросе: {self.request.FILES}")
        # if self.request.FILES.get('media_file'):
        #     file = self.request.FILES['media_file']
        #     print(f"Файл получен: {file.name}, размер: {file.size}, тип: {file.content_type}")
        # else:
        #     print("Файл НЕ получен в запросе!")
        # print("========================")
        
        response = super().form_valid(form)
        media_files = self.request.FILES.getlist('media_files')
        for media_file in media_files:
            if media_file:
                PostMedia.objects.create(
                    post=form.instance,
                    media_file=media_file
                )
        
        return response
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
        
        return redirect('posts:post_detail', post_id=post.id)
    
    # For GET requests, show share options
    context = {
        'post': post,
        'share_url': request.build_absolute_uri(post.get_absolute_url())
    }
    return render(request, 'posts/share_modal.html', context)

def create_post(request):
    if request.method == 'POST':
        form = PostForm(request.POST, request.FILES)
        if form.is_valid():
            post = form.save(commit=False)
            post.author = request.user
            post.save()
            
            # Файлы автоматически сохраняются через форму
            return redirect('post_detail', pk=post.pk)
    else:
        form = PostForm()
    
    return render(request, 'posts/create_post.html', {'form': form})
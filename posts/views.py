from django.shortcuts import render, get_object_or_404, redirect
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.decorators import login_required
from django.urls import reverse_lazy
from django.http import JsonResponse
from django.contrib import messages
from django.views.decorators.http import require_POST
from django.db import transaction
from .models import Post, PostMedia, Share
from .forms import PostForm, CommentForm
from django.conf import settings
from comments.models import Comment





class PostListView(ListView):
    model = Post
    template_name = 'posts/post_list.html'
    context_object_name = 'posts'
    ordering = ['-created_at']
    paginate_by = 10

class PostDetailView(DetailView):
    model = Post
    template_name = 'posts/post_detail.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        post = self.object
        
        # Get comments and pass the current user
        comments = post.comments.all()
        for comment in comments:
            comment._current_user = self.request.user
            
        context['comments'] = comments
        
        # Comment form (if needed)
        from comments.forms import CommentForm  
        context['comment_form'] = CommentForm()
        
        return context
    
    def post(self, request, *args, **kwargs):
        """Processing the addition of a comment through the detail page"""
        self.object = self.get_object()
        
        # Checking authentication
        if not request.user.is_authenticated:
            messages.error(request, 'Please log in to comment.')
            return redirect('login')
        
        # Processing the comment
        form = CommentForm(request.POST)
        if form.is_valid():
            Comment.objects.create(
                post=self.object,
                author=request.user,
                content=form.cleaned_data['content']
            )
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
        post = form.save()
        
        media_files = self.request.FILES.getlist('media_files')
        print(f"🔄 Processing {len(media_files)} media files")

        for media_file in media_files:
            if media_file:
                print(f"🔄 Creating PostMedia for: {media_file.name}")
                
                try:
                    # Просто создаем PostMedia с media_file
                    post_media = PostMedia.objects.create(
                        post=post, 
                        media_file=media_file
                    )
                    print(f"✅ Media created: {post_media.media_type} - {post_media.get_cloudinary_url()}")
                        
                except Exception as e:
                    print(f"❌ ERROR creating media: {str(e)}")
                    continue
        
        messages.success(self.request, 'Post created successfully!')
        return redirect(self.success_url)  
     
    def form_invalid(self, form):
        messages.error(self.request, 'Error creating post. Please check the form.')
        return super().form_invalid(form)

class PostUpdateView(LoginRequiredMixin, UpdateView):
    model = Post
    form_class = PostForm
    template_name = 'posts/post_edit.html'
    
    def get_queryset(self):
        if self.request.user.is_staff or self.request.user.is_superuser:
            return Post.objects.all()
        return Post.objects.filter(author=self.request.user)


    def get_success_url(self):
        return reverse_lazy('post_detail', kwargs={'pk': self.object.pk})
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Adding existing media files to the context
        context['existing_media'] = self.object.media_files.all()
        context['is_moderator_action'] = self.request.user != self.object.author and (self.request.user.is_staff or self.request.user.is_superuser)
        return context
    
    def form_valid(self, form):
        post = form.save()
        # Processing media file deletion
        delete_media_ids = self.request.POST.getlist('delete_media')
        if delete_media_ids:
            PostMedia.objects.filter(id__in=delete_media_ids, post=post).delete()
        
        # Adding new media files
        media_files = self.request.FILES.getlist('media_files')
        for media_file in media_files:
            if media_file:
                PostMedia.objects.create(post=post, media_file=media_file)
        
        messages.success(self.request, 'Post updated successfully!')
        return redirect(self.get_success_url())
    
    def form_invalid(self, form):
        messages.error(self.request, 'Error updating post. Please check the form.')
        return super().form_invalid(form)
    
    def dispatch(self, request, *args, **kwargs):
        # Additional verification that the user is the author of the post
        response = super().dispatch(request, *args, **kwargs)
        if hasattr(self, 'object') and self.object:
            if request.user != self.object.author and (request.user.is_staff or request.user.is_superuser):
                messages.info(request, f'You are editing the post of user {self.object.author.username} as a moderator')
        return response

class PostDeleteView(LoginRequiredMixin, DeleteView):
    model = Post
    template_name = 'posts/post_delete.html'
    success_url = reverse_lazy('post_list')
    
    def get_queryset(self):
        if self.request.user.is_staff or self.request.user.is_superuser:
            return Post.objects.all()
        return Post.objects.filter(author=self.request.user)
    
    def form_valid(self, form):
        form.instance.author = self.request.user
        post = form.save()
        
        media_files = self.request.FILES.getlist('media_files')
        print(f"🔄 Processing {len(media_files)} media files")

        for media_file in media_files:
            if media_file:
                print(f"🔄 Creating PostMedia for: {media_file.name}")
                
                # Определяем тип файла
                file_extension = media_file.name.lower().split('.')[-1]
                
                try:
                    if file_extension in ['mp4', 'mov', 'avi']:
                        # Это видео
                        post_media = PostMedia.objects.create(
                            post=post, 
                            video_file=media_file,
                            media_type='video'
                        )
                        print(f"✅ Video created: {post_media.video_file.url}")
                    else:
                        # Это изображение
                        post_media = PostMedia.objects.create(
                            post=post, 
                            image_file=media_file,
                            media_type='image'
                        )
                        print(f"✅ Image created: {post_media.image_file.url}")
                        
                except Exception as e:
                    print(f"❌ ERROR: {str(e)}")
                    continue
        
        messages.success(self.request, 'Post created successfully!')
        return redirect(self.success_url)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['is_moderator_action'] = self.request.user != self.object.author and (self.request.user.is_staff or self.request.user.is_superuser)
        return context
    
   
@require_POST
# @login_required
@require_POST
def vote_post(request, pk, vote_type):
    referer = request.META.get('HTTP_REFERER', '/posts/')
    
    # Authentication check
    if not request.user.is_authenticated:
        referer = request.META.get('HTTP_REFERER', '/')
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'error': 'Authentication required',
                'status': 'error',
                'message': 'Please log in to vote.',
                'login_url': f'/users/login/?next={referer}'
            }, status=401)
        else:
            messages.error(request, 'Please log in to vote.')
            return redirect(f'/users/login/?next={referer}')

    post = get_object_or_404(Post, pk=pk)
    
    try:
        action = None
        if vote_type == 'upvote':
            if post.upvotes.filter(id=request.user.id).exists():
                post.upvotes.remove(request.user)
                action = 'removed upvote'
            else:
                post.upvotes.add(request.user)
                post.downvotes.remove(request.user)
                action = 'upvoted'
        elif vote_type == 'downvote':
            if post.downvotes.filter(id=request.user.id).exists():
                post.downvotes.remove(request.user)
                action = 'removed downvote'
            else:
                post.downvotes.add(request.user)
                post.upvotes.remove(request.user)
                action = 'downvoted'
        
        # Updating the object from the database
        post.refresh_from_db()
        
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'total_votes': post.total_votes(),
                'user_vote': post.user_vote(request.user),
                'status': 'success',
                'message': f'Successfully {action}'
            })
        else:
            messages.success(request, f'Successfully {action}')
            return redirect(referer)
            
    except Exception as e:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'error': str(e),
                'status': 'error',
                'message': 'Error processing vote'
            }, status=500)
        else:
            messages.error(request, 'Error processing vote')
            return redirect(referer)
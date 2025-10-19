from django.shortcuts import render, redirect, get_object_or_404
from .models import Post
from .forms import PostForm
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
# Create your views here.


def post_list(request):
    posts = Post.objects.all().order_by('-created_at')
    return render(request, 'posts/list.html', {'posts': posts})

@login_required
def create_post(request):
    if request.method == 'POST':
        form = PostForm(request.POST)
        if form.is_valid():
            post = form.save(commit=False)
            post.author = request.user
            post.save()
            return redirect('post_list')
    else:
        form = PostForm()
    return render(request, 'posts/create.html', {'form': form})
@login_required
def vote_post(request, post_id, vote_type):
    post = get_object_or_404(Post, id=post_id)
    
    if vote_type == 'upvote':
        if request.user in post.downvotes.all():
            post.downvotes.remove(request.user)
        post.upvotes.add(request.user)
    elif vote_type == 'downvote':
        if request.user in post.upvotes.all():
            post.upvotes.remove(request.user)
        post.downvotes.add(request.user)
    elif vote_type == 'remove_vote':
        post.upvotes.remove(request.user)
        post.downvotes.remove(request.user)
    
    post.save()
    
    return JsonResponse({
        'score': post.score,
        'upvotes': post.upvotes.count(),
        'downvotes': post.downvotes.count()
    })
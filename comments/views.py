from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.utils import timezone
from .models import Comment
from posts.models import Post

@login_required
def add_comment(request, post_id):
    """Adding a comment to the post"""
    post = get_object_or_404(Post, id=post_id)
    
    if request.method == 'POST':
        content = request.POST.get('content', '').strip()
        
        if content:
            Comment.objects.create(
                post=post,
                author=request.user,
                content=content
            )
            messages.success(request, 'Comment added successfully.')
        else:
            messages.error(request, 'Comment cannot be empty')
    
    return redirect('post_detail', pk=post_id)

@login_required
def edit_comment(request, comment_id):
    """Editing a comment"""
    comment = get_object_or_404(Comment, id=comment_id)
    
    # Setting the current user to check permissions
    comment._current_user = request.user
    
    # Checking edit permissions (now it's a property, not a method)
    if not comment.can_edit:
        messages.error(request, 'You do not have permission to edit this comment')
        return redirect('post_detail', pk=comment.post.id)
    
    if request.method == 'POST':
        content = request.POST.get('content', '').strip()
        
        if content:
            comment.content = content
            comment.save()
            messages.success(request, 'Comment updated')
        else:
            messages.error(request, 'The comment cannot be empty')
        
        return redirect('post_detail', pk=comment.post.id)
    
    # GET request - displaying the edit form
    return render(request, 'comments/edit_comment.html', {
        'comment': comment
    })

@login_required
def delete_comment(request, comment_id):
    """Delete comment"""
    if request.method == 'POST':  
        comment = get_object_or_404(Comment, id=comment_id)
        comment._current_user = request.user
        
        if not comment.can_delete:
            messages.error(request, 'You do not have permission to delete this comment')
            return redirect('post_detail', pk=comment.post.id)
        
        post_id = comment.post.id
        comment.delete()
        messages.success(request, 'Comment deleted successfully')
        return redirect('post_detail', pk=post_id)
    
    # If a non-POST request was received
    return redirect('post_list')
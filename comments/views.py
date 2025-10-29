from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.utils import timezone
from .models import Comment
from posts.models import Post

@login_required
def add_comment(request, post_id):
    """Добавление комментария к посту"""
    post = get_object_or_404(Post, id=post_id)
    
    if request.method == 'POST':
        content = request.POST.get('content', '').strip()
        
        if content:
            Comment.objects.create(
                post=post,
                author=request.user,
                content=content
            )
            messages.success(request, 'Комментарий добавлен')
        else:
            messages.error(request, 'Комментарий не может быть пустым')
    
    return redirect('post_detail', pk=post_id)

@login_required
def edit_comment(request, comment_id):
    """Редактирование комментария"""
    comment = get_object_or_404(Comment, id=comment_id)
    
    # Устанавливаем текущего пользователя для проверки прав
    comment._current_user = request.user
    
    # Проверяем права на редактирование (теперь это свойство, а не метод)
    if not comment.can_edit:
        messages.error(request, 'У вас нет прав для редактирования этого комментария')
        return redirect('post_detail', pk=comment.post.id)
    
    if request.method == 'POST':
        content = request.POST.get('content', '').strip()
        
        if content:
            comment.content = content
            comment.save()
            messages.success(request, 'Комментарий обновлен')
        else:
            messages.error(request, 'Комментарий не может быть пустым')
        
        return redirect('post_detail', pk=comment.post.id)
    
    # GET запрос - показываем форму редактирования
    return render(request, 'comments/edit_comment.html', {
        'comment': comment
    })

@login_required
def delete_comment(request, comment_id):
    """Удаление комментария"""
    if request.method == 'POST':  # Убедитесь, что проверяется POST
        comment = get_object_or_404(Comment, id=comment_id)
        comment._current_user = request.user
        
        if not comment.can_delete:
            messages.error(request, 'You do not have permission to delete this comment')
            return redirect('post_detail', pk=comment.post.id)
        
        post_id = comment.post.id
        comment.delete()
        messages.success(request, 'Comment deleted successfully')
        return redirect('post_detail', pk=post_id)
    
    # Если пришел не POST запрос
    return redirect('post_list')
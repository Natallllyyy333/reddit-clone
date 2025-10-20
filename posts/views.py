from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from .models import Post
from .forms import PostForm

def post_list(request):
    """Список всех постов"""
    posts = Post.objects.all().order_by('-created_at')
    return render(request, 'posts/post_list.html', {'posts': posts})

def post_detail(request, pk):
    """Детальная страница поста"""
    post = get_object_or_404(Post, pk=pk)
    return render(request, 'posts/post_detail.html', {'post': post})

@login_required
def create_post(request):
    """Создание нового поста"""
    if request.method == 'POST':
        form = PostForm(request.POST)
        if form.is_valid():
            try:
                # Создаем объект но не сохраняем сразу
                post = form.save(commit=False)
                post.author = request.user
                
                # Сохраняем чтобы получить id
                post.save()
                
                # Теперь можно работать с ManyToMany полями
                form.save_m2m()
                
                messages.success(request, 'Пост успешно создан!')
                return redirect('post_detail', pk=post.pk)
                
            except Exception as e:
                messages.error(request, f'Ошибка при создании поста: {e}')
        else:
            messages.error(request, 'Пожалуйста, исправьте ошибки в форме.')
    else:
        form = PostForm()
    
    return render(request, 'posts/create_post.html', {'form': form})

@login_required
@require_http_methods(["POST"])
def vote_post(request, post_id, vote_type):
    """Обработка голосования за пост"""
    try:
        post = get_object_or_404(Post, id=post_id)
        
        if vote_type == 'upvote':
            post.upvote(request.user)
        elif vote_type == 'downvote':
            post.downvote(request.user)
        elif vote_type == 'remove':
            post.remove_vote(request.user)
        else:
            return JsonResponse({
                'success': False,
                'error': 'Неверный тип голоса'
            }, status=400)
        
        return JsonResponse({
            'success': True,
            'score': post.score,
            'upvotes': post.upvotes.count(),
            'downvotes': post.downvotes.count()
        })
        
    except Post.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Пост не найден'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': 'Внутренняя ошибка сервера'
        }, status=500)
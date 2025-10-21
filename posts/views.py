from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from .models import Post

@login_required
@require_http_methods(["POST"])
def vote_post(request, post_id, vote_type):
    """Обработка голосования за пост"""
    try:
        post = Post.objects.get(id=post_id)
        print(f"Vote received: post_id={post_id}, vote_type={vote_type}, user={request.user}")  # Для отладки
        
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
        
        # Обновляем данные поста
        post.refresh_from_db()
        
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
        print(f"Vote error: {e}")  # Для отладки
        return JsonResponse({
            'success': False,
            'error': 'Внутренняя ошибка сервера'
        }, status=500)
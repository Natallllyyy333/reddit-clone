from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Count
from django.views.decorators.http import require_http_methods
from django.core.exceptions import PermissionDenied
from django.db import transaction
import logging
from .models import Community
from .forms import CommunityForm
from posts.models import Post

logger = logging.getLogger(__name__)


def community_list(request):
    try:
        communities = Community.objects.annotate(
            post_count=Count('posts'),
            member_count=Count('members')
        ).order_by('-member_count')[:20]
        
        return render(request, 'communities/community_list.html', {
            'communities': communities
        })
    except Exception as e:
        logger.error(f"Error fetching community list: {e}")
        messages.error(request, "Communities list loading error.")
        return render(request, 'communities/community_list.html', {
            'communities': []
        })

def community_detail(request, community_name):
    try:
        community = get_object_or_404(Community, name=community_name)
        posts = community.posts.select_related('author').prefetch_related('upvotes', 'downvotes')
        
        is_member = False
        is_moderator = False
        
        if request.user.is_authenticated:
            is_member = request.user in community.members.all()
            is_moderator = community.is_moderator(request.user)
        
        return render(request, 'communities/community_detail.html', {
            'community': community,
            'posts': posts,
            'is_member': is_member,
            'is_moderator': is_moderator
        })
    except Exception as e:
        logger.error(f"Error loading community {community_name}: {e}")
        messages.error(request, "Community loading error.")
        return redirect('communities:community_list')

@login_required
@require_http_methods(["GET", "POST"])
def create_community(request):
    if request.method == 'POST':
        form = CommunityForm(request.POST)
        if form.is_valid():
            try:
                community = form.save(commit=False)
                community.created_by = request.user
                community.save()
                
                # Создатель автоматически становится модератором и участником
                community.moderators.add(request.user)
                community.members.add(request.user)
                
                messages.success(request, f'Community r/{community.name} created!')
                return redirect('community_detail', community_name=community.name)
            except Exception as e:
                logger.error(f"Error creating community: {e}")
                messages.error(request, "Community create error.")
    else:
        form = CommunityForm()
    
    return render(request, 'communities/create_community.html', {'form': form})

@login_required
@require_http_methods(["POST"])
def join_community(request, community_name):
    try:
        community = get_object_or_404(Community, name=community_name)
        
        if request.user not in community.members.all():
            community.members.add(request.user)
            messages.success(request, f'Вы присоединились к r/{community.name}')
        else:
            messages.info(request, f'Вы уже участник r/{community.name}')
        
        return redirect('community_detail', community_name=community.name)
    except Exception as e:
        logger.error(f"Error joining community {community_name}: {e}")
        messages.error(request, "Error joining the community.")
        return redirect('communities:community_list')

@login_required
@require_http_methods(["POST"])
def leave_community(request, community_name):
    try:
        community = get_object_or_404(Community, name=community_name)
        if request.user in community.members.all():
            # Не позволяем создателю покинуть сообщество
            if community.created_by == request.user:
                messages.error(request, 'Creator cannot leave their own community.')
            else:
                community.members.remove(request.user)
        
                if request.user in community.members.all():
                    community.members.remove(request.user)
                    messages.success(request, f'You left r/{community.name}')
        
        return redirect('community_detail', community_name=community.name)
    except Exception as e:
        logger.error(f"Error leaving community {community_name}: {e}")
        messages.error(request, "Error leaving the community.")
        return redirect('communities:community_list')

@login_required
def my_communities(request):
    """User's communities view with error handling."""
    try:
        user_communities = request.user.communities.all()
        moderated_communities = request.user.moderated_communities.all()
        
        return render(request, 'communities/my_communities.html', {
            'user_communities': user_communities,
            'moderated_communities': moderated_communities
        })
    except Exception as e:
        logger.error(f"Error loading user communities: {e}")
        messages.error(request, 'Error loading your communities.')
        return render(request, 'communities/my_communities.html', {
            'user_communities': [],
            'moderated_communities': []
        })   

from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Count
from .models import Community
from .forms import CommunityForm
from posts.models import Post

def community_list(request):
    communities = Community.objects.annotate(
        post_count=Count('posts'),
        member_count=Count('members')
    ).order_by('-member_count')[:20]
    
    return render(request, 'communities/community_list.html', {
        'communities': communities
    })

def community_detail(request, community_name):
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

@login_required
def create_community(request):
    if request.method == 'POST':
        form = CommunityForm(request.POST)
        if form.is_valid():
            community = form.save(commit=False)
            community.created_by = request.user
            community.save()
            
            # Создатель автоматически становится модератором и участником
            community.moderators.add(request.user)
            community.members.add(request.user)
            
            messages.success(request, f'Сообщество r/{community.name} создано!')
            return redirect('community_detail', community_name=community.name)
    else:
        form = CommunityForm()
    
    return render(request, 'communities/create_community.html', {'form': form})

@login_required
def join_community(request, community_name):
    community = get_object_or_404(Community, name=community_name)
    
    if request.user not in community.members.all():
        community.members.add(request.user)
        messages.success(request, f'Вы присоединились к r/{community.name}')
    else:
        messages.info(request, f'Вы уже участник r/{community.name}')
    
    return redirect('community_detail', community_name=community.name)

@login_required
def leave_community(request, community_name):
    community = get_object_or_404(Community, name=community_name)
    
    if request.user in community.members.all():
        community.members.remove(request.user)
        messages.success(request, f'Вы покинули r/{community.name}')
    
    return redirect('community_detail', community_name=community.name)

from django.contrib import admin
from django.contrib.auth.models import User
from django.http import HttpResponseRedirect
from django.urls import path
from django.utils.html import format_html
from .models import Community

@admin.register(Community)
class CommunityAdmin(admin.ModelAdmin):
    list_display = [
        'name', 
        'created_by', 
        'created_at', 
        'member_count', 
        'post_count',
        'moderator_count',
        'community_actions'
    ]
    
    list_filter = [
        'created_at',
        ('created_by', admin.RelatedOnlyFieldListFilter),
    ]
    
    search_fields = [
        'name', 
        'description',
        'created_by__username',
        'created_by__email'
    ]
    
    filter_horizontal = ['members', 'moderators']
    
    readonly_fields = [
        'created_at',
        'created_by',
        'community_stats',
        'recent_activity'
    ]
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('name', 'description', 'created_by')
        }),
        ('Участники и модераторы', {
            'fields': ('members', 'moderators')
        }),
        ('Статистика', {
            'fields': ('community_stats', 'recent_activity', 'created_at'),
            'classes': ('collapse',)
        }),
    )
    
    # Autofill created_by with the current user
    def save_model(self, request, obj, form, change):
        if not obj.pk:  # If the object is being created for the first time
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
    
    # Query Optimization
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('created_by')\
                                           .prefetch_related('members', 'moderators', 'posts')
    
    # Actions in the admin panel
    actions = ['remove_inactive_communities', 'export_community_data']
    
    def remove_inactive_communities(self, request, queryset):
        """Delete communities without posts and with a small number of members"""
        inactive_communities = queryset.filter(posts__isnull=True, members__count__lt=2)
        count = inactive_communities.count()
        inactive_communities.delete()
        self.message_user(request, f'Deleted {count} inactive communities')
    remove_inactive_communities.short_description = "Delete inactive communities"
    
    def export_community_data(self, request, queryset):
        """Community data export (placeholder)"""
        self.message_user(request, f'Data export for {queryset.count()} communities')
    export_community_data.short_description = "Export of community data"
    
    # Custom methods for display
    def member_count(self, obj):
        return obj.member_count()
    member_count.short_description = '👥 Members'
    member_count.admin_order_field = 'members__count'
    
    def post_count(self, obj):
        return obj.posts.count()
    post_count.short_description = '📝 Posts'
    post_count.admin_order_field = 'posts__count'
    
    def moderator_count(self, obj):
        return obj.moderators.count()
    moderator_count.short_description = '🛡️ Moderators'
    
    def community_stats(self, obj):
        return format_html(
            "Members: <b>{}</b><br>Posts: <b>{}</b><br>Moderators: <b>{}</b>",
            obj.member_count(),
            obj.posts.count(),
            obj.moderators.count()
        )
    community_stats.short_description = "Community Statistics"
    
    def recent_activity(self, obj):
        recent_posts = obj.posts.order_by('-created_at')[:5]
        if recent_posts:
            posts_list = "".join([
                f"<li>{post.title} ({post.created_at.date()})</li>" 
                for post in recent_posts
            ])
            return format_html(f"<ul>{posts_list}</ul>")
        return "No posts"
    recent_activity.short_description = "Latest posts"
    
    def community_actions(self, obj):
        return format_html(
            '<a href="/communities/r/{}/" target="_blank">👁️ View</a> | '
            '<a href="/admin/communities/community/{}/change/">✏️ Edit.</a>',
            obj.name, obj.id
        )
    community_actions.short_description = "Actions"
    
    # Protection against accidental deletion
    def has_delete_permission(self, request, obj=None):
        if obj and obj.member_count() > 100:  # Large communities cannot be deleted
            return False
        return super().has_delete_permission(request, obj)
    
    # Limit on bulk deletion
    def get_actions(self, request):
        actions = super().get_actions(request)
        if 'delete_selected' in actions:
            actions['delete_selected'] = (
                self.delete_selected_action,
                'delete_selected',
                "Delete selected communities"
            )
        return actions
    
    def delete_selected_action(self, modeladmin, request, queryset):
        # We filter only the communities that can be deleted
        deletable = queryset.filter(members__count__lte=100)
        count = deletable.count()
        deletable.delete()
        self.message_user(request, f'Deleted {count} communities (large communities are protected)')
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
    
    # Автозаполнение created_by текущим пользователем
    def save_model(self, request, obj, form, change):
        if not obj.pk:  # Если объект создается впервые
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
    
    # Оптимизация запросов
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('created_by')\
                                           .prefetch_related('members', 'moderators', 'posts')
    
    # Действия в админке
    actions = ['remove_inactive_communities', 'export_community_data']
    
    def remove_inactive_communities(self, request, queryset):
        """Удалить сообщества без постов и с малым количеством участников"""
        inactive_communities = queryset.filter(posts__isnull=True, members__count__lt=2)
        count = inactive_communities.count()
        inactive_communities.delete()
        self.message_user(request, f'Удалено {count} неактивных сообществ')
    remove_inactive_communities.short_description = "Удалить неактивные сообщества"
    
    def export_community_data(self, request, queryset):
        """Экспорт данных сообществ (заглушка)"""
        self.message_user(request, f'Экспорт данных для {queryset.count()} сообществ')
    export_community_data.short_description = "Экспорт данных сообществ"
    
    # Кастомные методы для отображения
    def member_count(self, obj):
        return obj.member_count()
    member_count.short_description = '👥 Участников'
    member_count.admin_order_field = 'members__count'
    
    def post_count(self, obj):
        return obj.posts.count()
    post_count.short_description = '📝 Постов'
    post_count.admin_order_field = 'posts__count'
    
    def moderator_count(self, obj):
        return obj.moderators.count()
    moderator_count.short_description = '🛡️ Модераторов'
    
    def community_stats(self, obj):
        return format_html(
            "Участников: <b>{}</b><br>Постов: <b>{}</b><br>Модераторов: <b>{}</b>",
            obj.member_count(),
            obj.posts.count(),
            obj.moderators.count()
        )
    community_stats.short_description = "Статистика сообщества"
    
    def recent_activity(self, obj):
        recent_posts = obj.posts.order_by('-created_at')[:5]
        if recent_posts:
            posts_list = "".join([
                f"<li>{post.title} ({post.created_at.date()})</li>" 
                for post in recent_posts
            ])
            return format_html(f"<ul>{posts_list}</ul>")
        return "Нет постов"
    recent_activity.short_description = "Последние посты"
    
    def community_actions(self, obj):
        return format_html(
            '<a href="/communities/r/{}/" target="_blank">👁️ Просмотр</a> | '
            '<a href="/admin/communities/community/{}/change/">✏️ Редакт.</a>',
            obj.name, obj.id
        )
    community_actions.short_description = "Действия"
    
    # Защита от случайного удаления
    def has_delete_permission(self, request, obj=None):
        if obj and obj.member_count() > 100:  # Нельзя удалять крупные сообщества
            return False
        return super().has_delete_permission(request, obj)
    
    # Лимит на массовое удаление
    def get_actions(self, request):
        actions = super().get_actions(request)
        if 'delete_selected' in actions:
            actions['delete_selected'] = (
                self.delete_selected_action,
                'delete_selected',
                "Удалить выбранные сообщества"
            )
        return actions
    
    def delete_selected_action(self, modeladmin, request, queryset):
        # Фильтруем только сообщества которые можно удалять
        deletable = queryset.filter(members__count__lte=100)
        count = deletable.count()
        deletable.delete()
        self.message_user(request, f'Удалено {count} сообществ (крупные сообщества защищены)')
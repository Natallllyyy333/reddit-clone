from django.contrib import admin
from .models import Post


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'created_at', 'score',]
    list_filter = ['created_at', 'author']
    
    search_fields = [
        'title',
        'content',
        'author__username',
        
    ]
    date_hierarchy = 'created_at'
    readonly_fields = ['created_at', 'updated_at']

    def upvotes_count(self, obj):
        return obj.upvotes.count()
    upvotes_count.short_description = 'Upvotes'
    
    def downvotes_count(self, obj):
        return obj.downvotes.count()
    downvotes_count.short_description = 'Downvotes'

    def score(self, obj):
        return obj.total_votes()
    score.short_description = 'Score'

    def get_community(self, obj):
        return obj.community.name if obj.community else "—"
    get_community.short_description = 'Community'
    get_community.admin_order_field = 'community__name'
    
    def get_votes(self, obj):
        return obj.total_votes()
    get_votes.short_description = 'Votes'
    get_votes.admin_order_field = 'upvotes'
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('title', 'content', 'author', 'community')
        }),
        ('Медиа', {
            'fields': ('media_file', 'media_type'),
            'classes': ('collapse',)
        }),
        ('Голосование', {
            'fields': ('upvotes', 'downvotes'),
            'classes': ('collapse',)
        }),
        ('Даты', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


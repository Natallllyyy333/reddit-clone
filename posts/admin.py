from django.contrib import admin
from .models import Post


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'created_at', 'score',]
    list_filter = ['created_at',]
    
    search_fields = [
        'title',
        'content',
        'author__username',
        
    ]
    
    readonly_fields = ['created_at', 'updated_at']

    def upvotes_count(self, obj):
        return obj.upvotes.count()
    upvotes_count.short_description = 'Upvotes'
    
    def downvotes_count(self, obj):
        return obj.downvotes.count()
    downvotes_count.short_description = 'Downvotes'


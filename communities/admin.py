from django.contrib import admin
from .models import Community

@admin.register(Community)
class CommunityAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_by', 'created_at', 'member_count']
    list_filter = ['created_at']
    search_fields = ['name', 'description']
    filter_horizontal = ['members', 'moderators']
    
    def member_count(self, obj):
        return obj.member_count()
    member_count.short_description = 'Members'
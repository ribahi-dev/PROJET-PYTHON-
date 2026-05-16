from django.contrib import admin
from .models import Comment


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'author', 'idea', 'parent', 'is_deleted', 'created_at']
    list_filter = ['is_deleted', 'created_at']
    search_fields = ['content', 'author__username', 'idea__title']
    readonly_fields = ['id', 'created_at', 'updated_at']
    raw_id_fields = ['idea', 'author', 'parent']

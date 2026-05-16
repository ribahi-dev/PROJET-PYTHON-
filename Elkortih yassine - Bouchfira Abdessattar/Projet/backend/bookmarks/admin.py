from django.contrib import admin
from .models import Bookmark


@admin.register(Bookmark)
class BookmarkAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'idea', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'idea__title']
    readonly_fields = ['id', 'created_at']
    raw_id_fields = ['user', 'idea']

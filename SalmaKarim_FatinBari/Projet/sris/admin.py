from django.contrib import admin
from .models import AppSetting

@admin.register(AppSetting)
class AppSettingAdmin(admin.ModelAdmin):
    list_display = ('key', 'label', 'is_active', 'updated_at')
    list_filter = ('is_active',)
    search_fields = ('key', 'label', 'description')
    readonly_fields = ('created_at', 'updated_at')

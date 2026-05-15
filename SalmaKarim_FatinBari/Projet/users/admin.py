from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Informations EMSI', {'fields': ('role', 'emsi_id', 'phone', 'department')}),
    )
    list_display = (
        'username',
        'email',
        'first_name',
        'last_name',
        'emsi_id',
        'role',
        'is_staff',
        'is_active',
    )
    list_filter = ('role', 'is_staff', 'is_active', 'department')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'emsi_id')

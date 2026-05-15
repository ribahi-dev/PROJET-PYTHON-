from django.contrib import admin
from .models import Appointment, Coach, Client, Subscription, Message


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ("client", "coach", "date", "time", "status", "video_link")
    list_filter = ("status", "coach", "date")
    search_fields = ("client__username", "coach__username", "notes")
    ordering = ("-date", "time")


@admin.register(Coach)
class CoachAdmin(admin.ModelAdmin):
    list_display = ("name", "user", "specialty", "experience", "price")
    search_fields = ("name", "specialty", "user__username")
    list_filter = ("specialty", "experience")
    ordering = ("-experience", "name")


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ("user", "notes")
    search_fields = ("user__username", "user__email")
    ordering = ("user__username",)


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ("user", "coach", "status", "start_date", "end_date")
    list_filter = ("status", "start_date", "end_date")
    search_fields = ("user__username", "coach__username")
    ordering = ("-start_date",)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("sender", "receiver", "is_read", "created_at")
    list_filter = ("is_read", "created_at")
    search_fields = ("sender__username", "receiver__username", "content")
    ordering = ("-created_at",)

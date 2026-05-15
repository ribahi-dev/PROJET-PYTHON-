from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("user", "program", "amount", "status", "date")
    list_filter = ("status", "date")
    search_fields = ("user__username", "user__email", "program__title")
    ordering = ("-date",)

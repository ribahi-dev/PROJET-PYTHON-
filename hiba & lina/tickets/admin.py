from django.contrib import admin
from .models import Ticket

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display  = ['code','reservation','statut','created_at']
    list_filter   = ['statut','created_at']
    list_editable = ['statut']
    search_fields = ['code','reservation__activite__nom','reservation__user__username']
    readonly_fields = ['code']
    date_hierarchy = 'created_at'

from django.contrib import admin
from .models import Reservation

@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display  = ['user','activite','date_reservation','nombre_personnes','statut','created_at']
    list_filter   = ['statut','activite','date_reservation']
    list_editable = ['statut']
    search_fields = ['user__username','activite__nom']
    date_hierarchy = 'created_at'

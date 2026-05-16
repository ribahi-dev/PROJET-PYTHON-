from django.contrib import admin
from .models import Activite

@admin.register(Activite)
class ActiviteAdmin(admin.ModelAdmin):
    list_display  = ['nom','categorie','prix','disponible','places_max']
    list_filter   = ['categorie','disponible']
    list_editable = ['disponible','prix']
    search_fields = ['nom','description']

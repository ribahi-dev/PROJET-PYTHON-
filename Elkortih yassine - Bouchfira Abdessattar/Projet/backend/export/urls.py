from django.urls import path
from . import views

urlpatterns = [
    path('csv/<int:idea_id>/', views.export_csv, name='export-csv'),
    path('xlsx/<int:idea_id>/', views.export_xlsx, name='export-xlsx'),
    path('json/<int:idea_id>/', views.export_json, name='export-json'),
    path('pdf/<int:idea_id>/', views.export_pdf, name='export-pdf'),
]

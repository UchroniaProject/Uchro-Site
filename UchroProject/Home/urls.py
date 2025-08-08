from django.urls import path
from . import views

urlpatterns = [
    path('', views.main, name='main'),
    path('conversion/', views.convertisseur_geojson, name="convertisseur_geojson"),
]
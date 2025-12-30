from django.urls import path
from . import views

urlpatterns = [
    path('', views.main, name='main'),
    path('conversion/', views.convertisseur_geojson, name="convertisseur_geojson"),
    path('login/api/', views.login_api, name='login_api'),
    path('logout/api/', views.logout_api, name='logout_api'),
]
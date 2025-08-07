from django.urls import path
from . import views

urlpatterns = [
    path('map/', views.gameUI_main, name='map'),
]
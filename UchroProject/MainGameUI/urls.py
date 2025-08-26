from django.urls import path
from . import views

app_name="MainGameUI"
urlpatterns = [
    path('map/', views.gameUI_main, name='map'),
    path("panel/<slug:name>/", views.panel, name="panel"),
]
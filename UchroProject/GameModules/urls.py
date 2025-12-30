# game_modules/urls.py
from django.urls import path
from .views import panel_html

app_name = "game_modules"
urlpatterns = [
    path("panel/<slug:module_slug>/<slug:panel_slug>/", panel_html, name="panel_html"),
]

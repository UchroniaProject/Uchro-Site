# game_modules/views.py
from django.shortcuts import render
from django.http import Http404
from .registry import get_panel, get_registry

def panel_html(request, module_slug: str, panel_slug: str):
    try:
        panel = get_panel(module_slug, panel_slug)
    except KeyError as e:
        raise Http404(str(e))
    # On peut passer contexte générique si besoin
    return render(request, panel.template, {"module": module_slug, "panel": panel_slug})

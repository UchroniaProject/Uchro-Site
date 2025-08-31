# game_modules/context_processors.py
from django.templatetags.static import static
from .registry import get_registry

def modules_manifest(request):
    # Résout les URLs statiques pour les assets déclarés
    manifest = []
    for mod in get_registry().values():
        panels = []
        for p in mod.panels:
            panels.append({
                "slug": p.slug,
                "label": p.label,
                "template": p.template,
                "icon": static(p.icon) if p.icon else None,
                "styles": [static(s) for s in p.styles],
                "scripts": [static(s) for s in p.scripts],
                "url": f"/modules/panel/{mod.slug}/{p.slug}/",
            })
        manifest.append({"slug": mod.slug, "name": mod.name, "panels": panels})
    return {"MG_MODULES_MANIFEST": manifest}

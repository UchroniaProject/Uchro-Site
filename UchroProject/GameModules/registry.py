# game_modules/registry.py
from dataclasses import dataclass, field
from typing import List, Dict, Callable, Optional
from django.conf import settings
import importlib
from pathlib import Path

@dataclass
class Panel:
    slug: str
    label: str
    template: str                         # ex: "modules/demography/panels/overview.html"
    icon: Optional[str] = None            # ex: "modules/demography/icons/demography.svg"
    styles: List[str] = field(default_factory=list)   # chemins static
    scripts: List[str] = field(default_factory=list)  # chemins static

@dataclass
class Module:
    slug: str
    name: str
    panels: List[Panel]

_registry: Dict[str, Module] = {}

def discover_and_register() -> Dict[str, Module]:
    """Charge module.manifest.module pour chaque slug découvert et remplit le registre."""
    _registry.clear()
    slugs = settings.GAME_MODULES_SETTINGS["SLUGS"]
    for slug in slugs:
        modpath = f"modules.{slug}.manifest"
        manifest = importlib.import_module(modpath)
        module: Module = getattr(manifest, "module")
        assert module.slug == slug, f"Slug manifest incohérent pour {slug}"
        _registry[slug] = module
    return _registry

def get_registry() -> Dict[str, Module]:
    return _registry

def get_panel(module_slug: str, panel_slug: str) -> Panel:
    mod = _registry[module_slug]
    for p in mod.panels:
        if p.slug == panel_slug:
            return p
    raise KeyError(f"Panel {panel_slug} introuvable dans {module_slug}")

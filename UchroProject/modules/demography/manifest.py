# modules/demography/manifest.py
from game_modules.registry import Module, Panel

module = Module(
    slug="demography",
    name="Démographie",
    panels=[
        Panel(
            slug="overview",
            label="Démographie",
            template="panels/overview.html",
            icon="icons/demography.svg",
            styles=["css/panel.css"],
            scripts=["js/panel.js"],
        )
    ],
)

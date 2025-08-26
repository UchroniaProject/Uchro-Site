from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader


def gameUI_main(request):
    template = loader.get_template('mainGameUI.html')
    return HttpResponse(template.render())

def panel(request, name: str):
    # Mappe chaque slug à un template partiel
    templates = {
        'one': 'ui/panels/one.html',
        'two':    'ui/panels/two.html',
        'three':    'ui/panels/three.html',
    }
    tpl = templates.get(name)
    if not tpl:
        raise Http404("Panel inconnu")
    context = {
        # passez vos données de jeu ici
        'player': request.user if request.user.is_authenticated else None,
        'panel': name,
    }
    # Retourne un fragment HTML (sans base template)
    return render(request, tpl, context)
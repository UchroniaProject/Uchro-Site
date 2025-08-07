from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader


def gameUI_main(request):
    template = loader.get_template('mainGameUI.html')
    return HttpResponse(template.render())

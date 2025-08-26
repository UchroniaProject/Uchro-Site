from django.http import HttpResponse
from django.template import loader
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import login, logout
from django.shortcuts import render

# Create your views here.

def main(request):
    return render(request, 'main.html')

def convertisseur_geojson(request):
    return render(request, 'conversion.html')

@ensure_csrf_cookie
def home(request):
    return render(request, 'main.html')

@require_POST
def login_api(request):
    form = AuthenticationForm(request, data=request.POST)
    if form.is_valid():
        login(request, form.get_user())
        return JsonResponse({'ok': True})
    return JsonResponse({
        'ok': False,
        'errors': form.errors.get_json_data(escape_html=True)
    }, status=400)

@require_POST
def logout_api(request):
    logout(request)
    return JsonResponse({'ok': True})
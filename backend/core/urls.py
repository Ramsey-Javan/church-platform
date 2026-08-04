from django.urls import path
from .views import ChurchSettingsView

urlpatterns = [
    path('church-settings/', ChurchSettingsView.as_view(), name='church-settings'),
]

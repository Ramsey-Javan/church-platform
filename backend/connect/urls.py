from django.urls import path

from .views import ConnectCardCreateAPIView


urlpatterns = [
    path('', ConnectCardCreateAPIView.as_view(), name='connect-card-create'),
]

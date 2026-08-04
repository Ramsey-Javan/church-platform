from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import ServiceViewSet, TodayProgramView

router = DefaultRouter()
router.register('services', ServiceViewSet, basename='service')

urlpatterns = [
    path('today/', TodayProgramView.as_view(), name='today-program'),
] + router.urls

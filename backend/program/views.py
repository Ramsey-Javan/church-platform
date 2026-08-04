from django.http import Http404
from django.utils import timezone
from rest_framework import generics, viewsets
from django_filters.rest_framework import DjangoFilterBackend
from .models import Service
from .serializers import ServiceSerializer


class ServiceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/v1/program/services/            all programs
    GET /api/v1/program/services/?date=2026-08-09
    GET /api/v1/program/services/?event=5    program tied to a specific Event
    GET /api/v1/program/services/{id}/
    """
    queryset = Service.objects.prefetch_related('items').all()
    serializer_class = ServiceSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['date', 'event']


class TodayProgramView(generics.RetrieveAPIView):
    """GET /api/v1/program/today/ — the Service scheduled for today, 404 if none."""
    serializer_class = ServiceSerializer

    def get_object(self):
        today = timezone.localdate()
        service = Service.objects.prefetch_related('items').filter(date=today).first()
        if service is None:
            raise Http404("No service scheduled today.")
        return service

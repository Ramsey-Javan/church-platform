from django.http import HttpResponse
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend

from .models import Event, EventCategory
from .serializers import EventSerializer, EventCategorySerializer, RSVPSerializer
from .filters import EventFilter


class EventCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = EventCategory.objects.all()
    serializer_class = EventCategorySerializer


class EventViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public read-only event feed, filterable by category and date range.
    Writes happen via /admin/ (Content Editor group), not this API.
    """
    queryset = Event.objects.select_related('category').all()
    serializer_class = EventSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = EventFilter

    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def rsvp(self, request, pk=None):
        """POST /api/v1/events/{id}/rsvp/  { "name": "...", "email": "..." }"""
        event = self.get_object()
        serializer = RSVPSerializer(data=request.data, context={'event': event})
        serializer.is_valid(raise_exception=True)
        serializer.save(event=event)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], permission_classes=[AllowAny], url_path='ics')
    def ics(self, request, pk=None):
        """GET /api/v1/events/{id}/ics/  — downloadable calendar file for Google/iCal export."""
        event = self.get_object()
        fmt = '%Y%m%dT%H%M%SZ'
        ics_content = (
            "BEGIN:VCALENDAR\r\n"
            "VERSION:2.0\r\n"
            "BEGIN:VEVENT\r\n"
            f"UID:event-{event.id}@churchplatform\r\n"
            f"DTSTART:{event.start.strftime(fmt)}\r\n"
            f"DTEND:{event.end.strftime(fmt)}\r\n"
            f"SUMMARY:{event.title}\r\n"
            f"LOCATION:{event.location}\r\n"
            f"DESCRIPTION:{event.description}\r\n"
            "END:VEVENT\r\n"
            "END:VCALENDAR\r\n"
        )
        response = HttpResponse(ics_content, content_type='text/calendar')
        response['Content-Disposition'] = f'attachment; filename="event-{event.id}.ics"'
        return response
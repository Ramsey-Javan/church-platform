from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from .models import Sermon
from .serializers import SermonSerializer


class SermonViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public read-only sermon archive.
    Writes happen via /admin/ (Content Editor group), not this API.
    """
    queryset = Sermon.objects.select_related('speaker', 'series').all()
    serializer_class = SermonSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['speaker', 'series']
    search_fields = ['title', 'scripture_refs', 'topic_tags']

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets

from .models import Ministry, SmallGroup
from .serializers import MinistrySerializer, SmallGroupSerializer


class MinistryViewSet(viewsets.ReadOnlyModelViewSet):
	"""Public read-only ministry directory."""
	queryset = Ministry.objects.all()
	serializer_class = MinistrySerializer


class SmallGroupViewSet(viewsets.ReadOnlyModelViewSet):
	"""Public read-only small group directory."""
	queryset = SmallGroup.objects.select_related('ministry').all()
	serializer_class = SmallGroupSerializer
	filter_backends = [DjangoFilterBackend]
	filterset_fields = ['location_area', 'meeting_day']

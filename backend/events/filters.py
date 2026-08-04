import django_filters
from .models import Event


class EventFilter(django_filters.FilterSet):
    """
    Supports:
      /events/?category=2
      /events/?start_after=2026-08-01&start_before=2026-08-31
    """
    start_after = django_filters.DateTimeFilter(field_name='start', lookup_expr='gte')
    start_before = django_filters.DateTimeFilter(field_name='start', lookup_expr='lte')

    class Meta:
        model = Event
        fields = ['category', 'start_after', 'start_before']
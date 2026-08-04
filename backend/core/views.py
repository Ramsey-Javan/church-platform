from rest_framework import generics
from .models import ChurchSettings
from .serializers import ChurchSettingsSerializer


class ChurchSettingsView(generics.RetrieveAPIView):
    """Public, read-only. Returns the single ChurchSettings row."""
    serializer_class = ChurchSettingsSerializer

    def get_object(self):
        return ChurchSettings.objects.first()

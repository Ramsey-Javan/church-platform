from rest_framework import generics, viewsets
from .models import AboutPage, GalleryImage, LeaderProfile
from .serializers import AboutPageSerializer, GalleryImageSerializer, LeaderProfileSerializer


class AboutPageView(generics.RetrieveAPIView):
    """Public, read-only. Returns the single AboutPage row."""
    serializer_class = AboutPageSerializer

    def get_object(self):
        return AboutPage.objects.first()


class GalleryImageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = GalleryImage.objects.all()
    serializer_class = GalleryImageSerializer
    filterset_fields = ['category']


class LeaderProfileViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LeaderProfile.objects.all()
    serializer_class = LeaderProfileSerializer

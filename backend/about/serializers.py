from rest_framework import serializers
from .models import AboutPage, GalleryImage, LeaderProfile


class AboutPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutPage
        fields = '__all__'


class GalleryImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = GalleryImage
        fields = '__all__'


class LeaderProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaderProfile
        fields = '__all__'

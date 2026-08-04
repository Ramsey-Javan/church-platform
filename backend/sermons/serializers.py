from rest_framework import serializers
from .models import Sermon, Series, Speaker


class SpeakerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Speaker
        fields = '__all__'


class SeriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Series
        fields = '__all__'


class SermonSerializer(serializers.ModelSerializer):
    speaker = SpeakerSerializer(read_only=True)
    series = SeriesSerializer(read_only=True)

    class Meta:
        model = Sermon
        fields = '__all__'

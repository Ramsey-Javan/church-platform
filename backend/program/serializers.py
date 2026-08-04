from rest_framework import serializers
from .models import Service, ProgramItem


class ProgramItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgramItem
        fields = ['id', 'order', 'time', 'title', 'leader', 'notes']


class ServiceSerializer(serializers.ModelSerializer):
    items = ProgramItemSerializer(many=True, read_only=True)

    class Meta:
        model = Service
        fields = ['id', 'date', 'title', 'event', 'items']

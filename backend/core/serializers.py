from rest_framework import serializers
from .models import ChurchSettings


class ChurchSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChurchSettings
        fields = '__all__'

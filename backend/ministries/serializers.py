from rest_framework import serializers

from .models import Ministry, SmallGroup


class MinistrySerializer(serializers.ModelSerializer):
	class Meta:
		model = Ministry
		fields = ['id', 'name', 'description', 'leader_contact']


class SmallGroupSerializer(serializers.ModelSerializer):
	ministry = MinistrySerializer(read_only=True)

	class Meta:
		model = SmallGroup
		fields = [
			'id', 'name', 'ministry', 'location_area',
			'meeting_day', 'meeting_time', 'leader_contact', 'capacity',
		]

from rest_framework import serializers
from .models import Event, EventCategory, RSVP


class EventCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = EventCategory
        fields = '__all__'


class EventSerializer(serializers.ModelSerializer):
    category = EventCategorySerializer(read_only=True)
    spots_remaining = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'category', 'description', 'location',
            'start', 'end', 'registration_required', 'capacity', 'spots_remaining',
        ]

    def get_spots_remaining(self, obj):
        if not obj.registration_required or obj.capacity is None:
            return None
        return max(obj.capacity - obj.rsvps.count(), 0)


class RSVPSerializer(serializers.ModelSerializer):
    class Meta:
        model = RSVP
        fields = ['id', 'event', 'name', 'email', 'created_at']
        read_only_fields = ['id', 'event', 'created_at']

    def validate(self, attrs):
        event = self.context['event']
        if event.registration_required and event.capacity is not None:
            taken = event.rsvps.count()
            if taken >= event.capacity:
                raise serializers.ValidationError("This event is full.")
        if RSVP.objects.filter(event=event, email__iexact=attrs['email']).exists():
            raise serializers.ValidationError("This email has already RSVP'd for this event.")
        return attrs
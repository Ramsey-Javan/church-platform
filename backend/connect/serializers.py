from django.conf import settings
import requests
from rest_framework import serializers

from .models import ConnectCard


class ConnectCardSerializer(serializers.ModelSerializer):
	turnstile_token = serializers.CharField(write_only=True)

	class Meta:
		model = ConnectCard
		fields = [
			'id', 'name', 'email', 'phone', 'how_heard',
			'message', 'is_prayer_request', 'turnstile_token', 'created_at',
		]
		read_only_fields = ['id', 'created_at']
		extra_kwargs = {
			'name': {'write_only': True},
			'email': {'write_only': True},
			'phone': {'write_only': True},
			'how_heard': {'write_only': True},
			'message': {'write_only': True},
			'is_prayer_request': {'write_only': True},
		}

	def validate_turnstile_token(self, value):
		if not settings.TURNSTILE_SECRET_KEY:
			raise serializers.ValidationError('Turnstile is not configured.')

		request = self.context.get('request')
		payload = {
			'secret': settings.TURNSTILE_SECRET_KEY,
			'response': value,
		}
		remote_ip = None
		if request is not None:
			remote_ip = request.META.get('REMOTE_ADDR')
		if remote_ip:
			payload['remoteip'] = remote_ip

		try:
			response = requests.post(
				'https://challenges.cloudflare.com/turnstile/v0/siteverify',
				data=payload,
				timeout=10,
			)
			response.raise_for_status()
			result = response.json()
		except requests.RequestException as exc:
			raise serializers.ValidationError('Turnstile verification failed.') from exc

		if not result.get('success'):
			raise serializers.ValidationError('Turnstile verification failed.')
		return value

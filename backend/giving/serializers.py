from rest_framework import serializers

from .models import Donation, Fund


class FundSerializer(serializers.ModelSerializer):
	class Meta:
		model = Fund
		fields = ['id', 'name', 'description', 'active']


class DonationCheckoutSerializer(serializers.Serializer):
	amount = serializers.DecimalField(max_digits=10, decimal_places=2)
	fund_id = serializers.PrimaryKeyRelatedField(source='fund', queryset=Fund.objects.filter(active=True))
	method = serializers.ChoiceField(choices=Donation.METHOD_CHOICES)
	donor_name = serializers.CharField(required=False, allow_blank=True)
	email = serializers.EmailField(required=False, allow_blank=True)
	phone = serializers.CharField(required=False, allow_blank=True)
	recurring = serializers.BooleanField(required=False, default=False)

	def validate(self, attrs):
		if attrs['method'] == 'mpesa' and not attrs.get('phone'):
			raise serializers.ValidationError({'phone': 'Phone is required for M-Pesa donations.'})
		if attrs['method'] == 'mpesa' and attrs.get('recurring'):
			raise serializers.ValidationError({'recurring': 'Recurring donations are only supported for Stripe.'})
		return attrs

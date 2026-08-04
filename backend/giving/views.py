from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from django.conf import settings
import stripe

from .models import Donation, Fund
from .serializers import DonationCheckoutSerializer, FundSerializer
from .services.mpesa_client import initiate_stk_push
from .services.stripe_client import create_checkout_session


class FundViewSet(viewsets.ReadOnlyModelViewSet):
	"""Public read-only active funds feed."""
	queryset = Fund.objects.filter(active=True)
	serializer_class = FundSerializer


class DonationCheckoutAPIView(APIView):
	"""Public donation checkout endpoint for Stripe and M-Pesa."""
	permission_classes = [AllowAny]

	def post(self, request):
		serializer = DonationCheckoutSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		validated_data = serializer.validated_data

		if validated_data['method'] == 'stripe':
			session_url = create_checkout_session(
				amount=validated_data['amount'],
				fund_id=validated_data['fund'].id,
				donor_email=validated_data.get('email', ''),
				recurring=validated_data.get('recurring', False),
				donor_name=validated_data.get('donor_name', ''),
			)
			return Response({'payment_url': session_url}, status=status.HTTP_201_CREATED)

		stk_result = initiate_stk_push(
			phone=validated_data['phone'],
			amount=validated_data['amount'],
			fund_id=validated_data['fund'].id,
		)
		return Response(stk_result, status=status.HTTP_201_CREATED)


class StripeWebhookAPIView(APIView):
	permission_classes = [AllowAny]
	authentication_classes = []

	def post(self, request):
		if not settings.STRIPE_WEBHOOK_SECRET:
			return Response({'detail': 'Stripe webhook secret is not configured.'}, status=status.HTTP_400_BAD_REQUEST)

		signature = request.META.get('HTTP_STRIPE_SIGNATURE', '')
		try:
			event = stripe.Webhook.construct_event(
				payload=request.body,
				sig_header=signature,
				secret=settings.STRIPE_WEBHOOK_SECRET,
			)
		except (ValueError, stripe.error.SignatureVerificationError):
			return Response({'detail': 'Invalid Stripe webhook signature.'}, status=status.HTTP_400_BAD_REQUEST)

		event_type = event['type']
		session = event['data']['object']
		session_id = session.get('id')

		if event_type in {'checkout.session.completed', 'checkout.session.async_payment_succeeded'}:
			Donation.objects.filter(method='stripe', external_ref=session_id).update(status='completed')
		elif event_type in {'checkout.session.async_payment_failed', 'checkout.session.expired'}:
			Donation.objects.filter(method='stripe', external_ref=session_id).update(status='failed')

		return Response({'received': True}, status=status.HTTP_200_OK)


class MpesaWebhookAPIView(APIView):
	permission_classes = [AllowAny]
	authentication_classes = []

	def post(self, request):
		callback = request.data.get('Body', {}).get('stkCallback', {})
		checkout_request_id = callback.get('CheckoutRequestID')
		result_code = callback.get('ResultCode')

		if not checkout_request_id:
			return Response({'detail': 'Missing CheckoutRequestID.'}, status=status.HTTP_400_BAD_REQUEST)

		status_value = 'completed' if result_code == 0 else 'failed'
		Donation.objects.filter(method='mpesa', external_ref=checkout_request_id).update(status=status_value)
		return Response({'received': True}, status=status.HTTP_200_OK)

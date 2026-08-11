from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from django.conf import settings
import stripe
import logging
import requests

from .models import Donation, Fund
from .serializers import DonationCheckoutSerializer, FundSerializer
from .services.mpesa_client import initiate_stk_push
from .services.stripe_client import create_checkout_session

logger = logging.getLogger(__name__)



class FundViewSet(viewsets.ReadOnlyModelViewSet):
	"""Public read-only active funds feed."""
	queryset = Fund.objects.filter(active=True)
	serializer_class = FundSerializer



class FundViewSet(viewsets.ReadOnlyModelViewSet):
	queryset = Fund.objects.filter(active=True)
	serializer_class = FundSerializer


class DonationCheckoutAPIView(APIView):
	permission_classes = [AllowAny]

	def post(self, request):
		serializer = DonationCheckoutSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		validated_data = serializer.validated_data

		try:
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

		except ValueError as exc:
			# Bad input we raised ourselves (e.g. phone format, M-Pesa non-zero response code)
			logger.warning('Donation checkout rejected: %s', exc)
			return Response(
				{'detail': str(exc)},
				status=status.HTTP_400_BAD_REQUEST,
			)

		except stripe.error.StripeError as exc:
			logger.exception('Stripe checkout failed')
			return Response(
				{'detail': 'We could not start your Stripe checkout. Please try again in a moment.'},
				status=status.HTTP_502_BAD_GATEWAY,
			)

		except requests.exceptions.RequestException as exc:
			logger.exception('M-Pesa request failed')
			return Response(
				{'detail': 'We could not reach M-Pesa right now. Please try again shortly.'},
				status=status.HTTP_502_BAD_GATEWAY,
			)

		except Exception:
			logger.exception('Unexpected error during donation checkout')
			return Response(
				{'detail': 'Something went wrong processing your donation. Please try again.'},
				status=status.HTTP_500_INTERNAL_SERVER_ERROR,
			)

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

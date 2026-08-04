from decimal import Decimal, ROUND_HALF_UP

import stripe
from django.conf import settings

from ..models import Donation, Fund


def _frontend_origin():
	if getattr(settings, 'CORS_ALLOWED_ORIGINS', None):
		return settings.CORS_ALLOWED_ORIGINS[0].rstrip('/')
	return 'http://localhost:5173'


def create_checkout_session(amount, fund_id, donor_email, recurring, donor_name=''):
	fund = Fund.objects.get(pk=fund_id)
	donation = Donation.objects.create(
		donor_name=donor_name or '',
		email=donor_email or '',
		amount=Decimal(str(amount)),
		fund=fund,
		method='stripe',
		recurring=recurring,
		status='pending',
	)

	stripe.api_key = settings.STRIPE_SECRET_KEY
	currency = getattr(settings, 'STRIPE_CURRENCY', 'usd')
	amount_in_minor_units = int((Decimal(str(amount)) * Decimal('100')).to_integral_value(rounding=ROUND_HALF_UP))
	success_url = f"{_frontend_origin()}/donations/success?session_id={{CHECKOUT_SESSION_ID}}"
	cancel_url = f"{_frontend_origin()}/donations/cancel"

	try:
		session = stripe.checkout.Session.create(
			mode='subscription' if recurring else 'payment',
			payment_method_types=['card'],
			customer_email=donor_email or None,
			success_url=success_url,
			cancel_url=cancel_url,
			line_items=[{
				'price_data': {
					'currency': currency,
					'product_data': {'name': fund.name},
					'unit_amount': amount_in_minor_units,
					**({'recurring': {'interval': 'month'}} if recurring else {}),
				},
				'quantity': 1,
			}],
			metadata={'donation_id': str(donation.id), 'fund_id': str(fund.id)},
		)
	except Exception:
		Donation.objects.filter(pk=donation.pk).update(status='failed')
		raise

	Donation.objects.filter(pk=donation.pk).update(external_ref=session.id)
	return session.url

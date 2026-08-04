from base64 import b64encode
from decimal import Decimal, ROUND_HALF_UP

import requests
from django.conf import settings
from django.utils import timezone

from ..models import Donation, Fund


def _normalise_phone(phone):
	digits = ''.join(character for character in phone if character.isdigit())
	if digits.startswith('0') and len(digits) == 10:
		return f'254{digits[1:]}'
	if digits.startswith('254') and len(digits) >= 12:
		return digits
	if len(digits) == 9:
		return f'254{digits}'
	raise ValueError('Phone number must be in a valid Kenyan mobile format.')


def initiate_stk_push(phone, amount, fund_id):
	fund = Fund.objects.get(pk=fund_id)
	donation = Donation.objects.create(
		donor_name='',
		email='',
		amount=Decimal(str(amount)),
		fund=fund,
		method='mpesa',
		recurring=False,
		status='pending',
	)

	shortcode = settings.MPESA_SHORTCODE
	consumer_key = settings.MPESA_CONSUMER_KEY
	consumer_secret = settings.MPESA_CONSUMER_SECRET
	passkey = settings.MPESA_PASSKEY
	base_url = getattr(settings, 'MPESA_BASE_URL', 'https://sandbox.safaricom.co.ke')
	callback_url = getattr(settings, 'MPESA_CALLBACK_URL', 'http://localhost:8000/api/v1/giving/webhook/mpesa/')

	timestamp = timezone.localtime(timezone.now()).strftime('%Y%m%d%H%M%S')
	password = b64encode(f'{shortcode}{passkey}{timestamp}'.encode()).decode()
	phone_number = _normalise_phone(phone)
	amount_value = int(Decimal(str(amount)).to_integral_value(rounding=ROUND_HALF_UP))

	try:
		token_response = requests.get(
			f'{base_url}/oauth/v1/generate?grant_type=client_credentials',
			auth=(consumer_key, consumer_secret),
			timeout=10,
		)
		token_response.raise_for_status()
		access_token = token_response.json()['access_token']

		stk_payload = {
			'BusinessShortCode': shortcode,
			'Password': password,
			'Timestamp': timestamp,
			'TransactionType': 'CustomerPayBillOnline',
			'Amount': amount_value,
			'PartyA': phone_number,
			'PartyB': shortcode,
			'PhoneNumber': phone_number,
			'CallBackURL': callback_url,
			'AccountReference': fund.name,
			'TransactionDesc': f'Donation for {fund.name}',
		}
		stk_response = requests.post(
			f'{base_url}/mpesa/stkpush/v1/processrequest',
			json=stk_payload,
			headers={
				'Authorization': f'Bearer {access_token}',
				'Content-Type': 'application/json',
			},
			timeout=10,
		)
		stk_response.raise_for_status()
		result = stk_response.json()

		if result.get('ResponseCode') != '0':
			Donation.objects.filter(pk=donation.pk).update(status='failed')
			raise ValueError(result.get('ResponseDescription', 'M-Pesa STK push failed.'))

	except Exception:
		Donation.objects.filter(pk=donation.pk).update(status='failed')
		raise

	Donation.objects.filter(pk=donation.pk).update(external_ref=result.get('CheckoutRequestID', ''))
	return {
		'checkout_request_id': result.get('CheckoutRequestID'),
		'merchant_request_id': result.get('MerchantRequestID'),
		'customer_message': result.get('CustomerMessage', 'M-Pesa STK push initiated.'),
	}

from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import DonationCheckoutAPIView, FundViewSet, MpesaWebhookAPIView, StripeWebhookAPIView


router = DefaultRouter()
router.register('funds', FundViewSet, basename='fund')


urlpatterns = [
    path('checkout/', DonationCheckoutAPIView.as_view(), name='donation-checkout'),
    path('webhook/stripe/', StripeWebhookAPIView.as_view(), name='stripe-webhook'),
    path('webhook/mpesa/', MpesaWebhookAPIView.as_view(), name='mpesa-webhook'),
]

urlpatterns += router.urls

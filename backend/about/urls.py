from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import AboutPageView, GalleryImageViewSet, LeaderProfileViewSet

router = DefaultRouter()
router.register('gallery', GalleryImageViewSet, basename='gallery')
router.register('leaders', LeaderProfileViewSet, basename='leader')

urlpatterns = [
    path('about-page/', AboutPageView.as_view(), name='about-page'),
] + router.urls

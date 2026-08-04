from rest_framework.routers import DefaultRouter
from .views import SermonViewSet

router = DefaultRouter()
router.register('', SermonViewSet, basename='sermon')

urlpatterns = router.urls

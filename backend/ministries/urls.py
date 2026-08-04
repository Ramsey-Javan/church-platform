from rest_framework.routers import DefaultRouter

from .views import MinistryViewSet, SmallGroupViewSet


router = DefaultRouter()
router.register('ministries', MinistryViewSet, basename='ministry')
router.register('small-groups', SmallGroupViewSet, basename='small-group')


urlpatterns = router.urls

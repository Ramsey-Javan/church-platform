from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/sermons/', include('sermons.urls')),
    path('api/v1/events/', include('events.urls')),
    path('api/v1/ministries/', include('ministries.urls')),
    path('api/v1/connect/', include('connect.urls')),
    path('api/v1/giving/', include('giving.urls')),
    path('api/v1/program/', include('program.urls')),
    path('api/v1/about/', include('about.urls')),       
    path('api/v1/', include('core.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
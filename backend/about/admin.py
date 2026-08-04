from django.contrib import admin
from .models import AboutPage, GalleryImage, LeaderProfile

admin.site.register(AboutPage)


@admin.register(GalleryImage)
class GalleryImageAdmin(admin.ModelAdmin):
    list_display = ('caption', 'category', 'order')
    list_filter = ('category',)


@admin.register(LeaderProfile)
class LeaderProfileAdmin(admin.ModelAdmin):
    list_display = ('name', 'role', 'order')

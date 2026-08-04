from django.contrib import admin

from .models import Ministry, SmallGroup


@admin.register(Ministry)
class MinistryAdmin(admin.ModelAdmin):
	list_display = ('name', 'leader_contact')
	search_fields = ('name', 'leader_contact', 'description')


@admin.register(SmallGroup)
class SmallGroupAdmin(admin.ModelAdmin):
	list_display = ('name', 'ministry', 'location_area', 'meeting_day', 'meeting_time', 'capacity')
	search_fields = ('name', 'location_area', 'meeting_day', 'meeting_time', 'leader_contact', 'ministry__name')

from django.contrib import admin
from django.utils.html import format_html

from .models import ConnectCard


@admin.register(ConnectCard)
class ConnectCardAdmin(admin.ModelAdmin):
	list_display = ('name', 'email', 'prayer_request_badge', 'created_at')
	list_filter = ('is_prayer_request', 'created_at')
	search_fields = ('name', 'email', 'phone', 'how_heard', 'message')
	ordering = ('-created_at',)

	@admin.display(description='Prayer Request', ordering='is_prayer_request')
	def prayer_request_badge(self, obj):
		if obj.is_prayer_request:
			return format_html('<strong style="color: #b91c1c;">Yes</strong>')
		return format_html('<span style="color: #15803d;">No</span>')

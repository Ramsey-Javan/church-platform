from django.contrib import admin

from .models import Donation, Fund


@admin.register(Fund)
class FundAdmin(admin.ModelAdmin):
	list_display = ('name', 'active')
	list_filter = ('active',)
	search_fields = ('name', 'description')


@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
	list_display = ('amount', 'fund', 'method', 'status', 'created_at')
	list_filter = ('method', 'status', 'fund')
	search_fields = ('donor_name', 'email', 'external_ref')
	ordering = ('-created_at',)

	def has_module_permission(self, request):
		return request.user.is_superuser

	def has_view_permission(self, request, obj=None):
		return request.user.is_superuser

	def has_add_permission(self, request):
		return False

	def has_change_permission(self, request, obj=None):
		return False

	def has_delete_permission(self, request, obj=None):
		return False

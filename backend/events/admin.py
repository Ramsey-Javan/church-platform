from django.contrib import admin
from .models import Event, EventCategory, RSVP


@admin.register(EventCategory)
class EventCategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)


class RSVPInline(admin.TabularInline):
    model = RSVP
    extra = 0
    readonly_fields = ('created_at',)


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'start', 'end', 'registration_required', 'capacity')
    list_filter = ('category', 'registration_required')
    search_fields = ('title', 'location')
    inlines = [RSVPInline]
from django.contrib import admin
from .models import Service, ProgramItem


class ProgramItemInline(admin.TabularInline):
    model = ProgramItem
    extra = 1
    ordering = ('order', 'time')


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'event')
    list_filter = ('date',)
    inlines = [ProgramItemInline]

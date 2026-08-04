from django.contrib import admin
from .models import Sermon, Series, Speaker

admin.site.register(Speaker)
admin.site.register(Series)


@admin.register(Sermon)
class SermonAdmin(admin.ModelAdmin):
    list_display = ('title', 'speaker', 'series', 'date')
    list_filter = ('speaker', 'series')
    search_fields = ('title', 'scripture_refs', 'topic_tags')

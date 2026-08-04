from django.db import models


class EventCategory(models.Model):
    name = models.CharField(max_length=100)  # Youth, Men, Women, Outreach...

    def __str__(self):
        return self.name


class Event(models.Model):
    title = models.CharField(max_length=200)
    category = models.ForeignKey(EventCategory, on_delete=models.SET_NULL, null=True, related_name='events')
    description = models.TextField(blank=True)
    location = models.CharField(max_length=250, blank=True)
    start = models.DateTimeField()
    end = models.DateTimeField()
    registration_required = models.BooleanField(default=False)
    capacity = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        ordering = ['start']

    def __str__(self):
        return self.title


class RSVP(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='rsvps')
    name = models.CharField(max_length=150)
    email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)

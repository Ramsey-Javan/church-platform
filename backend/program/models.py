from django.db import models


class Service(models.Model):
    """
    A single day's gathering with a full timed agenda.
    Can stand alone (e.g. a regular Sunday service by date) or be linked
    to a specific Event (e.g. a youth conference's full program).
    """
    date = models.DateField()
    title = models.CharField(max_length=200, default="Sunday Service")
    event = models.ForeignKey(
        'events.Event', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='service_programs',
        help_text="Optional — link this program to a specific Event",
    )

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.title} — {self.date}"


class ProgramItem(models.Model):
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='items')
    order = models.PositiveIntegerField(default=0)
    time = models.TimeField(null=True, blank=True)
    title = models.CharField(max_length=200)
    leader = models.CharField(max_length=150, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['order', 'time']

    def __str__(self):
        return f"{self.title} ({self.service})"

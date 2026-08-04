from django.db import models


class ConnectCard(models.Model):
    name = models.CharField(max_length=150)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    how_heard = models.CharField(max_length=200, blank=True)
    message = models.TextField(blank=True)
    is_prayer_request = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.created_at:%Y-%m-%d})"

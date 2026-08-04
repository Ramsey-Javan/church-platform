from django.db import models
from django.core.exceptions import ValidationError


class ChurchSettings(models.Model):
    """Singleton — only one row should ever exist."""
    name = models.CharField(max_length=200)
    logo = models.ImageField(upload_to='branding/', blank=True, null=True)
    tagline = models.CharField(max_length=200, blank=True, help_text="Short line under the name, optional")
    address = models.CharField(max_length=300)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    service_times = models.TextField(help_text="e.g. Sundays 9am & 11am")
    live_stream_url = models.URLField(blank=True, help_text="YouTube/Vimeo embed URL")
    phone = models.CharField(max_length=30, blank=True)
    email = models.EmailField(blank=True)
    facebook_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    facebook_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)

    MPESA_TYPE_CHOICES = [('paybill', 'Paybill'), ('till', 'Till / Buy Goods')]
    mpesa_business_type = models.CharField(
        max_length=10, choices=MPESA_TYPE_CHOICES, default='paybill',
        help_text="Determines the manual-payment instructions shown on the Give page",
    )
    mpesa_business_number = models.CharField(
        max_length=20, blank=True,
        help_text="Your Paybill or Till number. Leave blank until you're registered with Safaricom — the manual instructions section stays hidden until this is filled in.",
    )

    class Meta:
        verbose_name_plural = "Church settings"

    def save(self, *args, **kwargs):
        if not self.pk and ChurchSettings.objects.exists():
            raise ValidationError("Only one ChurchSettings instance is allowed.")
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

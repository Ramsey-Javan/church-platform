from django.db import models
from django.core.exceptions import ValidationError


class AboutPage(models.Model):
    """Singleton — mission/history copy for the About page."""
    mission_statement = models.TextField(blank=True)
    history = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = "About page"

    def save(self, *args, **kwargs):
        if not self.pk and AboutPage.objects.exists():
            raise ValidationError("Only one AboutPage instance is allowed.")
        super().save(*args, **kwargs)

    def __str__(self):
        return "About Page"


class GalleryImage(models.Model):
    image = models.ImageField(upload_to='gallery/')
    caption = models.CharField(max_length=200, blank=True)
    category = models.CharField(max_length=100, blank=True, help_text="e.g. Worship, Youth, Outreach")
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    is_featured = models.BooleanField(
        default=False,
        help_text="Featured photos get the large hero/parallax treatment on the About page.",
    )

    class Meta:
        ordering = ['order', '-id']

    def __str__(self):
        return self.caption or f"Gallery image {self.id}"


class LeaderProfile(models.Model):
    name = models.CharField(max_length=150)
    role = models.CharField(max_length=150, help_text="e.g. Senior Pastor, Youth Director")
    bio = models.TextField(blank=True)
    photo = models.ImageField(upload_to='leaders/', blank=True, null=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'name']

    def __str__(self):
        return f"{self.name} ({self.role})"
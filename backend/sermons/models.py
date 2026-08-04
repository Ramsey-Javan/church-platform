from django.db import models


class Speaker(models.Model):
    name = models.CharField(max_length=150)
    bio = models.TextField(blank=True)
    photo = models.ImageField(upload_to='speakers/', blank=True, null=True)

    def __str__(self):
        return self.name


class Series(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    cover_image = models.ImageField(upload_to='series/', blank=True, null=True)

    def __str__(self):
        return self.title


class Sermon(models.Model):
    title = models.CharField(max_length=250)
    speaker = models.ForeignKey(Speaker, on_delete=models.SET_NULL, null=True, related_name='sermons')
    series = models.ForeignKey(Series, on_delete=models.SET_NULL, null=True, blank=True, related_name='sermons')
    date = models.DateField()
    scripture_refs = models.CharField(max_length=300, blank=True, help_text="e.g. John 3:16-21")
    topic_tags = models.CharField(max_length=300, blank=True, help_text="comma-separated")
    video_url = models.URLField(blank=True)
    audio_file = models.FileField(upload_to='sermons/audio/', blank=True, null=True)
    slides_file = models.FileField(upload_to='sermons/slides/', blank=True, null=True)
    transcript_text = models.TextField(blank=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.title} ({self.date})"

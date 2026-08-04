from django.db import models


class Ministry(models.Model):
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    leader_contact = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return self.name


class SmallGroup(models.Model):
    name = models.CharField(max_length=150)
    ministry = models.ForeignKey(Ministry, on_delete=models.SET_NULL, null=True, blank=True, related_name='small_groups')
    location_area = models.CharField(max_length=150, blank=True)
    meeting_day = models.CharField(max_length=50, blank=True)
    meeting_time = models.CharField(max_length=50, blank=True)
    leader_contact = models.CharField(max_length=200, blank=True)
    capacity = models.PositiveIntegerField(null=True, blank=True)

    def __str__(self):
        return self.name

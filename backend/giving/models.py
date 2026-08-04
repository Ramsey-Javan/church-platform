from django.db import models


class Fund(models.Model):
    name = models.CharField(max_length=150)  # General, Missions, Building Project...
    description = models.TextField(blank=True)
    active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Donation(models.Model):
    METHOD_CHOICES = [('stripe', 'Stripe'), ('mpesa', 'M-Pesa')]
    STATUS_CHOICES = [('pending', 'Pending'), ('completed', 'Completed'), ('failed', 'Failed')]

    donor_name = models.CharField(max_length=150, blank=True)
    email = models.EmailField(blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    fund = models.ForeignKey(Fund, on_delete=models.SET_NULL, null=True, related_name='donations')
    method = models.CharField(max_length=10, choices=METHOD_CHOICES)
    recurring = models.BooleanField(default=False)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    external_ref = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model. Roles are handled via Django Groups
    (Admin, Content Editor, Finance Viewer) rather than a role field,
    so permissions stay manageable from /admin/.
    """
    phone = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return self.get_full_name() or self.username

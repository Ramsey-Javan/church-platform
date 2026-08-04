from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        from django.db.models.signals import post_migrate
        post_migrate.connect(create_default_groups, sender=self)


def create_default_groups(sender, **kwargs):
    """Creates the RBAC groups on first migrate: Admin, Content Editor, Finance Viewer."""
    from django.contrib.auth.models import Group
    for name in ['Content Editor', 'Finance Viewer']:
        Group.objects.get_or_create(name=name)

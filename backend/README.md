# Church Platform — Backend

Django 5 + DRF backend. See `/mnt/skills` plan doc for full architecture.

## Setup
```bash
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in DB creds, Stripe/M-Pesa keys
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## App status
- accounts, core, sermons — fully wired (models, serializers, views, urls, admin)
- events, ministries, connect, giving — models done, urls/views/serializers are TODO stubs
  (follow the `sermons` app as the reference pattern for each)

## RBAC
Groups auto-created on first migrate: "Content Editor", "Finance Viewer".
Assign in /admin/ under Users → Groups. Admin group is Django's built-in superuser/staff.

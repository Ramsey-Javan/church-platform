#!/bin/bash
set -e

echo "=== Running migrations ==="
python manage.py migrate --noinput

echo "=== Collecting static files ==="
python manage.py collectstatic --noinput

echo "=== Creating superuser if needed ==="
python << 'PYEOF'
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.prod')
import django
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@church.com', os.environ.get('ADMIN_PASSWORD', 'changeme123'))
    print('✅ Superuser created: admin / changeme123')
else:
    print('✅ Superuser already exists')
PYEOF

echo "=== Starting gunicorn ==="
exec gunicorn config.wsgi:application
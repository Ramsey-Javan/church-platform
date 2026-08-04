from .base import *  # noqa
from decouple import config

DEBUG = False

SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

STORAGES = {
    "default": {
        "BACKEND": "storages.backends.s3boto3.S3Boto3Storage",
    },
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}
AWS_ACCESS_KEY_ID = config('R2_ACCESS_KEY_ID', default='')
AWS_SECRET_ACCESS_KEY = config('R2_SECRET_ACCESS_KEY', default='')
AWS_STORAGE_BUCKET_NAME = config('R2_BUCKET_NAME', default='')
AWS_S3_ENDPOINT_URL = config('R2_ENDPOINT_URL', default='')

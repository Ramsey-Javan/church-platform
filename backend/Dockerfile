FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# psycopg2 needs libpq + build tools at install time
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /app/staticfiles /app/media

EXPOSE 8000

# Dev overrides this command via docker-compose.yml (runserver + migrate).
# This default is the production entrypoint.
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
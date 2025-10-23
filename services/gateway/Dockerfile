FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# system deps
RUN apt-get update && apt-get install -y build-essential libpq-dev && rm -rf /var/lib/apt/lists/*

# copy & install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# copy project
COPY . .

# collect static kalau kamu punya (opsional; kita proxy /static ke gateway)
# RUN python manage.py collectstatic --noinput

# media directory
RUN mkdir -p /app/media && chmod -R 777 /app/media
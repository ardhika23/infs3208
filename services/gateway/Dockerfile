FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app

RUN apt-get update \
 && apt-get install -y --no-install-recommends wget \
 && rm -rf /var/lib/apt/lists/*

COPY services/gateway/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# copy kode
COPY services/gateway/ /app/
COPY services/detect_svc/ /app/detect_svc/

ENV PYTHONPATH="/app:${PYTHONPATH}"
RUN mkdir -p /app/media && chmod -R 777 /app/media || true
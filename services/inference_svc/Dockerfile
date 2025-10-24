FROM python:3.11-slim

# Hindari .pyc & buffer
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# OpenCV runtime deps (libGL & glib) – wajib biar cv2 bisa import
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      libgl1 \
      libglib2.0-0 \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN apt-get update \
 && apt-get install -y --no-install-recommends libgl1 libglib2.0-0 wget \
 && rm -rf /var/lib/apt/lists/*

# Install deps (pin versi compatible dengan NumPy 1.x)
COPY requirements.txt .
RUN pip install --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

# Copy app
COPY . .

EXPOSE 8001
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8001"]
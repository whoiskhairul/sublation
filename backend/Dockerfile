# backend/Dockerfile
FROM python:3.10.3-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Install system-level dependencies required by textract
RUN apt-get update && apt-get install -y \
  poppler-utils \
  libxslt1-dev \
  antiword \
  unrtf \
  tesseract-ocr \
  flac \
  ffmpeg \
  lame \
  libjpeg-dev \
  libpng-dev \
  libtiff-dev \
  zlib1g-dev \
  ghostscript \
  && apt-get clean

# Install SQLite and Redis
RUN apt-get update && apt-get install -y \
    sqlite3 \
    libsqlite3-dev \
    redis-server

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project code
COPY . .

# Exposing the ports we need (example: Django on 8000, Redis on 6379)
EXPOSE 8000 6379
# EXPOSE 6379  

# Start Redis, run makemigrations, migrate, and then start Django with gunicorn.
CMD ["sh", "-c", "redis-server --bind 0.0.0.0 --port 6379 & python manage.py makemigrations && python manage.py migrate && gunicorn backend.wsgi:application --bind 0.0.0.0:8000"]

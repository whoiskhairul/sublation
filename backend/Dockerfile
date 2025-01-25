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

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# RUN python manage.py collectstatic --noinput

# Copy project code
COPY . .



# Exposing the ports we need (example: Django on 8000, Redis on 6379)
EXPOSE 8000
# EXPOSE 6379

# Start Redis and Django in the same container.
# CMD ["sh", "-c", "redis-server --bind 0.0.0.0 --port 6379 & python manage.py runserver 0.0.0.0:8000"]


CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000", ]
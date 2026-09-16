FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Install system-level dependencies and tools
RUN apt-get update && apt-get install -y --no-install-recommends \
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
    sqlite3 \
    libsqlite3-dev \
    redis-server \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project code
COPY . .

# Create static directory and collect static files
# RUN mkdir -p staticfiles && python manage.py collectstatic --noinput

# Exposing the ports we need (example: Django on 8000, Redis on 6379)
EXPOSE 8000 6379
# EXPOSE 6379  

# Start Redis, run migrations, collectstatic, and start ASGI server with daphne (handling both HTTP and WebSockets)
CMD ["sh", "-c", "redis-server --bind 0.0.0.0 --port 6379 & python manage.py migrate && python manage.py collectstatic --noinput && daphne -b 0.0.0.0 -p 8000 backend.asgi:application"]

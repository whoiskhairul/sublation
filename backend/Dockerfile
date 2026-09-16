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

# Expose only web application port
EXPOSE 8000

# Run migrations with --fake-initial, collectstatic, and start Daphne ASGI server
CMD ["sh", "-c", "python manage.py migrate --fake-initial && python manage.py collectstatic --noinput && daphne -b 0.0.0.0 -p 8000 backend.asgi:application"]

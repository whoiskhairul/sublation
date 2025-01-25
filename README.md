# Group06-Sublation


## Project Overview
This repository contains a full-stack application using:
- **Backend:** Django.
- **Frontend:** React, powered by Vite.
- **Docker:** For platform-independent development and deployment.

---

## Project Structure
```
.
├── Backend
│   ├── Dockerfile
│   ├── manage.py
│   └── requirements.txt
│   └── .env
├── Frontend
│   ├── public
│   ├── src
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## Prerequisites
Ensure the following are installed on your system:
- **Git**
- **Docker** and **Docker Compose**
- **Python 3.10+** (for local development)
- **Node.js 18+** (for local development)

---

## Environment Variables
Create a `.env` file in the root of the project with the following content:
```env
# OpenAI API Key
OPENAI_API_KEY="******"

# Email Configuration
EMAIL_HOST_USER="****@gmail.com"
EMAIL_HOST_PASSWORD="*******"
```
> **Note:** Never commit the `.env` file to version control.

---

## Setup Instructions

### Step 1: Clone the Repository
```bash
git clone <repository-url>
```

### Step 2: Start the Application with Docker
```bash
docker-compose up --build
```

- **Backend:** Accessible at [http://localhost:8000](http://localhost:8000)
- **Frontend:** Accessible at [http://localhost:3000](http://localhost:3000)

### Step 3: Run Database Migrations
For the backend Django application to work correctly, apply migrations:
```bash
docker-compose exec backend python manage.py migrate
```

### Step 4: Add a Superuser (Optional)
To create an admin account:
```bash
docker-compose exec backend python manage.py createsuperuser
```

---

## Local Development Without Docker (Optional)

### Backend (Django)
1. Navigate to the `Backend` folder:
   ```bash
   cd Backend
   ```
2. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # For Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Run the server:
   ```bash
   python manage.py runserver
   ```

### Frontend (React with Vite)
1. Navigate to the `Frontend` folder:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

### Backend (Django)
- **Django settings**:
  The project uses `settings.py`, configured to work seamlessly with Docker and `.env` variables.

- **Email Configuration**:
  Make sure the email host user and password are correctly set in the `.env` file.

### Frontend (React with Vite)
- The `vite.config.js` file is pre-configured for local development and production builds.

---


### Some Basic Docker Commands
- **Start services:**
  ```bash
  docker-compose up
  ```
- **Rebuild services:**
  ```bash
  docker-compose up --build
  ```
- **Stop services:**
  ```bash
  docker-compose down
  ```
- **Access a container shell:**
  ```bash
  docker-compose exec <service-name> sh
  ```

### Backend Commands
- **Apply migrations:**
  ```bash
  docker-compose exec backend python manage.py migrate
  ```
- **Create superuser:**
  ```bash
  docker-compose exec backend python manage.py createsuperuser
  ```

---

##  Notes
1. Ensure that your `.env` file is configured correctly before starting the application.
2. Always stop and rebuild containers after changes to the Dockerfile or dependencies.
3. For production, additional configurations like database setup, SSL, and environment-specific settings are recommended.


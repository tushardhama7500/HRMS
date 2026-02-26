# HRMS Lite - Minimalist HR Management System

HRMS Lite is a compact, high-performance Human Resource Management System built with a **Pure Django JSON API** backend and a **React (Vite)** frontend. It is designed to be ultra-lean, removing all unnecessary boilerplate and focusing on core daily operations.

## ✨ Key Features

- **Dashboard Overview**: Real-time stats for total employees, and today's "Present" vs "Absent" counts.
- **Smart Status Indicators**: Visual green/red dots on the employee list for instant daily status tracking.
- **Quick Attendance**: Mark attendance directly via a fast, non-intrusive modal system.
- **Advanced History**: View detailed attendance logs with:
  - Paginated history records.
  - 3-month historical filtering.
- **Pure API Architecture**: Completely decoupled frontend and backend for maximum speed and simplicity.

---

## 🚀 Tech Stack

- **Frontend**: React.js, Vite, Axios, Tailwind CSS.
- **Backend**: Python, Django (Consolidated Minimalist Structure).
- **Database**: SQLite3 (Local & Lightweight).

---

## 🛠️ Installation & Setup

### 1. Backend Setup (Django)

Navigate to the backend directory and set up the environment:

```bash
cd backend
# Install dependencies
pip install django django-cors-headers
# Start the server
python manage.py runserver
```

_The API will be available at: http://localhost:8000_

### 2. Frontend Setup (React)

Navigate to the frontend directory and install dependencies:

```bash
cd frontend/hrms
# Install dependencies
npm install
# Start development server
npm run dev
```

_The UI will be available at: http://localhost:5174_

---

## 📂 Project Structure

```text
Hr/
├── backend/
│   ├── manage.py
│   ├── db.sqlite3
│   └── hrms_backend/      # Consolidated API Logic
│       ├── settings.py    # Minimalist Config
│       ├── models.py      # Database Schema
│       ├── views.py       # API Endpoints
│       └── urls.py        # Global Routes
└── frontend/
    └── hrms/              # React (Vite) Application
```

## 📝 License

This project is open-source and follows the standard MIT license.

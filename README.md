# 📦 WarehouseOS

> Enterprise-style Inventory & Warehouse Management System built with Django REST Framework and React.

WarehouseOS is a full-stack inventory management system designed to simulate a real-world warehouse environment. The project focuses on backend architecture, data integrity, role-based authorization, and scalable application design.

---

## ✨ Features

### 🔐 Authentication & Authorization

- JWT Authentication (Access & Refresh Token)
- Secure Login / Logout
- Protected API Endpoints
- Role-Based Access Control (RBAC)
- Granular User Permissions

Example permissions:

- Manage Products
- Manage Warehouses
- Manage Users
- Manage Auto Reorder

---

### 📦 Inventory Management

- Product Management
- Category Management
- Warehouse Management
- Stock Movement
    - Stock In
    - Stock Out
    - Stock Adjustment
- Inventory History
- Activity Log

---

### 📊 Dashboard

- Inventory Summary
- Warehouse Summary
- Low Stock Overview
- Recent Activities

---

### ⚡ Performance

- Server-side Pagination
- Search API
- React Query Cache
- Optimized Database Queries

---

### 🛡 Data Integrity

Stock movement is protected using

- Database Transactions
- `transaction.atomic()`

to prevent inconsistent inventory updates.

---

### 👥 User Management

Administrator can

- Create Users
- Update User Information
- Enable / Disable Permissions
- Manage User Roles

Permissions are validated on

- Frontend (UI)
- Backend (API)

---

## 🏗 System Architecture

```
React (Vite)
        │
React Query
        │
 REST API
        │
Django REST Framework
        │
Business Logic
        │
 PostgreSQL
```

---

## 🛠 Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- shadcn/ui
- React Query
- React Hook Form
- Zod

### Backend

- Python
- Django
- Django REST Framework
- SimpleJWT

### Database

- PostgreSQL

### Infrastructure

- Docker
- Docker Compose

### Testing

- Vitest *(Coming Soon)*

### Background Tasks

- Redis
- Celery *(Coming Soon)*

---

## 📁 Project Structure

```
WarehouseOS
│
├── backend
│     ├── apps
│     ├── config
│     ├── requirements.txt
│     └── Dockerfile
│
├── frontend
│     ├── src
│     ├── components
│     ├── pages
│     └── Dockerfile
│
├── docker-compose.yml
└── README.md
```

---

## 🚀 Running with Docker

```bash
docker compose up --build
```

Backend

```
http://localhost:8000
```

Frontend

```
http://localhost:5173
```

---

## 🌱 Data Seeding

This project includes a custom Django management command that automatically generates **150 mock products** for testing purposes. It is designed to simplify UI testing, search functionality, and pagination during development.

### ⚠️ Prerequisites

The seeding process requires at least one administrator account because all generated products are linked to an existing admin user and recorded in the `ActivityLog`.

Make sure you have created a superuser before running the command.

```bash
python manage.py createsuperuser
```

### 🚀 Generate Mock Data

Run the following command to generate 150 sample products:

```bash
python manage.py seed_products
```

### 📌 Notes

- Generates **150 random products**.
- Automatically assigns a warehouse and category.
- Records all actions in the activity log.
- Useful for testing:
  - Search functionality
  - Pagination
  - Inventory management pages
  - Dashboard statistics

---

## 📷 Screenshots

### Dashboard

(Add Screenshot)

---

### Product Management

(Add Screenshot)

---

### Warehouse Management

(Add Screenshot)

---

### User Management

(Add Screenshot)

---

## 🎯 Why I Built This Project

This project was built to practice real-world backend development rather than simple CRUD operations.

The main goals were to learn

- REST API Design
- Authentication
- Authorization
- Transaction Management
- Docker
- PostgreSQL
- React Query
- Full-stack Architecture

while following patterns commonly used in production applications.

---

## 🔮 Roadmap

- [x] JWT Authentication
- [x] Role-Based Permissions
- [x] Warehouse CRUD
- [x] Inventory Movement
- [x] User Management
- [x] Docker Support
- [ ] Redis + Celery
- [ ] Notification System
- [ ] Unit Testing
- [ ] Change Password (User Profile)
- [ ] User Search
- [ ] User Pagination
- [ ] Soft Delete / Disable User
- [ ] Improved Activity Log
- [ ] Better User Management Experience

---

## 👨‍💻 Author

**Voraprat Pringplang**

GitHub

https://github.com/pbvoraprat1

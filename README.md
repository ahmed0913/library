# 📚 Library Management System

> A Modern, Full-Stack Library Management System

**Flask · React · SQLite/MySQL · JWT Authentication**

**Developed by Ahmed Youssef**

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Screenshots](#-screenshots)
- [System Architecture](#-system-architecture)
- [Database Schema](#-database-schema)
- [Role and Permission Matrix](#-role--permission-matrix)
- [Authentication Flow](#-authentication-flow)
- [Borrowing Lifecycle](#-borrowing-lifecycle)
- [Fine Calculation Logic](#-fine-calculation-logic)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Setup and Installation](#-setup--installation)
- [Default Credentials](#-default-credentials)
- [Frontend Pages](#-frontend-pages)
- [Business Rules](#-business-rules)

---

## 🧠 Overview

A production-ready Library Management System designed to handle real-world library operations. The system supports **three user roles** (Admin, Librarian, Student), manages book inventory, tracks borrowing/return workflows, applies automatic late fines, sends in-app notifications, and maintains a full audit trail of every action.

> **Note:** No public registration. Users are created exclusively by the Admin.

### Key Highlights

| Feature | Description |
|---------|-------------|
| 🔐 JWT Authentication | Secure, stateless token-based login with role claims |
| 👥 Role-Based Access | Granular permissions per role (Admin / Librarian / User) |
| 📖 Book Catalog | Grid display with cover images, search, and category filtering |
| 🔄 Borrowing System | Full borrow - due - return lifecycle with stock tracking |
| 💰 Automatic Fines | Tiered fine engine (10% base + daily escalation) |
| 🔔 Notifications | Real-time in-app alerts for fines, limits, and overdue items |
| 📝 Activity Logs | Complete audit trail of all CRUD and borrowing operations |
| 📊 Dashboard | Live statistics, top borrowed books, and recent activity feed |

---

## 📸 Screenshots

### Login Page

![Login Page](screenshots/login.png)

### Admin Dashboard

![Dashboard](screenshots/dashboard.png)

### Books Catalog (Card Grid)

![Books](screenshots/books.png)

### Book Details View

![Book Details](screenshots/book_details.png)

### Borrowing Management

![Borrowings](screenshots/borrowings.png)

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                   │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │  Pages   │  │ React Router │  │ AuthContext (JWT)      │  │
│  └────┬─────┘  └──────┬───────┘  └───────────┬───────────┘  │
│       └───────────────┬──────────────────────┘              │
│                       ▼                                      │
│              Axios Interceptor                               │
│           (attaches Bearer token)                            │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP + JWT Token
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Flask REST API)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ JWT Middleware│─▶│@role_required│─▶│ Blueprint Routes  │  │
│  └──────────────┘  └──────────────┘  └────────┬──────────┘  │
│                                                │             │
│    Routes: auth, books, users, categories,     │             │
│    borrowings, notifications, dashboard, logs  │             │
└────────────────────────────────────────────────┬─────────────┘
                                                 │
                                                 ▼
┌─────────────────────────────────────────────────────────────┐
│                  DATABASE (SQLite / MySQL)                    │
│                                                              │
│   users · books · categories · borrowings                    │
│   notifications · activity_logs                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗃 Database Schema

### Tables and Relationships

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    USERS     │       │  CATEGORIES  │       │    BOOKS     │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id      (PK) │       │ id      (PK) │       │ id      (PK) │
│ name         │       │ name    (UK) │       │ title        │
│ username (UK)│       │ description  │       │ author       │
│ password     │       │ created_at   │       │ description  │
│ role         │       └──────┬───────┘       │ category_id(FK)
│ created_at   │              │               │ price        │
└──────┬───────┘              │ 1:N           │ image_path   │
       │                      │               │ total_copies │
       │                      └──────────────▶│ avail_copies │
       │                                      │ created_at   │
       │ 1:N                                  └──────┬───────┘
       │                                             │
       ▼                                             │ 1:N
┌──────────────┐                                     │
│  BORROWINGS  │◀────────────────────────────────────┘
├──────────────┤
│ id      (PK) │       ┌──────────────┐
│ user_id (FK) │       │NOTIFICATIONS │
│ book_id (FK) │       ├──────────────┤
│ borrow_date  │       │ id      (PK) │
│ due_date     │       │ user_id (FK) │
│ return_date  │       │ title        │
│ status       │       │ message      │
│ fine_amount  │       │ is_read      │
└──────────────┘       │ created_at   │
                       └──────────────┘
┌──────────────┐
│ACTIVITY_LOGS │
├──────────────┤
│ id      (PK) │
│ action_type  │
│ user_id (FK) │
│ timestamp    │
│ description  │
└──────────────┘
```

### Column Details

- **Users:** Roles are `admin`, `librarian`, or `user`
- **Books:** `available_copies` is auto-managed by the borrowing engine
- **Borrowings:** Status values are `borrowed`, `returned`, or `overdue`

---

## 🛡 Role and Permission Matrix

| Action | Admin | Librarian | User |
|--------|:-----:|:---------:|:----:|
| View Dashboard Statistics | ✅ | ✅ | ❌ |
| Manage Users (CRUD) | ✅ | ❌ | ❌ |
| Manage Categories (CRUD) | ✅ | ❌ | ❌ |
| Manage Books (CRUD) | ✅ | ✅ | ❌ |
| View Books Catalog | ✅ | ✅ | ✅ |
| View Book Details | ✅ | ✅ | ✅ |
| Borrow Books | ❌ | ❌ | ✅ |
| View All Borrowing History | ✅ | ✅ | ❌ |
| View Own Borrowing History | ❌ | ❌ | ✅ |
| Mark Books as Returned | ✅ | ✅ | ❌ |
| View System Activity Logs | ✅ | ❌ | ❌ |
| View Notifications | ✅ | ✅ | ✅ |

---

## 🔐 Authentication Flow

```
Step 1: User enters username + password on Login page
            │
            ▼
Step 2: React sends POST /api/auth/login
            │
            ▼
Step 3: Flask verifies password hash (Werkzeug pbkdf2:sha256)
            │
            ├── ❌ Invalid → Return 401 "Invalid credentials"
            │
            ▼ ✅ Valid
Step 4: Flask creates JWT token with role claim
            │
            ▼
Step 5: React stores token in localStorage
            │
            ▼
Step 6: Axios interceptor attaches "Authorization: Bearer <token>"
        to every subsequent API request
            │
            ▼
Step 7: Flask-JWT-Extended validates token on each request
        @role_required decorator checks if user role is allowed
            │
            ▼
Step 8: API returns data → React renders the UI
```

---

## 🔄 Borrowing Lifecycle

### State Transitions

```
                    ┌─────────────┐
                    │  AVAILABLE  │ (Book in catalog)
                    └──────┬──────┘
                           │ Student clicks "Borrow Now"
                           ▼
                    ┌─────────────┐
              ┌─────│  BORROWED   │
              │     └──────┬──────┘
              │            │
   After 90   │            │ Admin/Librarian
   days       │            │ marks return
              ▼            ▼
       ┌─────────────┐  ┌─────────────┐
       │   OVERDUE   │  │  RETURNED   │──▶ available_copies += 1
       └──────┬──────┘  └──────┬──────┘
              │                │
              │  Admin marks   │ Fine check:
              │  return        │ On time? → No fine
              └────────────────│ Late ≤ 7d? → 10% of price
                               │ Late > 7d? → 10% + 10 EGP/day
                               ▼
                        ┌─────────────┐
                        │ NOTIFICATION│ (if fine > 0)
                        └─────────────┘
```

### Borrowing Constraints

```
Student clicks "Borrow"
    │
    ├── Active borrows >= 3?  ──▶ ❌ REJECT (Limit reached + Notification)
    │
    ├── Has overdue books?    ──▶ ❌ REJECT (Must return overdue first)
    │
    ├── available_copies = 0? ──▶ ❌ REJECT (Out of stock)
    │
    └── All checks pass       ──▶ ✅ CREATE borrowing
                                     • available_copies -= 1
                                     • due_date = today + 90 days
                                     • Log activity
```

---

## 💰 Fine Calculation Logic

The fine engine uses a **tiered escalation model** based on the book price and days late.

### Rules

- **On time or early:** No fine (0 EGP)
- **Late 1-7 days:** 10% of book price
- **Late more than 7 days:** 10% of book price + 10 EGP per additional day beyond 7

### Examples

| Scenario | Book Price | Days Late | Calculation | Fine |
|----------|-----------|-----------|-------------|------|
| On time | 150 EGP | 0 | No fine | **0 EGP** |
| 3 days late | 150 EGP | 3 | 150 x 10% | **15 EGP** |
| 7 days late | 200 EGP | 7 | 200 x 10% | **20 EGP** |
| 15 days late | 200 EGP | 15 | 20 + (8 x 10) | **100 EGP** |
| 30 days late | 100 EGP | 30 | 10 + (23 x 10) | **240 EGP** |

### Code Implementation

```python
def calculate_fine(book_price, due_date, return_date):
    if return_date <= due_date:
        return 0.0

    days_late = (return_date - due_date).days
    base_fine = float(book_price) * 0.10

    if days_late <= 7:
        return base_fine
    else:
        extra_days = days_late - 7
        return base_fine + (extra_days * 10.0)
```

---

## 📡 API Reference

Base URL: `http://localhost:5000/api`

### Authentication

| Method | Endpoint | Body | Response | Auth |
|--------|----------|------|----------|------|
| POST | `/auth/login` | `{username, password}` | `{token, user}` | No |
| GET | `/auth/me` | — | `{user}` | Yes |

### Books

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/books?page=&per_page=&search=&category_id=` | List books (paginated) | All |
| GET | `/books/:id` | Get single book details | All |
| POST | `/books` | Create book (multipart/form-data) | Admin, Librarian |
| PUT | `/books/:id` | Update book | Admin, Librarian |
| DELETE | `/books/:id` | Delete book | Admin, Librarian |

### Users

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/users?per_page=` | List all users | Admin |
| POST | `/users` | Create user | Admin |
| PUT | `/users/:id` | Update user | Admin |
| DELETE | `/users/:id` | Delete user | Admin |

### Borrowings

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/borrowings` | List borrowings (role-filtered) | All |
| POST | `/borrowings` | Borrow a book `{book_id}` | User |
| PUT | `/borrowings/:id/return` | Mark book returned | Admin, Librarian |

### Categories

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/categories` | List all categories | All |
| POST | `/categories` | Create category | Admin |
| PUT | `/categories/:id` | Update category | Admin |
| DELETE | `/categories/:id` | Delete category | Admin |

### Notifications

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/notifications` | Get user notifications | All |
| PUT | `/notifications/:id/read` | Mark one as read | All |
| PUT | `/notifications/read-all` | Mark all as read | All |

### Dashboard and Logs

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/dashboard` | Stats, top books, recent logs | Admin, Librarian |
| GET | `/activity-logs?page=&per_page=` | Full audit trail | Admin |

---

## 📂 Project Structure

```
db_Flask/
│
├── backend/                        # Flask REST API
│   ├── app/
│   │   ├── models/                 # SQLAlchemy ORM Models
│   │   │   ├── user.py             # User model
│   │   │   ├── book.py             # Book model
│   │   │   ├── category.py         # Category model
│   │   │   ├── borrowing.py        # Borrowing model
│   │   │   ├── notification.py     # Notification model
│   │   │   └── activity_log.py     # ActivityLog model
│   │   │
│   │   ├── routes/                 # API Blueprint Routes
│   │   │   ├── auth.py             # Login and token endpoints
│   │   │   ├── books.py            # CRUD + image upload + pagination
│   │   │   ├── users.py            # Admin-only user management
│   │   │   ├── categories.py       # Admin-only categories
│   │   │   ├── borrowings.py       # Borrow and Return lifecycle
│   │   │   ├── notifications.py    # Read and mark notifications
│   │   │   ├── dashboard.py        # Stats and analytics
│   │   │   └── activity_logs.py    # Paginated audit trail
│   │   │
│   │   ├── utils/
│   │   │   ├── decorators.py       # @role_required with JWT claims
│   │   │   └── helpers.py          # calculate_fine() engine
│   │   │
│   │   ├── __init__.py             # App Factory (create_app)
│   │   ├── config.py               # Config from .env
│   │   └── extensions.py           # db, jwt instances
│   │
│   ├── uploads/                    # Book cover image storage
│   ├── .env                        # Environment variables
│   ├── requirements.txt            # Python dependencies
│   ├── run.py                      # Entry point
│   └── seed.py                     # Seed admin + default categories
│
├── frontend/                       # React SPA (Vite)
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js            # Axios instance + JWT interceptor
│   │   ├── components/
│   │   │   └── Layout/
│   │   │       └── Layout.jsx      # Sidebar + Header + Bell badge
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # React Context for auth state
│   │   ├── pages/
│   │   │   ├── Login.jsx           # Login form
│   │   │   ├── Dashboard.jsx       # Stats cards + activity timeline
│   │   │   ├── BooksPage.jsx       # Book grid with search and filters
│   │   │   ├── BookDetailsPage.jsx # Immersive book detail view
│   │   │   ├── BookFormPage.jsx    # Add/Edit book with image upload
│   │   │   ├── UsersPage.jsx       # User CRUD table (Admin)
│   │   │   ├── CategoriesPage.jsx  # Inline category management
│   │   │   ├── BorrowingsPage.jsx  # Kiosk for students / Table for staff
│   │   │   ├── NotificationsPage.jsx  # Notification inbox
│   │   │   └── ActivityLogsPage.jsx   # System audit log (Admin)
│   │   ├── App.jsx                 # Routes + ProtectedRoute wrapper
│   │   ├── index.css               # Global design system
│   │   └── main.jsx                # Vite entry point
│   ├── package.json
│   └── vite.config.js
│
├── screenshots/                    # UI Screenshots
├── schema.sql                      # Reference SQL schema
└── README.md                       # This file
```

---

## 🛠 Tech Stack

### Backend

| Package | Version | Purpose |
|---------|---------|---------|
| Flask | 3.1.0 | Web framework |
| Flask-SQLAlchemy | 3.1.1 | ORM for database models |
| Flask-JWT-Extended | 4.7.1 | JWT token authentication |
| Flask-CORS | 5.0.1 | Cross-origin requests |
| Werkzeug | 3.1.3 | Password hashing |
| PyMySQL | 1.1.1 | MySQL driver (production) |
| python-dotenv | 1.1.0 | Environment variable loader |

### Frontend

| Package | Purpose |
|---------|---------|
| React 18 | UI component library |
| Vite 5 | Build tool and dev server |
| React Router DOM | Client-side routing |
| Axios | HTTP client with interceptors |
| Lucide React | Modern icon system |

---

## 🚀 Setup and Installation

### Prerequisites

- Python 3.9+
- Node.js 18+
- npm or yarn

### Step 1: Clone and Backend Setup

```bash
# Clone the repository
git clone https://github.com/ahmed0913/library.git
cd library

# Create Python virtual environment
python -m venv venv

# Activate it (Windows)
.\venv\Scripts\activate

# Activate it (Mac/Linux)
source venv/bin/activate

# Install Python dependencies
pip install -r backend/requirements.txt
```

### Step 2: Configure Environment

Create `backend/.env`:

```env
DATABASE_URL=sqlite:///../library.db
JWT_SECRET_KEY=your-super-secret-key-change-me
```

To use MySQL in production, change DATABASE_URL to:

```
DATABASE_URL=mysql+pymysql://user:password@localhost:3306/library_db
```

### Step 3: Initialize Database and Start Backend

```bash
# Seed admin account + default categories
python backend/seed.py

# Start Flask server on port 5000
python backend/run.py
```

### Step 4: Frontend Setup

```bash
# In a new terminal
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server on port 3000
npm run dev
```

### Step 5: Open the App

Open your browser and navigate to: **http://localhost:3000**

---

## 🔑 Default Credentials

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `admin123` |
| Role | Admin (full access) |

> **Warning:** Change this password immediately via the Users management panel after your first login.

### Default Seeded Categories

| # | Category |
|---|----------|
| 1 | Fiction |
| 2 | Science |
| 3 | Technology |
| 4 | History |
| 5 | Literature |

---

## 🖥 Frontend Pages

| Page | Route | Access | Description |
|------|-------|--------|-------------|
| Login | `/login` | Public | Credential entry with JWT exchange |
| Dashboard | `/` | All | Stats for Admin or Welcome for Student |
| Books | `/books` | All | Responsive card grid with search |
| Book Details | `/books/:id` | All | Cover image, synopsis, stock |
| Add Book | `/books/add` | Admin, Librarian | Form with image upload |
| Edit Book | `/books/edit/:id` | Admin, Librarian | Pre-filled edit form |
| Borrowings | `/borrowings` | All | Card kiosk or management table |
| Users | `/users` | Admin | Create, edit, delete users |
| Categories | `/categories` | Admin | Inline CRUD for categories |
| Notifications | `/notifications` | All | Inbox with read/unread state |
| Activity Logs | `/logs` | Admin | Paginated system audit trail |

---

## 📋 Business Rules

### Borrowing Rules

- Each student can borrow a **maximum of 3 books** simultaneously
- Students with **overdue books cannot borrow** new ones
- Borrowing period is **90 days** from the borrow date
- Only **Admin** and **Librarian** can mark books as returned

### Fine Rules

- **No fine** if returned on or before the due date
- **10% of book price** if returned within 7 days after due date
- After 7 days: **10% of price + 10 EGP per additional day**
- Fines trigger an **automatic notification** to the student

### Stock Management

- `available_copies` is decremented when a book is borrowed
- `available_copies` is incremented when a book is returned
- A book cannot be borrowed if `available_copies` is 0
- Deleting a category is restricted if it still contains books

### Audit Trail

- Every create, update, and delete action on Books, Users, and Categories is logged
- Borrow and Return operations are logged with full details
- Logs record the acting user ID, action type, timestamp, and description

---

## 👤 Author

**Ahmed Youssef**

---

*Copyright 2026 Ahmed Youssef. All rights reserved.*

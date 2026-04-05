# 📚 Library Management System

> A Modern, Full-Stack Library Management System

**Flask · React · SQLite/MySQL · JWT Authentication**

---

## 📖 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Database Schema](#-database-schema-er-diagram)
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

```mermaid
graph TB
    subgraph Frontend["Frontend - React + Vite"]
        UI["React Components"]
        Router["React Router DOM"]
        AuthCtx["AuthContext - JWT State"]
        Axios["Axios Interceptor"]
    end

    subgraph Backend["Backend - Flask"]
        API["Flask REST API"]
        JWTMw["JWT Middleware"]
        RoleDec["role_required Decorator"]
        Routes["Blueprint Routes"]
    end

    subgraph Database["Database - SQLite or MySQL"]
        Users["users"]
        Books["books"]
        Categories["categories"]
        Borrowings["borrowings"]
        Notifications["notifications"]
        ActivityLogs["activity_logs"]
    end

    UI --> Router --> AuthCtx
    AuthCtx --> Axios
    Axios -->|"HTTP + Bearer Token"| API
    API --> JWTMw --> RoleDec --> Routes
    Routes --> Users
    Routes --> Books
    Routes --> Categories
    Routes --> Borrowings
    Routes --> Notifications
    Routes --> ActivityLogs
```

---

## 🗃 Database Schema (ER Diagram)

```mermaid
erDiagram
    USERS {
        int id PK
        string name
        string username UK
        string password
        string role
        datetime created_at
    }

    CATEGORIES {
        int id PK
        string name UK
        string description
        datetime created_at
    }

    BOOKS {
        int id PK
        string title
        string author
        text description
        int category_id FK
        decimal price
        string image_path
        int total_copies
        int available_copies
        datetime created_at
    }

    BORROWINGS {
        int id PK
        int user_id FK
        int book_id FK
        date borrow_date
        date due_date
        date return_date
        string status
        decimal fine_amount
    }

    NOTIFICATIONS {
        int id PK
        int user_id FK
        string title
        text message
        boolean is_read
        datetime created_at
    }

    ACTIVITY_LOGS {
        int id PK
        string action_type
        int user_id FK
        datetime timestamp
        text description
    }

    USERS ||--o{ BORROWINGS : "borrows"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ ACTIVITY_LOGS : "performs"
    CATEGORIES ||--o{ BOOKS : "contains"
    BOOKS ||--o{ BORROWINGS : "is borrowed"
```

### Column Details

**Users Table** — Roles: `admin`, `librarian`, `user`

**Books Table** — `available_copies` is auto-managed by the borrowing engine

**Borrowings Table** — Status values: `borrowed`, `returned`, `overdue`

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

```mermaid
sequenceDiagram
    participant U as User Browser
    participant R as React App
    participant A as /api/auth/login
    participant J as JWT Middleware
    participant API as Protected API

    U->>R: Enter credentials
    R->>A: POST username and password
    A->>A: Verify password hash
    alt Valid Credentials
        A-->>R: 200 token and user
        R->>R: Store token in localStorage
        R-->>U: Redirect to Dashboard
        U->>R: Click on Books
        R->>API: GET /api/books with Bearer token
        API->>J: Validate JWT
        J->>J: Extract role from claims
        J-->>API: Identity and Role verified
        API-->>R: 200 books data
        R-->>U: Render Books Grid
    else Invalid Credentials
        A-->>R: 401 Invalid credentials
        R-->>U: Show error message
    end
```

### How It Works

1. User enters username and password on the Login page
2. React sends a POST request to `/api/auth/login`
3. Flask verifies the password hash using Werkzeug
4. On success, Flask creates a JWT token with the user's role embedded as a claim
5. React stores the token in `localStorage` and attaches it to every API request via Axios interceptor
6. On each protected request, Flask-JWT-Extended validates the token and extracts the user identity and role
7. The `@role_required` decorator checks if the user's role is allowed to access the endpoint

---

## 🔄 Borrowing Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Available : Book in catalog
    Available --> Borrowed : Student clicks Borrow Now
    Borrowed --> Returned : Admin or Librarian marks return
    Returned --> Available : available_copies incremented
    Borrowed --> Overdue : Past due_date of 90 days
    Overdue --> Returned : Admin or Librarian marks return
```

### Borrowing Constraints Flowchart

```mermaid
flowchart TD
    A["Student clicks Borrow"] --> B{"Active borrows less than 3?"}
    B -->|No| C["Reject: Limit Reached + Send Notification"]
    B -->|Yes| D{"Any overdue books?"}
    D -->|Yes| E["Reject: Overdue exists"]
    D -->|No| F{"available_copies greater than 0?"}
    F -->|No| G["Reject: Out of Stock"]
    F -->|Yes| H["Create Borrowing record"]
    H --> I["Decrement available_copies"]
    I --> J["Set due_date = today + 90 days"]
    J --> K["Log Activity"]
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
│   │   │
│   │   ├── components/
│   │   │   └── Layout/
│   │   │       └── Layout.jsx      # Sidebar + Header + Bell badge
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # React Context for auth state
│   │   │
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
│   │   │
│   │   ├── App.jsx                 # Routes + ProtectedRoute wrapper
│   │   ├── index.css               # Global design system
│   │   └── main.jsx                # Vite entry point
│   │
│   ├── package.json
│   └── vite.config.js
│
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

```mermaid
graph LR
    Login["Login Page"] --> Dashboard["Dashboard"]
    Dashboard --> Books["Books Grid"]
    Dashboard --> Borrowings["Borrowings"]
    Dashboard --> Notifications["Notifications"]
    Dashboard --> Users["User Management"]
    Dashboard --> Categories["Categories"]
    Dashboard --> Logs["Activity Logs"]
    Books --> BookDetail["Book Details"]
    Books --> AddBook["Add Book"]
    Books --> EditBook["Edit Book"]
```

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

**Built with ❤ using Flask and React**

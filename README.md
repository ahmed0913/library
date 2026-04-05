<![CDATA[<div align="center">

# 📚 Library Management System

### A Modern, Full-Stack Library Management System

**Flask · React · SQLite/MySQL · JWT Authentication**

![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.1-000000?style=for-the-badge&logo=flask&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Database Schema (ER Diagram)](#-database-schema-er-diagram)
- [Role & Permission Matrix](#-role--permission-matrix)
- [Authentication Flow](#-authentication-flow)
- [Borrowing Lifecycle](#-borrowing-lifecycle)
- [Fine Calculation Logic](#-fine-calculation-logic)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Setup & Installation](#-setup--installation)
- [Default Credentials](#-default-credentials)
- [Frontend Pages](#-frontend-pages)
- [Business Rules](#-business-rules)

---

## 🧠 Overview

A production-ready Library Management System designed to handle real-world library operations. The system supports **three user roles** (Admin, Librarian, Student), manages book inventory, tracks borrowing/return workflows, applies automatic late fines, sends in-app notifications, and maintains a full audit trail of every action.

> ⚠️ **No public registration.** Users are created exclusively by the Admin.

### Key Highlights

| Feature | Description |
|---------|-------------|
| 🔐 JWT Authentication | Secure, stateless token-based login with role claims |
| 👥 Role-Based Access | Granular permissions per role (Admin / Librarian / User) |
| 📖 Book Catalog | Grid display with cover images, search, and category filtering |
| 🔄 Borrowing System | Full borrow → due → return lifecycle with stock tracking |
| 💰 Automatic Fines | Tiered fine engine (10% base + daily escalation) |
| 🔔 Notifications | Real-time in-app alerts for fines, limits, and overdue items |
| 📝 Activity Logs | Complete audit trail of all CRUD and borrowing operations |
| 📊 Dashboard | Live statistics, top borrowed books, and recent activity feed |

---

## 🏗 System Architecture

```mermaid
graph TB
    subgraph Frontend["🖥️ Frontend (React + Vite)"]
        UI["React Components"]
        Router["React Router DOM"]
        AuthCtx["AuthContext (JWT State)"]
        Axios["Axios Interceptor"]
    end

    subgraph Backend["⚙️ Backend (Flask)"]
        API["Flask REST API"]
        JWTMw["JWT Middleware"]
        RoleDec["@role_required Decorator"]
        Routes["Blueprint Routes"]
    end

    subgraph Database["🗄️ Database (SQLite / MySQL)"]
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

    style Frontend fill:#1e1b4b,color:#fff
    style Backend fill:#064e3b,color:#fff
    style Database fill:#7c2d12,color:#fff
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
        string role "admin | librarian | user"
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
        string status "borrowed | returned | overdue"
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

---

## 🛡 Role & Permission Matrix

| Action | 🛡️ Admin | 📗 Librarian | 🎓 User |
|--------|:--------:|:------------:|:-------:|
| **View Dashboard Statistics** | ✅ | ✅ | ❌ (Welcome page) |
| **Manage Users (CRUD)** | ✅ | ❌ | ❌ |
| **Manage Categories (CRUD)** | ✅ | ❌ | ❌ |
| **Manage Books (CRUD)** | ✅ | ✅ | ❌ |
| **View Books Catalog** | ✅ | ✅ | ✅ |
| **View Book Details** | ✅ | ✅ | ✅ |
| **Borrow Books** | ❌ | ❌ | ✅ |
| **View Borrowing History (All)** | ✅ | ✅ | ❌ |
| **View Own Borrowing History** | ❌ | ❌ | ✅ |
| **Mark Books as Returned** | ✅ | ✅ | ❌ |
| **View System Activity Logs** | ✅ | ❌ | ❌ |
| **View Notifications** | ✅ | ✅ | ✅ |

---

## 🔐 Authentication Flow

```mermaid
sequenceDiagram
    participant U as 👤 User Browser
    participant R as ⚛️ React App
    participant A as 🔑 /api/auth/login
    participant J as 🛡️ JWT Middleware
    participant API as 📡 Protected API

    U->>R: Enter credentials
    R->>A: POST {username, password}
    A->>A: Verify password hash
    alt Valid Credentials
        A-->>R: 200 {token, user}
        R->>R: Store token in localStorage
        R-->>U: Redirect to Dashboard
        U->>R: Click on "Books"
        R->>API: GET /api/books (Authorization: Bearer <token>)
        API->>J: Validate JWT
        J->>J: Extract role from claims
        J-->>API: Identity + Role verified
        API-->>R: 200 [books data]
        R-->>U: Render Books Grid
    else Invalid Credentials
        A-->>R: 401 "Invalid credentials"
        R-->>U: Show error message
    end
```

---

## 🔄 Borrowing Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Available: Book in catalog
    Available --> Borrowed: Student clicks "Borrow Now"

    state Borrowed {
        [*] --> Active
        Active --> Overdue: Past due_date (90 days)
    }

    Borrowed --> Returned: Admin/Librarian marks return
    Returned --> Available: available_copies += 1

    state ReturnCheck <<choice>>
    Returned --> ReturnCheck
    ReturnCheck --> NoFine: return_date <= due_date
    ReturnCheck --> FineApplied: return_date > due_date

    state FineApplied {
        [*] --> BaseFine: "10% of book price"
        BaseFine --> EscalatedFine: "late > 7 days\n+10 EGP/extra day"
    }

    FineApplied --> NotificationSent: In-app alert to student
```

### Borrowing Constraints

```mermaid
flowchart TD
    A["Student clicks Borrow"] --> B{"Active borrows < 3?"}
    B -->|No| C["❌ Reject: Limit Reached\n+ Send Notification"]
    B -->|Yes| D{"Any overdue books?"}
    D -->|Yes| E["❌ Reject: Overdue exists"]
    D -->|No| F{"available_copies > 0?"}
    F -->|No| G["❌ Reject: Out of Stock"]
    F -->|Yes| H["✅ Create Borrowing\navailable_copies -= 1\ndue_date = today + 90 days"]
    H --> I["📝 Log Activity"]
```

---

## 💰 Fine Calculation Logic

The fine engine uses a **tiered escalation model** based on the book price and days late:

```
┌────────────────────────────────────────────────────────────────┐
│                     FINE CALCULATION RULES                      │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  IF return_date <= due_date:                                   │
│      fine = 0 EGP  ✅ No fine                                  │
│                                                                │
│  IF late <= 7 days:                                            │
│      fine = book_price × 10%                                   │
│      Example: book costs 100 EGP → fine = 10 EGP              │
│                                                                │
│  IF late > 7 days:                                             │
│      fine = (book_price × 10%) + (extra_days × 10 EGP)        │
│      Example: 12 days late, book costs 100 EGP                 │
│      → 10 + (5 × 10) = 60 EGP                                 │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

| Scenario | Book Price | Days Late | Fine |
|----------|-----------|-----------|------|
| On time | 150 EGP | 0 | **0 EGP** |
| 3 days late | 150 EGP | 3 | **15 EGP** |
| 7 days late | 200 EGP | 7 | **20 EGP** |
| 15 days late | 200 EGP | 15 | **20 + (8×10) = 100 EGP** |
| 30 days late | 100 EGP | 30 | **10 + (23×10) = 240 EGP** |

---

## 📡 API Reference

Base URL: `http://localhost:5000/api`

### 🔑 Authentication

| Method | Endpoint | Body | Response | Auth |
|--------|----------|------|----------|------|
| `POST` | `/auth/login` | `{username, password}` | `{token, user}` | ❌ |
| `GET` | `/auth/me` | — | `{user}` | ✅ |

### 📚 Books

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| `GET` | `/books?page=&per_page=&search=&category_id=` | List all books (paginated) | ✅ | All |
| `GET` | `/books/:id` | Get single book details | ✅ | All |
| `POST` | `/books` | Create a new book (multipart/form-data) | ✅ | Admin, Librarian |
| `PUT` | `/books/:id` | Update a book | ✅ | Admin, Librarian |
| `DELETE` | `/books/:id` | Delete a book | ✅ | Admin, Librarian |

### 👥 Users

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| `GET` | `/users?per_page=` | List all users | ✅ | Admin |
| `POST` | `/users` | Create user `{name, username, password, role}` | ✅ | Admin |
| `PUT` | `/users/:id` | Update user | ✅ | Admin |
| `DELETE` | `/users/:id` | Delete user | ✅ | Admin |

### 🔄 Borrowings

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| `GET` | `/borrowings` | List borrowings (filtered by role) | ✅ | All |
| `POST` | `/borrowings` | Borrow a book `{book_id}` | ✅ | User |
| `PUT` | `/borrowings/:id/return` | Mark book as returned | ✅ | Admin, Librarian |

### 🏷️ Categories

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| `GET` | `/categories` | List all categories | ✅ | All |
| `POST` | `/categories` | Create category | ✅ | Admin |
| `PUT` | `/categories/:id` | Update category | ✅ | Admin |
| `DELETE` | `/categories/:id` | Delete category | ✅ | Admin |

### 🔔 Notifications

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| `GET` | `/notifications` | Get user notifications | ✅ | All |
| `PUT` | `/notifications/:id/read` | Mark one as read | ✅ | All |
| `PUT` | `/notifications/read-all` | Mark all as read | ✅ | All |

### 📊 Dashboard & Logs

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| `GET` | `/dashboard` | Get stats, top books, recent logs | ✅ | Admin, Librarian |
| `GET` | `/activity-logs?page=&per_page=` | Full activity audit trail | ✅ | Admin |

---

## 📂 Project Structure

```
db_Flask/
│
├── 📁 backend/                     # Flask REST API
│   ├── 📁 app/
│   │   ├── 📁 models/             # SQLAlchemy ORM Models
│   │   │   ├── user.py            # User model (id, name, username, password, role)
│   │   │   ├── book.py            # Book model (title, author, price, copies, image)
│   │   │   ├── category.py        # Category model (name, description)
│   │   │   ├── borrowing.py       # Borrowing model (dates, status, fine)
│   │   │   ├── notification.py    # Notification model (title, message, is_read)
│   │   │   └── activity_log.py    # ActivityLog model (action_type, description)
│   │   │
│   │   ├── 📁 routes/             # API Blueprint Routes
│   │   │   ├── auth.py            # POST /login, GET /me
│   │   │   ├── books.py           # CRUD + image upload + search/pagination
│   │   │   ├── users.py           # Admin-only user management
│   │   │   ├── categories.py      # Admin-only category management
│   │   │   ├── borrowings.py      # Borrow/Return lifecycle
│   │   │   ├── notifications.py   # Read/mark notifications
│   │   │   ├── dashboard.py       # Stats & analytics endpoint
│   │   │   └── activity_logs.py   # Paginated audit trail
│   │   │
│   │   ├── 📁 utils/
│   │   │   ├── decorators.py      # @role_required with JWT claims
│   │   │   └── helpers.py         # calculate_fine() engine
│   │   │
│   │   ├── __init__.py            # App Factory (create_app)
│   │   ├── config.py              # Config from .env
│   │   └── extensions.py          # db, jwt instances
│   │
│   ├── 📁 uploads/                # Book cover image storage
│   ├── .env                       # Environment variables
│   ├── requirements.txt           # Python dependencies
│   ├── run.py                     # Entry point (python run.py)
│   └── seed.py                    # Seed admin + default categories
│
├── 📁 frontend/                   # React SPA (Vite)
│   ├── 📁 src/
│   │   ├── 📁 api/
│   │   │   └── axios.js           # Axios instance + JWT interceptor
│   │   │
│   │   ├── 📁 components/
│   │   │   └── 📁 Layout/
│   │   │       └── Layout.jsx     # Sidebar + Header + Notification badge
│   │   │
│   │   ├── 📁 context/
│   │   │   └── AuthContext.jsx    # React Context for auth state
│   │   │
│   │   ├── 📁 pages/
│   │   │   ├── Login.jsx          # Login form
│   │   │   ├── Dashboard.jsx      # Stats cards + activity timeline
│   │   │   ├── BooksPage.jsx      # Book grid with search & filters
│   │   │   ├── BookDetailsPage.jsx# Immersive book detail view
│   │   │   ├── BookFormPage.jsx   # Add/Edit book form + image upload
│   │   │   ├── UsersPage.jsx      # User CRUD table (Admin)
│   │   │   ├── CategoriesPage.jsx # Inline category management (Admin)
│   │   │   ├── BorrowingsPage.jsx # Kiosk for students / Table for admin
│   │   │   ├── NotificationsPage.jsx # Notification inbox
│   │   │   └── ActivityLogsPage.jsx  # System audit log viewer (Admin)
│   │   │
│   │   ├── App.jsx                # Routes + ProtectedRoute wrapper
│   │   ├── index.css              # Global design system
│   │   └── main.jsx               # Vite entry point
│   │
│   ├── package.json
│   └── vite.config.js
│
├── schema.sql                     # Reference SQL schema
└── README.md                      # ← You are here
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
| Werkzeug | 3.1.3 | Password hashing (pbkdf2:sha256) |
| PyMySQL | 1.1.1 | MySQL driver (production) |
| python-dotenv | 1.1.0 | Environment variable loader |

### Frontend

| Package | Purpose |
|---------|---------|
| React 18 | UI component library |
| Vite 5 | Build tool & dev server |
| React Router DOM | Client-side routing |
| Axios | HTTP client with interceptors |
| Lucide React | Modern icon system |

---

## 🚀 Setup & Installation

### Prerequisites

- Python 3.9+
- Node.js 18+
- npm or yarn

### 1️⃣ Clone & Backend Setup

```bash
# Clone the repository
git clone <repo-url>
cd db_Flask

# Create Python virtual environment
python -m venv venv

# Activate it
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r backend/requirements.txt
```

### 2️⃣ Configure Environment

Create `backend/.env` (or edit the existing one):

```env
DATABASE_URL=sqlite:///../library.db
JWT_SECRET_KEY=your-super-secret-key-change-me
```

> 💡 To use **MySQL** in production, change `DATABASE_URL` to:
> ```
> DATABASE_URL=mysql+pymysql://user:password@localhost:3306/library_db
> ```

### 3️⃣ Initialize Database & Start Backend

```bash
# Seed admin account + default categories
python backend/seed.py

# Start Flask server (port 5000)
python backend/run.py
```

### 4️⃣ Frontend Setup

```bash
# In a new terminal
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server (port 3000)
npm run dev
```

### ✅ You're Live!

Open **http://localhost:3000** in your browser.

---

## 🔑 Default Credentials

| Field | Value |
|-------|-------|
| **Username** | `admin` |
| **Password** | `admin123` |
| **Role** | Admin (full access) |

> ⚠️ **Change this password immediately** via the Users management panel after your first login.

### Default Seeded Categories

| Category |
|----------|
| Fiction |
| Science |
| Technology |
| History |
| Literature |

---

## 🖥 Frontend Pages

```mermaid
graph LR
    Login["🔐 Login Page"]
    Login --> Dashboard

    subgraph "All Users"
        Dashboard["📊 Dashboard"]
        Books["📚 Books Grid"]
        BookDetail["📖 Book Details"]
        Borrowings["🔄 Borrowings"]
        Notifications["🔔 Notifications"]
    end

    subgraph "Admin Only"
        Users["👥 User Management"]
        Categories["🏷️ Categories"]
        Logs["📝 Activity Logs"]
    end

    subgraph "Admin + Librarian"
        AddBook["➕ Add Book"]
        EditBook["✏️ Edit Book"]
    end

    Dashboard --> Books
    Books --> BookDetail
    Books --> AddBook
    Books --> EditBook
    Dashboard --> Borrowings
    Dashboard --> Notifications
    Dashboard --> Users
    Dashboard --> Categories
    Dashboard --> Logs

    style Login fill:#7c3aed,color:#fff
    style Dashboard fill:#2563eb,color:#fff
```

| Page | Route | Role | Description |
|------|-------|------|-------------|
| Login | `/login` | Public | Credential entry with JWT token exchange |
| Dashboard | `/` | All | Stats (Admin/Librarian) or Welcome (Student) |
| Books | `/books` | All | Responsive card grid with search & filter |
| Book Details | `/books/:id` | All | Full cover image, synopsis, stock status |
| Add Book | `/books/add` | Admin, Librarian | Form with image upload |
| Edit Book | `/books/edit/:id` | Admin, Librarian | Pre-filled edit form |
| Borrowings | `/borrowings` | All | Card kiosk (Student) or management table (Admin) |
| Users | `/users` | Admin | Create/edit/delete users and assign roles |
| Categories | `/categories` | Admin | Inline CRUD for book categories |
| Notifications | `/notifications` | All | Inbox with read/unread state and bell badge |
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
- Deleting a category is **restricted** if it still contains books (`ondelete=RESTRICT`)

### Audit Trail
- Every create, update, and delete action on Books, Users, and Categories is logged
- Borrow and Return operations are logged with full details
- Logs record the acting user's ID, action type, timestamp, and description

---

<div align="center">

**Built with ❤️ using Flask & React**

</div>
]]>

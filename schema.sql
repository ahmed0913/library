-- =============================================
-- Library Management System — Database Schema
-- MySQL 8.0+
-- =============================================

CREATE DATABASE IF NOT EXISTS library_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE library_db;

-- -----------------------------------------
-- 1. Users
-- -----------------------------------------
CREATE TABLE users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL,
    username    VARCHAR(50)     NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,
    role        ENUM('admin', 'librarian', 'user') NOT NULL DEFAULT 'user',
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_users_role (role)
) ENGINE=InnoDB;

-- -----------------------------------------
-- 2. Categories
-- -----------------------------------------
CREATE TABLE categories (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL UNIQUE,
    description VARCHAR(255)    DEFAULT NULL,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------
-- 3. Books
-- -----------------------------------------
CREATE TABLE books (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    title             VARCHAR(255)    NOT NULL,
    author            VARCHAR(255)    NOT NULL,
    description       TEXT            DEFAULT NULL,
    category_id       INT             NOT NULL,
    price             DECIMAL(10, 2)  NOT NULL DEFAULT 0.00,
    image_path        VARCHAR(500)    DEFAULT NULL,
    total_copies      INT             NOT NULL DEFAULT 1,
    available_copies  INT             NOT NULL DEFAULT 1,
    created_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_books_title (title),
    INDEX idx_books_author (author),
    INDEX idx_books_category (category_id),

    CONSTRAINT fk_books_category
        FOREIGN KEY (category_id) REFERENCES categories(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------
-- 4. Borrowings
-- -----------------------------------------
CREATE TABLE borrowings (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT           NOT NULL,
    book_id       INT           NOT NULL,
    borrow_date   DATE          NOT NULL,
    due_date      DATE          NOT NULL,
    return_date   DATE          DEFAULT NULL,
    status        ENUM('borrowed', 'returned', 'overdue') NOT NULL DEFAULT 'borrowed',
    fine_amount   DECIMAL(10, 2) NOT NULL DEFAULT 0.00,

    INDEX idx_borrowings_user (user_id),
    INDEX idx_borrowings_book (book_id),
    INDEX idx_borrowings_status (status),

    CONSTRAINT fk_borrowings_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_borrowings_book
        FOREIGN KEY (book_id) REFERENCES books(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------
-- 5. Activity Logs
-- -----------------------------------------
CREATE TABLE activity_logs (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    action_type VARCHAR(50)   NOT NULL,
    user_id     INT           DEFAULT NULL,
    timestamp   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    description TEXT          DEFAULT NULL,

    INDEX idx_logs_user (user_id),
    INDEX idx_logs_timestamp (timestamp),
    INDEX idx_logs_action (action_type),

    CONSTRAINT fk_logs_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------
-- 6. Notifications
-- -----------------------------------------
CREATE TABLE notifications (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT           NOT NULL,
    title       VARCHAR(200)  NOT NULL,
    message     TEXT          NOT NULL,
    is_read     BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_notif_user (user_id),
    INDEX idx_notif_read (is_read),

    CONSTRAINT fk_notif_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

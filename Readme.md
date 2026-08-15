# Library Management System

## Overview
A full-stack Library Management System designed to manage books, users, borrowing, returning, authentication, and other library operations.

## Tech Stack

### Backend
- ASP.NET Core Web API
- C#
- .NET 10
- Dapper

### Frontend
- React
- TypeScript
- Vite

### Database
- MySQL

### Tools
- Swagger
- Git
- GitHub

## Features

### Authentication
- [x] User registration
- [x] BCrypt password hashing
- [x] Duplicate email validation
- [x] User login
- [x] Password verification
- [x] JWT token generation
- [x] JWT authentication
- [x] JWT token validation
- [x] Protected API endpoints
- [x] Active user status validation
- [x] Student role assignment for registration
- [x] Role-based authorization
- [x] Student role authorization
- [x] Faculty role authorization
- [x] Librarian role authorization
- [x] Admin role authorization
- [x] Protected librarian/admin endpoints
- [x] Role-based Author permissions
- [x] Role-based Category permissions
- [x] Role-based Publisher permissions
- [x] Role-based User permissions
- [x] Admin-only user deletion
- [x] Role-based Book Copy permissions
- [x] Role-based Book-Category permissions
- [x] Role-based Borrow Transaction permissions
- [x] Borrow transaction ownership authorization

### Books
- [x] Get all books
- [x] Get book by ID
- [x] Create a book
- [x] Update a book
- [x] Delete a book

### Publishers
- [x] Get all publishers
- [x] Get publisher by ID
- [x] Create a publisher
- [x] Update a publisher
- [x] Delete a publisher

### Authors
- [x] Get all authors
- [x] Get author by ID
- [x] Create an author
- [x] Update an author
- [x] Delete an author

### Authors Book Relation
- [x] Get authors for a specific book
- [x] Assign author to a book
- [x] Remove author from a book

### Categories
- [x] Get all categories
- [x] Get category by ID
- [x] Create a category
- [x] Update a category
- [x] Delete a category

### Users
- [x] Get all users
- [x] Get user by ID
- [x] Get user by email
- [x] Create a user
- [x] Update a user
- [x] Delete a user

### Book Copies
- [x] Get all book copies
- [x] Get book copy by ID
- [x] Get book copies by Book ID
- [x] Create a book copy
- [x] Update a book copy
- [x] Delete a book copy

### Categories Book Relation
- [x] Get categories for a specific book
- [x] Get books for a specific category
- [x] Assign category to a book
- [x] Remove category from a book

### Borrow Transactions
- [x] Get all borrow transactions
- [x] Get borrow transaction by ID
- [x] Get borrow transactions by User ID
- [x] Create a borrow transaction
- [x] Update a borrow transaction
- [x] Delete a borrow transaction

### Borrow Items
- [x] Get all borrow items
- [x] Get borrow item by ID
- [x] Get borrow items by Transaction ID
- [x] Get all overdue items
- [x] Create a borrow item
- [x] Update a borrow item
- [x] Return a borrowed item
- [x] Renew a borrowed item
- [x] Delete a borrow item

### Fines
- [x] Get all fines
- [x] Get fine by ID
- [x] Get fines by User ID
- [x] Get unpaid fines by User ID
- [x] Create a fine
- [x] Update a fine
- [x] Waive a fine
- [x] Delete a fine

### Payments
- [x] Get all payments
- [x] Get payment by ID
- [x] Get payments by User ID
- [x] Get payments by Fine ID
- [x] Process a new payment
- [x] Delete a payment record

### Favorites
- [x] Get user favorite books
- [x] Check if a book is favorited by user
- [x] Add book to favorites
- [x] Remove book from favorites

### Notifications
- [x] Get all notifications
- [x] Get notification by ID
- [x] Get notifications by User ID
- [x] Get unread notifications by User ID
- [x] Create a notification
- [x] Mark notification as read
- [x] Mark all notifications as read for a user
- [x] Delete a notification

### Email Templates
- [x] Get all email templates
- [x] Get email template by ID
- [x] Get email template by unique code
- [x] Create an email template
- [x] Update an email template
- [x] Delete an email template

### Activity Logs
- [x] Get all activity logs
- [x] Get activity log by ID
- [x] Get activity logs by User ID
- [x] Create an activity log
- [x] Delete an activity log

### Audit Logs
- [x] Get all audit logs
- [x] Get audit log by ID
- [x] Get audit logs by entity name and entity ID
- [x] Get audit logs by User ID
- [x] Create an audit log
- [x] Delete an audit log

---

🚧 *Currently in active development.*
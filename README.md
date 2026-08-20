# Library Management System

## Overview
A full-stack Library Management System designed to manage books, users, borrowing, returning, authentication, and other library operations.

## Project Structure
```
Library_Management/
├── Backend/     # ASP.NET Core Web API (C#, Dapper, MySQL)
└── Frontend/    # React + TypeScript + Vite
```

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
- React Router
- TanStack Query (React Query)
- Zustand
- React Hook Form
- Zod
- Axios
- Tailwind CSS
- shadcn/ui (Radix primitives, Vega preset)

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
- [x] Role-based Borrow Item permissions
- [x] Borrow item ownership authorization
- [x] Role-based Fine permissions
- [x] Fine ownership authorization
- [x] Fine waiver identity from authenticated user
- [x] Role-based Payment permissions
- [x] Payment ownership authorization
- [x] Full-payment-only validation
- [x] JWT-based payment user identity
- [x] Fine ownership validation before payment
- [x] Automatic fine status update after full payment
- [x] Full Authorization complete.

### Activity & Audit Logs
- [x] Admin-only access to activity logs
- [x] Admin-only access to audit logs
- [x] JWT-based user identification for log creation
- [x] Automatic IP address capture
- [x] Automatic User-Agent capture
- [x] Restricted log deletion to Admin users
- [x] Restricted log retrieval to Admin users

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

### Automated Notifications
- [x] Notification sent when a book is issued (`BorrowItemService.CreateAsync`)
- [x] Notification sent when a book is returned (`ReturnItemAsync`)
- [x] Notification sent when a loan is renewed (`RenewItemAsync`)
- [x] Notification sent when a fine is created (`FineService.CreateAsync`)
- [x] Notification sent when a fine is waived (`WaiveFineAsync`)
- [x] Notification sent when a payment is received (`PaymentService.CreateAsync`)
- [x] Overdue notifications via background service (`OverdueNotificationService`, interval `Notifications:OverdueIntervalMinutes`)
- [x] Overdue notifications deduplicated per borrow item via `ReferenceId` column
- [x] `ReferenceId` column added to the notifications table
- [x] `NotificationService.NotifyAsync` never throws (notifications can't break primary operations)

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

### Backend - Registration (Roles & Membership)
- [x] Self-registration as Student (default) or Faculty (choice from registration page)
- [x] Faculty registration gated by a shared faculty password (config `Registration:FacultyPassword`)
- [x] Student/Faculty-only guard on self-registration (Librarian/Admin not self-service)
- [x] Unique auto-generated membership number for every new user
- [x] Fix: registration no longer fails on empty membership number (unique constraint)

### Backend Completion
- [x] Backend done

### Frontend - Project Setup
 Vite + React + TypeScript
 Tailwind CSS + shadcn/ui
 Project structure and configuration
 Environment variables
Frontend - Authentication
 Login and Register
 JWT authentication
 Refresh token flow
 Protected and role-based routes
 API/Axios setup
 Form validation

### Backend
 Authentication & JWT
 Refresh token system
 CORS configuration
 Database models

### Books
- [x] Books list page
- [x] Book details page with book metadata and description
- [x] Author, category, and publisher name display
- [x] Inventory summary for total, available, and borrowed copies
- [x] Book cover display with themed fallback artwork
- [x] Clickable book cards
- [x] Improved book card spacing and readability
- [x] Grid and compact list collection views
- [x] Book search by title or ISBN
- [x] Filter books by category, status, and language
- [x] Sort books by date, title, or price
- [x] Paginated collection browsing
- [x] Author summaries in collection cards

### Layout & Navigation
- [x] Responsive sidebar layout (off-canvas on mobile)
- [x] Role-based navigation menus (Student / Faculty / Librarian / Admin)
- [x] Role-guarded routes that redirect unauthorized users to their own dashboard
- [x] Role-based home redirect after login
- [x] Logout (client + server token invalidation)
- [x] Sidebar displays the authenticated user's registered name, avatar initial, and role
- [x] User profile is retained across page refreshes

### Frontend - Role-Based Routing
- [x] Four roles: Student, Faculty, Librarian, Admin (match JWT role claims)
- [x] Shared member layout for Student and Faculty
- [x] Separate librarian and admin route trees
- [x] Backend remains authoritative; frontend only controls what UI renders
- [x] Placeholder pages for in-progress sections

### Frontend - Authors Management (Librarian/Admin)
- [x] Authors list table with search
- [x] Create / edit author via modal form
- [x] Delete author with confirmation dialog
- [x] Zod form validation
- [x] Loading, empty, and error states
- [x] Reusable Dialog, AlertDialog, and Textarea UI components (Radix)

### Frontend - Categories Management (Librarian/Admin)
- [x] Categories list table with search
- [x] Create / edit category via modal form
- [x] Delete category with confirmation dialog
- [x] Zod form validation
- [x] Loading, empty, and error states

### Frontend - Publishers Management (Librarian/Admin)
- [x] Publishers list table with search
- [x] Create / edit publisher via modal form (name, website, email, phone, address)
- [x] Delete publisher with confirmation dialog
- [x] Zod form validation
- [x] Loading, empty, and error states

### Frontend - Book Copies Management (Librarian/Admin)
- [x] Book copies list table with search (barcode or book title)
- [x] Create / edit copy via modal form (book, barcode, shelf, status, condition, purchase date, price, QR)
- [x] Delete copy with confirmation dialog
- [x] Zod form validation
- [x] Book title lookup in list
- [x] Loading, empty, and error states

### Frontend - Borrowing Management (Librarian/Admin)
- [x] New borrow flow (user, book, available copy, due date, condition, notes)
- [x] Creates borrow transaction + borrow item in sequence
- [x] Book search within borrow dialog
- [x] Available-copy cascade filtered by selected book
- [x] Active / overdue / returned / all filter tabs
- [x] Search by book, borrower, or barcode
- [x] Joined list showing book, borrower, copy barcode, borrowed/due dates, status
- [x] Overdue highlighting and badge
- [x] Renew action with new due date dialog
- [x] Loading, empty, and error states

### Frontend - Returns Management (Librarian/Admin)
- [x] Returns list with open / returned / all filter tabs
- [x] Search by book, borrower, or barcode
- [x] Return dialog with condition-at-return recording
- [x] Days-late badge for overdue items
- [x] Copy automatically returns to Available after return
- [x] Loading, empty, and error states
- [x] Shared borrow-row data hook reused by Borrowing and Returns pages

### Frontend - Fines Management (Librarian/Admin)
- [x] Fines list with unpaid / paid / waived / all filter tabs
- [x] Summary cards (outstanding, total billed, record count)
- [x] Search by user
- [x] Create / edit fine via modal form (user, type, amount, reason)
- [x] Waive fine with confirmation (Admin only)
- [x] Delete fine with confirmation (Admin only)
- [x] Nepali Rupees (रू) currency formatting via shared helper
- [x] Loading, empty, and error states

### Frontend - Payments Management (Librarian/Admin)
- [x] Payments history list with user, fine, amount, method, reference, and date
- [x] Summary cards (total collected, transaction count, last payment)
- [x] Search by user, transaction reference, or fine number
- [x] Payment method badge and NPR amounts
- [x] Delete payment record with confirmation (Admin only)
- [x] Loading, empty, and error states

### Frontend - Favorites (Student/Faculty)
- [x] Favorites grid with cover, status, ISBN, and subtitle
- [x] Remove favorite with inline heart button
- [x] Search within favorites
- [x] Empty state with browse-books CTA
- [x] Save / Saved heart toggle on book details page
- [x] Favorite status stays in sync across pages (query cache)

### Frontend - Profile (All Roles)
- [x] Profile page with avatar banner, full name, email, and role badge
- [x] Account details panel (email, role)
- [x] Sidebar avatar/name click navigates to profile
- [x] Shared route for all authenticated roles

### Frontend - Registration (Role Choice)
- [x] Role selector cards on registration page (Student / Faculty)
- [x] Student selected by default
- [x] Faculty password field shown only when Faculty is chosen
- [x] Zod validation (faculty password required for Faculty role)
- [x] Sends roleId + faculty password with registration payload

### Frontend - Notifications (All Roles)
- [x] Notifications list with type-aware icons (due, warning, success, info, overdue)
- [x] Unread highlighting with indicator dot
- [x] Mark individual notification as read
- [x] Mark all as read
- [x] All / unread filter with unread count badge
- [x] Relative timestamps and empty states
- [x] `referenceId` field surfaced on the notification type

### Frontend - Member Dashboard (Student/Faculty)
- [x] Welcome header with avatar, name, and current date
- [x] Stat cards: currently borrowed, unpaid fines, favorites, unread notifications
- [x] Current loans list with due dates and overdue badges
- [x] Unpaid fines panel
- [x] Links from every card/panel to its detail page

### Frontend - Librarian Dashboard
- [x] Stat cards: total books, copies, available copies, active loans, overdue, unpaid fines
- [x] Recent loans list (book, borrower, copy barcode, borrowed/due dates)
- [x] Overdue items panel
- [x] Unpaid fines panel
- [x] Links from every card/panel to its management page

### Backend - User Management
- [x] `UsersController` GET (Librarian/Admin), POST/PUT (Librarian/Admin), DELETE (Admin)
- [x] Create hashes passwords with BCrypt and auto-generates `LBM-{timestamp}-{random}` membership numbers
- [x] Duplicate email rejected with `DUPLICATE_EMAIL` (409)
- [x] Update persists RoleId, status, name, email, phone
- [x] PasswordHash never echoed back in API responses

### Frontend - User Management (Admin)
- [x] User list with search (name/email/membership) and role/status filters
- [x] Role badges and membership numbers
- [x] Create user dialog (name, email, phone, role, status, temporary password)
- [x] Edit dialog (role, status, name, email, phone)
- [x] Delete with confirmation (permanent)
- [x] Route `/admin/users`

### Frontend - Audit Logs (Admin)
- [x] Table of audit records (when, user, action, entity, IP)
- [x] Search + action filter
- [x] Details dialog with formatted old/new values JSON, user agent, IP
- [x] Delete with confirmation
- [x] Route `/admin/audit-logs`

### Frontend - Activity Logs (Admin)
- [x] Timeline list of user actions with details and IP
- [x] Search + details dialog + delete
- [x] Route `/admin/activity-logs`

### Frontend - Email Templates (Admin)
- [x] Card grid with search
- [x] Create/edit dialog (name, code, subject, HTML body, description)
- [x] Live preview dialog rendering template HTML
- [x] Delete with confirmation
- [x] Route `/admin/email-templates`

### Frontend - Admin Dashboard
- [x] Stat cards: users, books, copies, available copies, active loans, overdue, unpaid fines (रू), audit logs
- [x] Recent loans panel
- [x] Latest audit activity panel
- [x] Overdue items and unpaid fines panels
- [x] Links from every card/panel to its management page
- [x] Route `/admin`

### Frontend - Role Landing Pages
- [x] `/` redirects by role (HomeRedirect)
- [x] Login lands on role dashboard: members → `/dashboard`, Librarian → `/librarian`, Admin → `/admin`

### Frontend - Member Self-Service Pages (Student/Faculty)
- [x] My Borrowing `/my-borrowing`: active / overdue / returned tabs, book + barcode, overdue badges, stat cards
- [x] My Fines `/my-fines`: outstanding total, status tabs, self-pay dialog (`POST /api/payments`)
- [x] My Payments `/my-payments`: payment history (fine, amount रू, method, reference, date)
- [x] All queries scoped to the logged-in user (no staff-only endpoints used)

### Frontend - Book Details (All Roles)
- [x] `/books/:bookId` shared by all roles (fix: Admin/Librarian no longer redirected to dashboard)
- [x] Role-aware back link: Admin → `/admin/books`, Librarian → `/librarian/books`, member → `/books`
- [x] All ComingSoon placeholder pages removed

### Frontend - Design System (Bookly)
- [x] Warm beige page background (#E4DAD1), white cards, 24px rounded corners
- [x] Camel/terracotta brand accent (#D09B7A) with charcoal text (#111)
- [x] Plus Jakarta Sans typography (bold headings, tight tracking)
- [x] Semantic Tailwind v4 design tokens (bg, card, camel, ink, muted, line, radius)
- [x] Rounded pill buttons and soft-focus inputs throughout
- [x] "Libro" wordmark with camel accent logo
- [x] Restyled auth, books, book details, authors, and categories pages
- [x] Shared components: PageHeader, PillTabs, PageState, MessageBanner used across all pages
- [x] Consistent card radius, table headers, headings, and empty states everywhere
- [x] Mobile top bar shows Libro brand + avatar

🚧 Currently in active development.

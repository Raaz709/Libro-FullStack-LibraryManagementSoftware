# Library Management System

## Overview
A full-stack Library Management System designed to manage books, users, borrowing, returning, authentication, and other library operations.

## Project Structure
```
Library_Management/
├── Backend/     # ASP.NET Core Web API (C#, Dapper, MySQL)
├── Frontend/    # React + TypeScript + Vite
└── Database/    # schema.sql + seed.sql (reproducible MySQL setup)
```

## Database Setup

The database is MySQL 8.x and is fully reproducible from the SQL files in `Database/`.

1. Create the schema and seed data:

   ```bash
   mysql -u root -p < Database/schema.sql
   mysql -u root -p library_management < Database/seed.sql
   ```

2. Configure the connection string (user secrets or an environment variable):

   ```bash
   cd Backend
   dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost;Port=3306;Database=library_management;User ID=root;Password=YOUR_PASSWORD;"
   ```

3. Configure a strong JWT signing key (required, at least 32 bytes):

   ```bash
   cd Backend
   dotnet user-secrets set "Jwt:Key" "<a-64-byte-random-base64-string>"
   ```

Demo accounts seeded by `seed.sql` (change passwords before real use):

| Role      | Email               | Password      |
|-----------|---------------------|---------------|
| Admin     | admin@libro.test    | `Admin@123`   |
| Librarian | librarian@libro.test| `Librarian@123` |
| Student   | student@libro.test  | `Student@123` |
| Faculty   | faculty@libro.test  | `Faculty@123` |

## Running Tests

Backend xUnit tests cover authentication, JWT, payments, borrow notifications, and the new reservation flow:

```bash
cd Backend
dotnet test
```

Frontend tests (Vitest + React Testing Library) cover currency/utility helpers, JWT decoding, auth form validation, and the reviews component:

```bash
cd Frontend
npm test
```

## Reviews

Members can rate (1–5 stars) and review books.

- `GET /api/reviews/book/{bookId}` → reviews plus an average-rating summary (public to authenticated users)
- `POST /api/reviews`, `PUT /api/reviews/{id}`, `DELETE /api/reviews/{id}` (owner or Librarian/Admin)
- One review per user per book (unique constraint, duplicate submission returns `409`)
- Frontend: review section on the book details page (write/edit/delete your own review, live average)

## Reservations

Members can place holds on books; staff fulfill or cancel them.

- `GET /api/reservations/my`, `POST /api/reservations` (member)
- `POST /api/reservations/{id}/cancel` (owner or staff)
- `GET /api/reservations`, `POST /api/reservations/{id}/fulfill` (Librarian/Admin)
- Frontend: Reserve button on book details, `/my-reservations` (members), `/librarian/reservations` + `/admin/reservations` (staff)

## Settings (Admin)

Admin-managed key/value configuration stored in the `settings` table.

- `GET /api/settings`, `PUT /api/settings/{key}`, `DELETE /api/settings/{key}` (Admin)
- Frontend: `/admin/settings` page with inline edit/delete per key
- Seeded defaults include library contact info and borrowing limits

## Permissions (Admin)

Admin-managed permissions assigned to roles via the `permissions` / `rolepermissions` tables.

- `GET /api/permissions`, `GET /api/permissions/roles`, `POST` / `PUT` / `DELETE`, `POST /api/permissions/assign`, `POST /api/permissions/revoke` (Admin)
- Frontend: `/admin/permissions` page with role toggles per permission
- Seeded permissions cover catalog, circulation, fines, reservations, reviews, users, settings, and reporting

## Pagination

The books endpoint is server-side paginated with filtering, search, and sorting:

```text
GET /api/books?page=1&pageSize=20&search=clean&status=Active&language=English&categoryId=3&sort=title
```

Responses use a `PagedResult` envelope (`items`, `total`, `page`, `pageSize`, `totalPages`). The frontend books collection page pages over the server and keeps search, filters, and sort in the query.

## Email (SMTP)

Outbound email is sent with MailKit and is optional — the app runs fine with SMTP disabled.

Configuration (via user secrets or environment variables):

| Key | Description |
|-----|-------------|
| `Email:Enable` | Set `true` to send real emails |
| `Email:Host` | SMTP host (e.g. `smtp.gmail.com`) |
| `Email:Port` | SMTP port (default `587`) |
| `Email:Username` | SMTP username |
| `Email:Password` | SMTP password or app password |
| `Email:From` | Sender address |
| `Email:FromName` | Sender display name |
| `Email:UseSsl` | Use SSL on connect |

Example:

```bash
cd Backend
dotnet user-secrets set "Email:Enable" "true"
dotnet user-secrets set "Email:Host" "smtp.gmail.com"
dotnet user-secrets set "Email:Port" "587"
dotnet user-secrets set "Email:Username" "you@gmail.com"
dotnet user-secrets set "Email:Password" "your-app-password"
dotnet user-secrets set "Email:From" "you@gmail.com"
dotnet user-secrets set "Email:FromName" "Library"
```

Emails are rendered from `emailtemplates` (keyed by `Code`) and support `{{Key}}` placeholders. A welcome email is sent to new members on registration. SMTP failures are logged and never break API requests.

## Docker

The whole stack can run in containers:

```bash
# set a strong JWT signing key (base64, at least 32 bytes)
export JWT_KEY="$(openssl rand -base64 48)"

docker compose up -d --build
```

This starts:

| Service  | Port  | Notes |
|----------|-------|-------|
| MySQL 8  | 3306  | Auto-initialized from `Database/schema.sql` + `Database/seed.sql` |
| Backend  | 8080  | ASP.NET Core API (config via `ConnectionStrings__*`, `Jwt__*` env vars) |
| Frontend | 5173  | nginx serving the built SPA, proxying `/api` to the backend |

Override MySQL root password with `MYSQL_ROOT_PASSWORD`. SMTP/email stays disabled unless you add `Email__*` env vars.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on every push to `master` and on pull requests:

- **Backend**: `dotnet restore` → Release build → xUnit test suite.
- **Frontend**: `npm ci` → ESLint → Vitest test suite → production build.

## Rate Limiting

The API uses ASP.NET Core rate limiting (fixed-window, configured in `appsettings.json`):

| Policy | Limit | Partition | Applied to |
|--------|-------|-----------|------------|
| `global` | 120 req/min | IP, or authenticated user id | All endpoints |
| `auth` | 10 req/min | IP | `/api/auth/*` (login, register, refresh, logout) |

Exceeding a limit returns `429 Too Many Requests` with a JSON body and a `Retry-After` header. Tune via:

```json
"RateLimiting": {
  "GlobalRequestsPerMinute": 120,
  "AuthRequestsPerMinute": 10,
  "WindowSeconds": 60
}
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

### Frontend - Design Polish (Bookly v2)
- [x] Soft shadow system (`shadow-card`, `shadow-card-hover`, `shadow-lift`, `shadow-pill`) and `page-ambient` radial background washes
- [x] Gradient camel sidebar, active nav pill with accent bar, gradient brand mark + avatar
- [x] Gradient eyebrow bars in PageHeader and auth cards; refined focus rings and camel scrollbars
- [x] Shared `StatCard` (gradient icon chips, tone variants, hover lift) and `Panel` (section header with accent dot + link) components
- [x] Member / Librarian / Admin dashboards rebuilt on StatCard + Panel
- [x] Button default gradient, Badge `success` variant, polished pill tabs and loading/empty states
- [x] Login and register pages restyled with gradient accents and balanced layout

### Frontend - Reviews
- [x] Review section on book details (average rating, member reviews, dates)
- [x] Write / edit / delete your own review (1–5 stars + optional comment)
- [x] Live average from the server summary
- [x] Duplicate review per book blocked by backend

### Frontend - Reservations
- [x] Reserve button on book details (members), disabled while already reserved
- [x] My Reservations page `/my-reservations` with cancel action
- [x] Staff reservations page `/librarian/reservations` + `/admin/reservations` with fulfill/cancel
- [x] Search + status badges (Waiting / Fulfilled / Cancelled)

### Frontend - Settings (Admin)
- [x] `/admin/settings` key/value manager with inline edit, save, and delete

### Frontend - Permissions (Admin)
- [x] `/admin/permissions` manager with create, delete, and per-role assign/revoke toggles

### Frontend - Server-Side Pagination
- [x] `/api/books` paginated with search, status/language/category filters, and sorting
- [x] `PagedResult` envelope shared with the books collection page
- [x] Books page keeps filters/sort in the query and resets page on change

### Frontend - Test Suite (Vitest)
- [x] Unit tests: `formatNPR`, `cn`, login/register Zod schemas, JWT decode + expiry
- [x] Component test: ReviewsSection renders reviews/averages and submits a review
- [x] `npm test` wired into CI

### Database - Active Tables
- [x] `shelves` table removed everywhere (schema, seed, backend, frontend)
- [x] `reviews` wired end-to-end (API + UI)
- [x] `reservations` wired end-to-end (API + UI)
- [x] `permissions` / `rolepermissions` wired (admin manager + seeded defaults)
- [x] `settings` wired (admin manager + seeded defaults)

🚧 Currently in active development.

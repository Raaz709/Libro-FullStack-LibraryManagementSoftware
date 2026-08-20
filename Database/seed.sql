-- ============================================================================
-- Library Management System - Seed Data
-- Run AFTER schema.sql.
-- Demo accounts (change passwords before any real use):
--   admin@libro.test     / Admin@123      (Admin)
--   librarian@libro.test / Librarian@123  (Librarian)
--   student@libro.test   / Student@123    (Student)
--   faculty@libro.test   / Faculty@123    (Faculty)
-- ============================================================================

USE `library_management`;

SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------------
-- Roles (ids 1-4 are referenced by the application)
-- ---------------------------------------------------------------------------

INSERT INTO `roles` (`Id`, `Name`, `Description`) VALUES
  (1, 'Student',  'Registered student member'),
  (2, 'Faculty',  'Registered faculty member'),
  (3, 'Librarian','Library staff with catalog & circulation access'),
  (4, 'Admin',    'System administrator');

-- ---------------------------------------------------------------------------
-- Demo users (bcrypt hashes, work factor 12)
-- ---------------------------------------------------------------------------

INSERT INTO `users`
  (`RoleId`, `FirstName`, `LastName`, `Email`, `Phone`, `PasswordHash`, `Status`, `MembershipNumber`) VALUES
  (4, 'Admin',    'Libro',   'admin@libro.test',     '+977-9800000000', '$2a$12$7udYl0UsWUOPGj38SpYRKe3rcBuV34/ITj66PY2MTy1aENVPmfg/a', 'Active', 'LBM-1000001'),
  (3, 'Librarian','Libro',   'librarian@libro.test', '+977-9800000001', '$2a$12$r2Dzh.b90qBSt.QRzLZOE.UPa9AaCOApugDMsL.1OlQSguRCzMJfK', 'Active', 'LBM-1000002'),
  (1, 'Student',  'Demo',    'student@libro.test',   '+977-9800000002', '$2a$12$14wcmV6jxhzuBJgQ0jlNy.pK7gI1Jt/ZR0fw7zDL5FC2q3f0X9SyO', 'Active', 'LBM-1000003'),
  (2, 'Faculty',  'Demo',    'faculty@libro.test',   '+977-9800000003', '$2a$12$DVH0j4uXh4TqEMUkdyCvIeWbRYJOFxz/8UzBMMwlvOrhQ4TJk2U4q', 'Active', 'LBM-1000004');

-- ---------------------------------------------------------------------------
-- Catalog
-- ---------------------------------------------------------------------------

INSERT INTO `publishers` (`Name`, `Website`, `Email`, `Phone`, `Address`) VALUES
  ('Penguin Books', 'https://penguin.co.uk', 'contact@penguin.co.uk', '+44-20-7611-4000', '80 Strand, London, UK'),
  ('O''Reilly Media', 'https://oreilly.com', 'info@oreilly.com', '+1-800-889-8969', '1005 Gravenstein Hwy N, Sebastopol, CA, USA'),
  ('Oxford University Press', 'https://oup.com', 'customerservice@oup.com', '+1-800-445-9714', '198 Madison Ave, New York, NY, USA');

INSERT INTO `authors` (`FirstName`, `LastName`, `Biography`, `Country`) VALUES
  ('George', 'Orwell', 'English novelist and essayist, best known for 1984 and Animal Farm.', 'United Kingdom'),
  ('Yuval Noah', 'Harari', 'Israeli historian and author of Sapiens.', 'Israel'),
  ('Andrew', 'Tanenbaum', 'Computer scientist and professor, author of classic systems textbooks.', 'Netherlands'),
  ('Brendan', 'Gregg', 'Performance engineer and author of systems performance books.', 'United States'),
  ('Eric', 'Freeman', 'Software engineer and author of Head First design books.', 'United States');

INSERT INTO `categories` (`ParentCategoryId`, `Name`, `Description`, `Icon`) VALUES
  (NULL, 'Fiction', 'Literary and popular fiction.', 'book'),
  (NULL, 'History', 'History and biography.', 'scroll'),
  (NULL, 'Technology', 'Computer science and engineering.', 'cpu'),
  (1,    'Dystopian', 'Fiction exploring dystopian societies.', 'shield');

INSERT INTO `books` (`ISBN`, `Title`, `Subtitle`, `Description`, `Language`, `Edition`, `PublisherId`, `PublishedDate`, `Price`, `Status`) VALUES
  ('978-0451524935', '1984', 'A Novel', 'A dystopian classic set in a totalitarian state ruled by Big Brother.', 'English', 'Signet Classics', 1, '1949-06-08', 9.99, 'Active'),
  ('978-0062316097', 'Sapiens', 'A Brief History of Humankind', 'Explores how Homo sapiens came to dominate the world.', 'English', 'Harper', 3, '2015-02-10', 15.99, 'Active'),
  ('978-0133594140', 'Computer Networks', 'Sixth Edition', 'The classic introduction to computer networking.', 'English', '6th', 2, '2020-08-14', 39.99, 'Active'),
  ('978-0134392392', 'BPF Performance Tools', 'Linux System and Application Observability', 'Practical observability with BPF/eBPF on Linux.', 'English', '1st', 2, '2019-12-12', 49.99, 'Active');

INSERT INTO `bookauthors` (`BookId`, `AuthorId`) VALUES
  (1, 1),
  (2, 2),
  (3, 3),
  (4, 4);

INSERT INTO `bookcategories` (`BookId`, `CategoryId`) VALUES
  (1, 1),
  (1, 4),
  (2, 2),
  (3, 3),
  (4, 3);

INSERT INTO `bookcopies` (`BookId`, `Barcode`, `ConditionStatus`, `Status`, `PurchaseDate`, `Price`) VALUES
  (1, 'BC-1984-0001', 'Good',   'Available', '2025-01-10', 9.99),
  (1, 'BC-1984-0002', 'Good',   'Available', '2025-01-10', 9.99),
  (2, 'BC-SAP-0001',  'Good',   'Available', '2025-02-05', 15.99),
  (3, 'BC-CN-0001',   'Good',   'Available', '2025-03-01', 39.99),
  (3, 'BC-CN-0002',   'Good',   'Available', '2025-03-01', 39.99),
  (4, 'BC-BPF-0001',  'Good',   'Available', '2025-04-20', 49.99);

-- ---------------------------------------------------------------------------
-- Email templates - SMTP body uses {{Key}} placeholders
-- ---------------------------------------------------------------------------

INSERT INTO `emailtemplates` (`Name`, `Code`, `Subject`, `BodyHtml`, `Description`, `CreatedAt`, `UpdatedAt`) VALUES
  ('Welcome', 'Welcome', 'Welcome to the Library, {{FirstName}}!',
   '<p>Hello {{FirstName}} {{LastName}},</p><p>Welcome to the Library! Your membership is now active.</p><p>Your membership number is <strong>{{MembershipNumber}}</strong>.</p><p>You can log in with {{Email}}.</p><p>Regards,<br/>Library Team</p>',
   'Sent to new members after registration.', NOW(), NOW());

-- ---------------------------------------------------------------------------
-- Permissions (used by the admin permissions manager)
-- ---------------------------------------------------------------------------

INSERT INTO `permissions` (`Name`, `Description`) VALUES
  ('manage_books',        'Create, edit and deactivate books'),
  ('manage_copies',       'Add, edit and retire book copies'),
  ('manage_borrowing',    'Issue and return borrowed items'),
  ('manage_fines',        'Create, adjust and waive fines'),
  ('manage_reservations', 'Fulfill and cancel reservations'),
  ('manage_reviews',      'Moderate and remove reviews'),
  ('manage_users',        'Manage member and staff accounts'),
  ('manage_settings',     'Change system-wide settings'),
  ('view_reports',        'View circulation and financial reports');

INSERT INTO `rolepermissions` (`RoleId`, `PermissionId`) VALUES
  (1, 9),  -- Student: view reports (unused by app; kept for future reporting)
  (3, 1),  (3, 2),  (3, 3),  (3, 4),  (3, 5),  (3, 6),  (3, 9),
  (4, 1),  (4, 2),  (4, 3),  (4, 4),  (4, 5),  (4, 6),  (4, 7),  (4, 8),  (4, 9);

-- ---------------------------------------------------------------------------
-- System settings (used by the admin settings manager)
-- ---------------------------------------------------------------------------

INSERT INTO `settings` (`Key`, `Value`, `Description`, `UpdatedByUserId`) VALUES
  ('library.name',        'Libro Library', 'Display name of the library.', 1),
  ('library.address',     'Kathmandu, Nepal', 'Physical address of the library.', 1),
  ('library.phone',       '+977-9800000000', 'Public contact phone number.', 1),
  ('library.email',       'library@libro.test', 'Public contact email address.', 1),
  ('borrowing.max_items', '5', 'Maximum books a member may borrow at once.', 1),
  ('borrowing.loan_days', '14', 'Standard loan period in days.', 1),
  ('borrowing.fine_per_day', '0.50', 'Late return fine charged per day.', 1),
  ('reservation.days',    '3', 'How long a fulfilled reservation is held.', 1);

SET FOREIGN_KEY_CHECKS = 1;
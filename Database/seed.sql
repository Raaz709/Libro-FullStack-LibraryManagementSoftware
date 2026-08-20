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

INSERT INTO `shelves` (`Name`, `Floor`, `Section`, `Rack`, `ShelfNumber`, `Description`) VALUES
  ('Fiction A', '1', 'A', '1', 'A1.1', 'Fiction first rack'),
  ('Fiction B', '1', 'A', '2', 'A2.1', 'Fiction second rack'),
  ('History',   '2', 'B', '1', 'B1.1', 'History section'),
  ('Tech',      '3', 'C', '1', 'C1.1', 'Technology section');

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

INSERT INTO `bookcopies` (`BookId`, `ShelfId`, `Barcode`, `ConditionStatus`, `Status`, `PurchaseDate`, `Price`) VALUES
  (1, 1, 'BC-1984-0001', 'Good',   'Available', '2025-01-10', 9.99),
  (1, 1, 'BC-1984-0002', 'Good',   'Available', '2025-01-10', 9.99),
  (2, 3, 'BC-SAP-0001',  'Good',   'Available', '2025-02-05', 15.99),
  (3, 4, 'BC-CN-0001',   'Good',   'Available', '2025-03-01', 39.99),
  (3, 4, 'BC-CN-0002',   'Good',   'Available', '2025-03-01', 39.99),
  (4, 4, 'BC-BPF-0001',  'Good',   'Available', '2025-04-20', 49.99);

SET FOREIGN_KEY_CHECKS = 1;
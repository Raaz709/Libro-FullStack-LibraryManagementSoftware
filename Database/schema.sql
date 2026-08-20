-- ============================================================================
-- Library Management System - Database Schema
-- MySQL 8.x (utf8mb4)
-- Reproduces the full `library_management` database from scratch.
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `library_management`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

USE `library_management`;

SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------------
-- Users & Access Control
-- ---------------------------------------------------------------------------

DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(50) NOT NULL,
  `Description` varchar(255) DEFAULT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `UQ_Roles_Name` (`Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `RoleId` int NOT NULL,
  `FirstName` varchar(100) NOT NULL,
  `LastName` varchar(100) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `Phone` varchar(30) DEFAULT NULL,
  `PasswordHash` varchar(255) NOT NULL,
  `ProfileImageUrl` varchar(500) DEFAULT NULL,
  `Status` varchar(30) NOT NULL DEFAULT 'Active',
  `MembershipNumber` varchar(50) NOT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `LastLoginAt` datetime DEFAULT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `UQ_Users_Email` (`Email`),
  UNIQUE KEY `UQ_Users_MembershipNumber` (`MembershipNumber`),
  KEY `FK_Users_Roles` (`RoleId`),
  CONSTRAINT `FK_Users_Roles` FOREIGN KEY (`RoleId`) REFERENCES `roles` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) NOT NULL,
  `Description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `UQ_Permissions_Name` (`Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `rolepermissions`;
CREATE TABLE `rolepermissions` (
  `RoleId` int NOT NULL,
  `PermissionId` int NOT NULL,
  PRIMARY KEY (`RoleId`,`PermissionId`),
  KEY `FK_RolePermissions_Permissions` (`PermissionId`),
  CONSTRAINT `FK_RolePermissions_Permissions` FOREIGN KEY (`PermissionId`) REFERENCES `permissions` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_RolePermissions_Roles` FOREIGN KEY (`RoleId`) REFERENCES `roles` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `refreshtokens`;
CREATE TABLE `refreshtokens` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `UserId` int NOT NULL,
  `TokenHash` varchar(255) NOT NULL,
  `ExpiresAt` datetime NOT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `RevokedAt` datetime DEFAULT NULL,
  `ReplacedByTokenId` int DEFAULT NULL,
  `CreatedByIp` varchar(45) DEFAULT NULL,
  `RevokedByIp` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_RefreshTokens_Users` (`UserId`),
  CONSTRAINT `FK_RefreshTokens_Users` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------------------------
-- Catalog
-- ---------------------------------------------------------------------------

DROP TABLE IF EXISTS `publishers`;
CREATE TABLE `publishers` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) NOT NULL,
  `Website` varchar(500) DEFAULT NULL,
  `Email` varchar(255) DEFAULT NULL,
  `Phone` varchar(30) DEFAULT NULL,
  `Address` varchar(500) DEFAULT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `authors`;
CREATE TABLE `authors` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `FirstName` varchar(100) NOT NULL,
  `LastName` varchar(100) NOT NULL,
  `Biography` text,
  `Country` varchar(100) DEFAULT NULL,
  `BirthDate` date DEFAULT NULL,
  `PhotoUrl` varchar(500) DEFAULT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `ParentCategoryId` int DEFAULT NULL,
  `Name` varchar(150) NOT NULL,
  `Description` varchar(500) DEFAULT NULL,
  `Icon` varchar(100) DEFAULT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `UQ_Categories_Name` (`Name`),
  KEY `FK_Categories_Parent` (`ParentCategoryId`),
  CONSTRAINT `FK_Categories_Parent` FOREIGN KEY (`ParentCategoryId`) REFERENCES `categories` (`Id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `books`;
CREATE TABLE `books` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `ISBN` varchar(20) NOT NULL,
  `Title` varchar(255) NOT NULL,
  `Subtitle` varchar(255) DEFAULT NULL,
  `Description` text,
  `Language` varchar(100) DEFAULT NULL,
  `Edition` varchar(100) DEFAULT NULL,
  `PublisherId` int NOT NULL,
  `PublishedDate` date DEFAULT NULL,
  `Price` decimal(10,2) DEFAULT NULL,
  `CoverImageUrl` varchar(500) DEFAULT NULL,
  `Status` varchar(30) NOT NULL DEFAULT 'Active',
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `DeletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `UQ_Books_ISBN` (`ISBN`),
  KEY `IX_Books_Title` (`Title`),
  KEY `IX_Books_PublisherId` (`PublisherId`),
  CONSTRAINT `FK_Books_Publishers` FOREIGN KEY (`PublisherId`) REFERENCES `publishers` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `bookauthors`;
CREATE TABLE `bookauthors` (
  `BookId` int NOT NULL,
  `AuthorId` int NOT NULL,
  PRIMARY KEY (`BookId`,`AuthorId`),
  KEY `FK_BookAuthors_Authors` (`AuthorId`),
  CONSTRAINT `FK_BookAuthors_Authors` FOREIGN KEY (`AuthorId`) REFERENCES `authors` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_BookAuthors_Books` FOREIGN KEY (`BookId`) REFERENCES `books` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `bookcategories`;
CREATE TABLE `bookcategories` (
  `BookId` int NOT NULL,
  `CategoryId` int NOT NULL,
  PRIMARY KEY (`BookId`,`CategoryId`),
  KEY `FK_BookCategories_Categories` (`CategoryId`),
  CONSTRAINT `FK_BookCategories_Books` FOREIGN KEY (`BookId`) REFERENCES `books` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_BookCategories_Categories` FOREIGN KEY (`CategoryId`) REFERENCES `categories` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `bookcopies`;
CREATE TABLE `bookcopies` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `BookId` int NOT NULL,
  `Barcode` varchar(100) NOT NULL,
  `QRCode` varchar(255) DEFAULT NULL,
  `ConditionStatus` varchar(30) NOT NULL DEFAULT 'Good',
  `Status` varchar(30) NOT NULL DEFAULT 'Available',
  `PurchaseDate` date DEFAULT NULL,
  `Price` decimal(10,2) DEFAULT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `UQ_BookCopies_Barcode` (`Barcode`),
  KEY `IX_BookCopies_BookId` (`BookId`),
  KEY `IX_BookCopies_Status` (`Status`),
  CONSTRAINT `FK_BookCopies_Books` FOREIGN KEY (`BookId`) REFERENCES `books` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------------------------
-- Circulation
-- ---------------------------------------------------------------------------

DROP TABLE IF EXISTS `borrowtransactions`;
CREATE TABLE `borrowtransactions` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `UserId` int NOT NULL,
  `ProcessedByUserId` int DEFAULT NULL,
  `BorrowedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Notes` varchar(500) DEFAULT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  KEY `FK_BorrowTransactions_ProcessedBy` (`ProcessedByUserId`),
  KEY `IX_BorrowTransactions_UserId` (`UserId`),
  CONSTRAINT `FK_BorrowTransactions_ProcessedBy` FOREIGN KEY (`ProcessedByUserId`) REFERENCES `users` (`Id`),
  CONSTRAINT `FK_BorrowTransactions_User` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `borrowitems`;
CREATE TABLE `borrowitems` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `BorrowTransactionId` int NOT NULL,
  `BookCopyId` int NOT NULL,
  `BorrowedAt` datetime NOT NULL,
  `DueDate` datetime NOT NULL,
  `ReturnedAt` datetime DEFAULT NULL,
  `Status` varchar(30) NOT NULL DEFAULT 'Borrowed',
  `RenewalCount` int NOT NULL DEFAULT '0',
  `ConditionAtBorrow` varchar(30) DEFAULT NULL,
  `ConditionAtReturn` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_BorrowItems_Transactions` (`BorrowTransactionId`),
  KEY `IX_BorrowItems_BookCopyId` (`BookCopyId`),
  KEY `IX_BorrowItems_DueDate` (`DueDate`),
  KEY `IX_BorrowItems_Status` (`Status`),
  CONSTRAINT `FK_BorrowItems_BookCopies` FOREIGN KEY (`BookCopyId`) REFERENCES `bookcopies` (`Id`),
  CONSTRAINT `FK_BorrowItems_Transactions` FOREIGN KEY (`BorrowTransactionId`) REFERENCES `borrowtransactions` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------------------------
-- Fines & Payments
-- ---------------------------------------------------------------------------

DROP TABLE IF EXISTS `fines`;
CREATE TABLE `fines` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `UserId` int NOT NULL,
  `BorrowItemId` int DEFAULT NULL,
  `Type` varchar(30) NOT NULL,
  `Amount` decimal(10,2) NOT NULL,
  `Reason` varchar(500) DEFAULT NULL,
  `Status` varchar(30) NOT NULL DEFAULT 'Unpaid',
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `WaivedAt` datetime DEFAULT NULL,
  `WaivedByUserId` int DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_Fines_BorrowItems` (`BorrowItemId`),
  KEY `FK_Fines_WaivedBy` (`WaivedByUserId`),
  KEY `IX_Fines_UserId` (`UserId`),
  KEY `IX_Fines_Status` (`Status`),
  CONSTRAINT `FK_Fines_BorrowItems` FOREIGN KEY (`BorrowItemId`) REFERENCES `borrowitems` (`Id`),
  CONSTRAINT `FK_Fines_Users` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`),
  CONSTRAINT `FK_Fines_WaivedBy` FOREIGN KEY (`WaivedByUserId`) REFERENCES `users` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `FineId` int NOT NULL,
  `UserId` int NOT NULL,
  `Amount` decimal(10,2) NOT NULL,
  `PaymentMethod` varchar(50) NOT NULL,
  `TransactionReference` varchar(255) DEFAULT NULL,
  `PaidAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ProcessedByUserId` int DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_Payments_Fines` (`FineId`),
  KEY `FK_Payments_Users` (`UserId`),
  KEY `FK_Payments_ProcessedBy` (`ProcessedByUserId`),
  CONSTRAINT `FK_Payments_Fines` FOREIGN KEY (`FineId`) REFERENCES `fines` (`Id`),
  CONSTRAINT `FK_Payments_ProcessedBy` FOREIGN KEY (`ProcessedByUserId`) REFERENCES `users` (`Id`),
  CONSTRAINT `FK_Payments_Users` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------------------------
-- Engagement
-- ---------------------------------------------------------------------------

DROP TABLE IF EXISTS `favorites`;
CREATE TABLE `favorites` (
  `UserId` int NOT NULL,
  `BookId` int NOT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`UserId`,`BookId`),
  KEY `FK_Favorites_Books` (`BookId`),
  CONSTRAINT `FK_Favorites_Books` FOREIGN KEY (`BookId`) REFERENCES `books` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_Favorites_Users` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `UserId` int NOT NULL,
  `BookId` int NOT NULL,
  `Rating` tinyint unsigned NOT NULL,
  `Comment` text,
  `Status` varchar(30) NOT NULL DEFAULT 'Published',
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `UQ_Reviews_UserBook` (`UserId`,`BookId`),
  KEY `FK_Reviews_Books` (`BookId`),
  CONSTRAINT `FK_Reviews_Books` FOREIGN KEY (`BookId`) REFERENCES `books` (`Id`),
  CONSTRAINT `FK_Reviews_Users` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `reservations`;
CREATE TABLE `reservations` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `UserId` int NOT NULL,
  `BookId` int NOT NULL,
  `Status` varchar(30) NOT NULL DEFAULT 'Waiting',
  `ReservedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ExpiresAt` datetime DEFAULT NULL,
  `FulfilledAt` datetime DEFAULT NULL,
  `CancelledAt` datetime DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_Reservations_BookId` (`BookId`),
  KEY `IX_Reservations_UserId` (`UserId`),
  KEY `IX_Reservations_Status` (`Status`),
  CONSTRAINT `FK_Reservations_Books` FOREIGN KEY (`BookId`) REFERENCES `books` (`Id`),
  CONSTRAINT `FK_Reservations_Users` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------------------------
-- Notifications, Email Templates, Logs & Settings
-- ---------------------------------------------------------------------------

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `UserId` int NOT NULL,
  `Type` varchar(50) NOT NULL,
  `ReferenceId` int DEFAULT NULL,
  `Title` varchar(255) NOT NULL,
  `Message` text NOT NULL,
  `IsRead` tinyint(1) NOT NULL DEFAULT '0',
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ReadAt` datetime DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_Notifications_UserId` (`UserId`),
  KEY `IX_Notifications_IsRead` (`IsRead`),
  KEY `idx_notifications_type_reference` (`Type`,`ReferenceId`),
  CONSTRAINT `FK_Notifications_Users` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `emailtemplates`;
CREATE TABLE `emailtemplates` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) NOT NULL,
  `Code` varchar(100) NOT NULL,
  `Subject` varchar(200) NOT NULL,
  `BodyHtml` text NOT NULL,
  `Description` varchar(500) DEFAULT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `UX_EmailTemplates_Code` (`Code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `activitylogs`;
CREATE TABLE `activitylogs` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `UserId` int DEFAULT NULL,
  `Action` varchar(100) NOT NULL,
  `Details` text,
  `IpAddress` varchar(45) DEFAULT NULL,
  `UserAgent` text,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `auditlogs`;
CREATE TABLE `auditlogs` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `UserId` int DEFAULT NULL,
  `Action` varchar(100) NOT NULL,
  `EntityType` varchar(100) DEFAULT NULL,
  `EntityId` int DEFAULT NULL,
  `OldValues` json DEFAULT NULL,
  `NewValues` json DEFAULT NULL,
  `IpAddress` varchar(45) DEFAULT NULL,
  `UserAgent` varchar(500) DEFAULT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  KEY `IX_AuditLogs_UserId` (`UserId`),
  CONSTRAINT `FK_AuditLogs_Users` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Key` varchar(150) NOT NULL,
  `Value` text NOT NULL,
  `Description` varchar(500) DEFAULT NULL,
  `UpdatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `UpdatedByUserId` int DEFAULT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `UQ_Settings_Key` (`Key`),
  KEY `FK_Settings_UpdatedBy` (`UpdatedByUserId`),
  CONSTRAINT `FK_Settings_UpdatedBy` FOREIGN KEY (`UpdatedByUserId`) REFERENCES `users` (`Id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET FOREIGN_KEY_CHECKS = 1;
-- ============================================================
-- TalentTrack UNC — Cleaned Database Schema (SQL Dump)
-- Generated: Jun 07, 2026
--
-- CHANGES SUMMARY:
-- 1. applications   – removed applicant_* columns that duplicate users data;
--                     removed applicant_age (derived from birthdate);
--                     removed applications_this_week_tracker (not persistent data);
--                     removed applied_at (duplicate of created_at).
-- 2. users          – removed application_status (use applications.status instead);
--                     removed training_status (use trainees.current_status instead).
-- 3. trainees       – removed completion_rate (derived from chapters_completed);
--                     removed chapter varchar (redundant with chapters_completed JSON).
-- 4. documents      – removed uploaded_by varchar (use user_id FK instead);
--                     changed file_size to int (bytes) from varchar string.
-- 5. module_names   – dropped (empty table with no data columns).
-- ============================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- --------------------------------------------------------
-- Table: users (Cleaned)
-- --------------------------------------------------------

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` varchar(30) NOT NULL DEFAULT 'student',
  `talent_group` varchar(60) DEFAULT NULL,
  `student_id` varchar(30) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `year_level` varchar(30) DEFAULT NULL,
  `course` varchar(120) DEFAULT NULL,
  `department` varchar(120) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: applications (Cleaned)
-- --------------------------------------------------------

CREATE TABLE `applications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `talent_group` enum('marching-band','glee-club','dance-club','majorettes') NOT NULL,
  `status` enum('pending','interview_scheduled','approved','rejected') NOT NULL DEFAULT 'pending',
  `applicant_name` varchar(255) DEFAULT NULL,
  `applicant_email` varchar(255) DEFAULT NULL,
  `applicant_student_id` varchar(20) DEFAULT NULL,
  `applicant_phone` varchar(20) DEFAULT NULL,
  `applicant_birthdate` date DEFAULT NULL,
  `applicant_gender` varchar(20) DEFAULT NULL,
  `applicant_year_level` varchar(30) DEFAULT NULL,
  `applicant_course` varchar(120) DEFAULT NULL,
  `applicant_department` varchar(120) DEFAULT NULL,
  `applicant_address` text DEFAULT NULL,
  `guardian_name` varchar(120) DEFAULT NULL,
  `guardian_phone` varchar(20) DEFAULT NULL,
  `guardian_relationship` varchar(60) DEFAULT NULL,
  `social_media` varchar(255) DEFAULT NULL,
  `photo_path` varchar(255) DEFAULT NULL,
  `vocal_range` varchar(60) DEFAULT NULL,
  `primary_dance_genre` varchar(80) DEFAULT NULL,
  `years_of_experience` varchar(20) DEFAULT NULL,
  `documents` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`documents`)),
  `portfolio_url` varchar(255) DEFAULT NULL,
  `denial_reason` varchar(120) DEFAULT NULL,
  `denial_feedback` text DEFAULT NULL,
  `approval_notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `applications_user_id_foreign` (`user_id`),
  KEY `applications_talent_group_status_index` (`talent_group`,`status`),
  KEY `applications_status_index` (`status`),
  CONSTRAINT `applications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: trainees (Cleaned)
-- --------------------------------------------------------

CREATE TABLE `trainees` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `current_status` enum('active','inactive','completed','dropped') NOT NULL DEFAULT 'active',
  `chapters_completed` text DEFAULT NULL,
  `instrument` varchar(80) DEFAULT NULL,
  `voice` varchar(80) DEFAULT NULL,
  `deactivation_note` text DEFAULT NULL,
  `total_expected_sessions` smallint(5) UNSIGNED NOT NULL DEFAULT 30,
  `date_joined` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `trainees_user_id_unique` (`user_id`),
  KEY `trainees_current_status_index` (`current_status`),
  CONSTRAINT `trainees_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: documents (Cleaned)
-- --------------------------------------------------------

CREATE TABLE `documents` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_size` int(10) UNSIGNED DEFAULT NULL COMMENT 'File size in bytes',
  `file_type` varchar(255) NOT NULL,
  `category` enum('scholarship-contract','event-request','event-approval','performance-report','scholar-records') NOT NULL DEFAULT 'scholar-records',
  `talent_group` varchar(255) DEFAULT NULL,
  `related_to` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `status` enum('pending','approved','completed') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `documents_user_id_foreign` (`user_id`),
  CONSTRAINT `documents_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Other Tables (Unchanged)
-- ============================================================

CREATE TABLE `attendance_records` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `trainee_id` bigint(20) UNSIGNED NOT NULL,
  `session_date` date NOT NULL,
  `no_practice` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('present','absent') NOT NULL DEFAULT 'absent',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `attendance_records_trainee_id_session_date_unique` (`trainee_id`,`session_date`),
  CONSTRAINT `attendance_records_trainee_id_foreign` FOREIGN KEY (`trainee_id`) REFERENCES `trainees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `engagements` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `event_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `date` date NOT NULL,
  `time` varchar(10) NOT NULL,
  `venue` varchar(255) NOT NULL,
  `talent_groups` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`talent_groups`)),
  `type` enum('performance','rehearsal','workshop','competition') NOT NULL DEFAULT 'performance',
  `is_required` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('scheduled','completed','cancelled') NOT NULL DEFAULT 'scheduled',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `evaluations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `trainee_id` bigint(20) UNSIGNED NOT NULL,
  `evaluator_id` bigint(20) UNSIGNED NOT NULL,
  `rating` tinyint(3) UNSIGNED NOT NULL,
  `section_a` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`section_a`)),
  `section_b` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`section_b`)),
  `section_c` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`section_c`)),
  `notes` text DEFAULT NULL,
  `strengths` text DEFAULT NULL,
  `improvements` text DEFAULT NULL,
  `recommendation` enum('continue','probation','discontinue') NOT NULL DEFAULT 'continue',
  `status` enum('draft','submitted') NOT NULL DEFAULT 'draft',
  `semester` varchar(30) DEFAULT NULL,
  `academic_year` varchar(20) DEFAULT NULL,
  `adjectival_rating` varchar(60) DEFAULT NULL,
  `recommend_for_renewal` tinyint(1) NOT NULL DEFAULT 0,
  `evaluation_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `evaluations_trainee_id_evaluation_date_index` (`trainee_id`,`evaluation_date`),
  KEY `evaluations_evaluator_id_evaluation_date_index` (`evaluator_id`,`evaluation_date`),
  CONSTRAINT `evaluations_trainee_id_foreign` FOREIGN KEY (`trainee_id`) REFERENCES `trainees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `evaluations_evaluator_id_foreign` FOREIGN KEY (`evaluator_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `interviews` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `application_id` bigint(20) UNSIGNED NOT NULL,
  `reviewer_id` bigint(20) UNSIGNED NOT NULL,
  `scheduled_at` datetime NOT NULL,
  `venue` varchar(200) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `outcome` enum('pending','passed','failed','no_show') NOT NULL DEFAULT 'pending',
  `outcome_notes` text DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `interviews_application_id_unique` (`application_id`),
  KEY `interviews_reviewer_id_scheduled_at_index` (`reviewer_id`,`scheduled_at`),
  CONSTRAINT `interviews_application_id_foreign` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `interviews_reviewer_id_foreign` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` enum('uniform','instrument','accessory') NOT NULL DEFAULT 'instrument',
  `condition` enum('excellent','good','fair','needs_repair') NOT NULL DEFAULT 'good',
  `status` enum('available','assigned','borrowed','returned','lost','damaged') NOT NULL DEFAULT 'available',
  `talent_group` varchar(255) DEFAULT NULL,
  `serial_number` varchar(255) DEFAULT NULL,
  `property_type` varchar(255) DEFAULT NULL,
  `instrument_type` varchar(255) DEFAULT NULL,
  `accessory_type` varchar(255) DEFAULT NULL,
  `uniform_set` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `assigned_to` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `products_assigned_to_foreign` (`assigned_to`),
  CONSTRAINT `products_assigned_to_foreign` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `scholarships` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `semester` varchar(255) NOT NULL,
  `year` smallint(5) UNSIGNED NOT NULL,
  `gpa` decimal(4,2) NOT NULL,
  `documents` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`documents`)),
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `review_notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `scholarships_user_id_foreign` (`user_id`),
  CONSTRAINT `scholarships_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

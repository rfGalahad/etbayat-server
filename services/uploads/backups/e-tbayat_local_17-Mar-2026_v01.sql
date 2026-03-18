/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: accomplished_by
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `accomplished_by` (
  `accomplished_by_id` int NOT NULL AUTO_INCREMENT,
  `pwd_id` varchar(50) DEFAULT NULL,
  `person_id` int DEFAULT NULL,
  `role` enum('applicant', 'representative', 'guardian') DEFAULT NULL,
  PRIMARY KEY (`accomplished_by_id`),
  KEY `pwd_id` (`pwd_id`),
  KEY `person_id` (`person_id`),
  CONSTRAINT `accomplished_by_ibfk_1` FOREIGN KEY (`pwd_id`) REFERENCES `pwd_id_applications` (`pwd_id`) ON DELETE CASCADE,
  CONSTRAINT `accomplished_by_ibfk_2` FOREIGN KEY (`person_id`) REFERENCES `person` (`person_id`)
) ENGINE = InnoDB AUTO_INCREMENT = 25 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: activity_log
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `activity_log` (
  `activity_log_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) DEFAULT NULL,
  `description` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`activity_log_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `activity_log_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE = InnoDB AUTO_INCREMENT = 458 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: affiliation
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `affiliation` (
  `resident_id` varchar(50) NOT NULL,
  `date_become_officer` date DEFAULT NULL,
  `date_become_member` date DEFAULT NULL,
  `organization_name` varchar(100) DEFAULT NULL,
  `office_address` text,
  `contact_number` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`resident_id`),
  CONSTRAINT `affiliation_ibfk_1` FOREIGN KEY (`resident_id`) REFERENCES `population` (`resident_id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: amenities
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `amenities` (
  `amenities_id` int NOT NULL AUTO_INCREMENT,
  `survey_id` varchar(50) DEFAULT NULL,
  `amenity` varchar(50) DEFAULT NULL,
  `count` decimal(10, 2) DEFAULT NULL,
  PRIMARY KEY (`amenities_id`),
  UNIQUE KEY `uniq_amenity` (`survey_id`, `amenity`),
  CONSTRAINT `amenities_ibfk_1` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`survey_id`) ON DELETE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 298 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: appliances_own
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `appliances_own` (
  `appliances_own_id` int NOT NULL AUTO_INCREMENT,
  `survey_id` varchar(50) DEFAULT NULL,
  `appliance` varchar(50) DEFAULT NULL,
  `count` int DEFAULT NULL,
  PRIMARY KEY (`appliances_own_id`),
  UNIQUE KEY `uniq_appliance` (`survey_id`, `appliance`),
  CONSTRAINT `appliances_own_ibfk_1` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`survey_id`) ON DELETE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 428 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: community_issues
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `community_issues` (
  `community_issues_id` int NOT NULL AUTO_INCREMENT,
  `survey_id` varchar(50) DEFAULT NULL,
  `community_issue` text,
  PRIMARY KEY (`community_issues_id`),
  KEY `survey_id` (`survey_id`),
  CONSTRAINT `community_issues_ibfk_1` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`survey_id`) ON DELETE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 61 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: contact_information
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `contact_information` (
  `resident_id` varchar(50) NOT NULL,
  `street` varchar(100) DEFAULT NULL,
  `barangay` varchar(50) DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `telephone_number` varchar(20) DEFAULT NULL,
  `email_address` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`resident_id`),
  CONSTRAINT `contact_information_ibfk_1` FOREIGN KEY (`resident_id`) REFERENCES `population` (`resident_id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: crops_planted
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `crops_planted` (
  `crops_planted_id` int NOT NULL AUTO_INCREMENT,
  `survey_id` varchar(50) DEFAULT NULL,
  `crops` varchar(50) DEFAULT NULL,
  `planted_area` int DEFAULT NULL,
  PRIMARY KEY (`crops_planted_id`),
  UNIQUE KEY `uniq_crops` (`survey_id`, `crops`),
  CONSTRAINT `crops_planted_ibfk_1` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`survey_id`) ON DELETE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 375 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: education_expenses
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `education_expenses` (
  `education_expenses_id` int NOT NULL AUTO_INCREMENT,
  `survey_id` varchar(50) DEFAULT NULL,
  `expense_type` varchar(50) DEFAULT NULL,
  `amount` decimal(10, 2) DEFAULT NULL,
  PRIMARY KEY (`education_expenses_id`),
  UNIQUE KEY `unique_survey_expense` (`survey_id`, `expense_type`),
  CONSTRAINT `education_expenses_ibfk_1` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`survey_id`) ON DELETE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 703 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: emergency_contact
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `emergency_contact` (
  `emergency_contact_id` int NOT NULL AUTO_INCREMENT,
  `solo_parent_id` varchar(50) DEFAULT NULL,
  `contact_name` varchar(50) DEFAULT NULL,
  `relationship` varchar(50) DEFAULT NULL,
  `contact_number` varchar(50) DEFAULT NULL,
  `house_street` varchar(50) DEFAULT NULL,
  `barangay` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`emergency_contact_id`),
  KEY `solo_parent_id` (`solo_parent_id`),
  CONSTRAINT `emergency_contact_ibfk_1` FOREIGN KEY (`solo_parent_id`) REFERENCES `solo_parent_id_applications` (`solo_parent_id`) ON DELETE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 10 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: family_background
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `family_background` (
  `family_background_id` int NOT NULL AUTO_INCREMENT,
  `pwd_id` varchar(50) DEFAULT NULL,
  `person_id` int DEFAULT NULL,
  `role` enum('mother', 'father', 'guardian') DEFAULT NULL,
  PRIMARY KEY (`family_background_id`),
  KEY `pwd_id` (`pwd_id`),
  KEY `person_id` (`person_id`),
  CONSTRAINT `family_background_ibfk_1` FOREIGN KEY (`pwd_id`) REFERENCES `pwd_id_applications` (`pwd_id`) ON DELETE CASCADE,
  CONSTRAINT `family_background_ibfk_2` FOREIGN KEY (`person_id`) REFERENCES `person` (`person_id`)
) ENGINE = InnoDB AUTO_INCREMENT = 73 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: family_composition
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `family_composition` (
  `family_composition_id` int NOT NULL AUTO_INCREMENT,
  `senior_citizen_id` varchar(50) DEFAULT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `suffix` varchar(50) DEFAULT NULL,
  `sex` enum('Male', 'Female') DEFAULT NULL,
  `relationship` varchar(50) DEFAULT NULL,
  `birthdate` date DEFAULT NULL,
  `civil_status` varchar(50) DEFAULT NULL,
  `occupation` varchar(50) DEFAULT NULL,
  `annual_income` decimal(10, 2) DEFAULT NULL,
  PRIMARY KEY (`family_composition_id`),
  KEY `senior_citizen_id` (`senior_citizen_id`),
  CONSTRAINT `family_composition_ibfk_1` FOREIGN KEY (`senior_citizen_id`) REFERENCES `senior_citizen_id_applications` (`senior_citizen_id`) ON DELETE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 7 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: family_expenses
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `family_expenses` (
  `family_expenses_id` int NOT NULL AUTO_INCREMENT,
  `survey_id` varchar(50) DEFAULT NULL,
  `expense_type` varchar(50) DEFAULT NULL,
  `amount` decimal(10, 2) DEFAULT NULL,
  PRIMARY KEY (`family_expenses_id`),
  UNIQUE KEY `unique_survey_expense` (`survey_id`, `expense_type`),
  CONSTRAINT `family_expenses_ibfk_1` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`survey_id`) ON DELETE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 792 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: family_information
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `family_information` (
  `family_id` varchar(50) NOT NULL,
  `household_id` varchar(50) DEFAULT NULL,
  `survey_id` varchar(50) DEFAULT NULL,
  `family_class` varchar(10) DEFAULT NULL,
  `monthly_income` decimal(15, 2) DEFAULT NULL,
  `irregular_income` decimal(15, 2) DEFAULT NULL,
  `family_income` decimal(15, 2) DEFAULT NULL,
  `irregular_income_remarks` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`family_id`),
  KEY `fk_family_survey` (`survey_id`),
  KEY `family_information_ibfk_1` (`household_id`),
  CONSTRAINT `family_information_ibfk_1` FOREIGN KEY (`household_id`) REFERENCES `households` (`household_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_family_survey` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`survey_id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: family_resources
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `family_resources` (
  `family_resources_id` int NOT NULL AUTO_INCREMENT,
  `survey_id` varchar(50) DEFAULT NULL,
  `resources` varchar(50) DEFAULT NULL,
  `amount` decimal(12, 2) DEFAULT NULL,
  PRIMARY KEY (`family_resources_id`),
  UNIQUE KEY `uniq_resources` (`survey_id`, `resources`),
  CONSTRAINT `family_resources_ibfk_1` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`survey_id`) ON DELETE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 224 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: farm_lots
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `farm_lots` (
  `farm_lots_id` int NOT NULL AUTO_INCREMENT,
  `survey_id` varchar(50) DEFAULT NULL,
  `ownership_type` varchar(50) DEFAULT NULL,
  `cultivation` int DEFAULT NULL,
  `pastureland` int DEFAULT NULL,
  `forestland` int DEFAULT NULL,
  PRIMARY KEY (`farm_lots_id`),
  KEY `survey_id` (`survey_id`),
  CONSTRAINT `farm_lots_ibfk_1` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`survey_id`) ON DELETE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 105 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: food_expenses
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `food_expenses` (
  `food_expenses_id` int NOT NULL AUTO_INCREMENT,
  `survey_id` varchar(50) DEFAULT NULL,
  `expense_type` varchar(50) DEFAULT NULL,
  `amount` decimal(10, 2) DEFAULT NULL,
  PRIMARY KEY (`food_expenses_id`),
  UNIQUE KEY `unique_survey_expense` (`survey_id`, `expense_type`),
  CONSTRAINT `food_expenses_ibfk_1` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`survey_id`) ON DELETE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 810 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: fruit_bearing_trees
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `fruit_bearing_trees` (
  `fruit_bearing_trees_id` int NOT NULL AUTO_INCREMENT,
  `survey_id` varchar(50) DEFAULT NULL,
  `tree` varchar(50) DEFAULT NULL,
  `count` int DEFAULT NULL,
  PRIMARY KEY (`fruit_bearing_trees_id`),
  UNIQUE KEY `uniq_tree` (`survey_id`, `tree`),
  CONSTRAINT `fruit_bearing_trees_ibfk_1` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`survey_id`) ON DELETE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 267 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: government_ids
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `government_ids` (
  `resident_id` varchar(50) NOT NULL,
  `sss` varchar(50) DEFAULT NULL,
  `gsis` varchar(50) DEFAULT NULL,
  `pagibig` varchar(50) DEFAULT NULL,
  `psn` varchar(50) DEFAULT NULL,
  `philhealth` varchar(50) DEFAULT NULL,
  `philsys` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`resident_id`),
  CONSTRAINT `government_ids_ibfk_1` FOREIGN KEY (`resident_id`) REFERENCES `population` (`resident_id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: hazard_areas
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `hazard_areas` (
  `hazard_area_id` int NOT NULL AUTO_INCREMENT,
  `latitude` decimal(10, 6) DEFAULT NULL,
  `longitude` decimal(10, 6) DEFAULT NULL,
  `radius` int DEFAULT NULL,
  `hazard_type` varchar(50) DEFAULT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`hazard_area_id`)
) ENGINE = InnoDB AUTO_INCREMENT = 25 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: health_information
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `health_information` (
  `resident_id` varchar(50) NOT NULL,
  `blood_type` enum('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'HH') DEFAULT NULL,
  `health_status` text,
  `disability_type` varchar(100) DEFAULT NULL,
  `disability_cause` varchar(100) DEFAULT NULL,
  `disability_specific` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`resident_id`),
  CONSTRAINT `health_information_ibfk_1` FOREIGN KEY (`resident_id`) REFERENCES `population` (`resident_id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: house_images
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `house_images` (
  `house_image_id` int NOT NULL AUTO_INCREMENT,
  `household_id` varchar(50) DEFAULT NULL,
  `house_image_url` text,
  `house_image_public_id` text,
  `house_image_title` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`house_image_id`),
  KEY `house_images_ibfk_1` (`household_id`),
  CONSTRAINT `house_images_ibfk_1` FOREIGN KEY (`household_id`) REFERENCES `households` (`household_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 86 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: household_composition
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `household_composition` (
  `household_composition_id` int NOT NULL AUTO_INCREMENT,
  `solo_parent_id` varchar(50) DEFAULT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `suffix` varchar(50) DEFAULT NULL,
  `sex` enum('Male', 'Female') DEFAULT NULL,
  `relationship` varchar(50) DEFAULT NULL,
  `birthdate` date DEFAULT NULL,
  `civil_status` varchar(50) DEFAULT NULL,
  `educational_attainment` varchar(50) DEFAULT NULL,
  `occupation` varchar(50) DEFAULT NULL,
  `monthly_income` decimal(10, 2) DEFAULT NULL,
  PRIMARY KEY (`household_composition_id`),
  KEY `solo_parent_id` (`solo_parent_id`),
  CONSTRAINT `household_composition_ibfk_1` FOREIGN KEY (`solo_parent_id`) REFERENCES `solo_parent_id_applications` (`solo_parent_id`) ON DELETE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 22 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: households
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `households` (
  `household_id` varchar(50) NOT NULL,
  `family_class` varchar(10) DEFAULT NULL,
  `monthly_income` decimal(10, 2) DEFAULT NULL,
  `irregular_income` decimal(10, 2) DEFAULT NULL,
  `family_income` decimal(10, 2) DEFAULT NULL,
  `house_structure` varchar(100) DEFAULT NULL,
  `house_condition` varchar(100) DEFAULT NULL,
  `latitude` decimal(9, 6) DEFAULT NULL,
  `longitude` decimal(9, 6) DEFAULT NULL,
  `street` varchar(100) DEFAULT NULL,
  `barangay` varchar(50) DEFAULT NULL,
  `municipality` varchar(50) DEFAULT NULL,
  `multiple_family` tinyint(1) DEFAULT NULL,
  `family_head_first_name` varchar(50) DEFAULT NULL,
  `family_head_middle_name` varchar(50) DEFAULT NULL,
  `family_head_last_name` varchar(50) DEFAULT NULL,
  `family_head_suffix` varchar(50) DEFAULT NULL,
  `sitio_yawran` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`household_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: id_generator_information
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `id_generator_information` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mayor_name` varchar(100) DEFAULT NULL,
  `mayor_signature` text,
  `mswdo_officer` varchar(100) DEFAULT NULL,
  `mswdo_signature` text,
  `osca_head` varchar(100) DEFAULT NULL,
  `osca_head_signature` text,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 2 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: ignored_duplicates
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `ignored_duplicates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `resident_id_1` varchar(50) NOT NULL,
  `resident_id_2` varchar(50) NOT NULL,
  `ignored_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ignored_by` varchar(255) DEFAULT NULL,
  `reason` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_pair` (`resident_id_1`, `resident_id_2`)
) ENGINE = InnoDB AUTO_INCREMENT = 2 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: livestock
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `livestock` (
  `livestock_id` int NOT NULL AUTO_INCREMENT,
  `survey_id` varchar(50) DEFAULT NULL,
  `animal_type` varchar(50) DEFAULT NULL,
  `own` int DEFAULT NULL,
  `dispersal` int DEFAULT NULL,
  PRIMARY KEY (`livestock_id`),
  UNIQUE KEY `unique_survey_animal` (`survey_id`, `animal_type`),
  CONSTRAINT `livestock_ibfk_1` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`survey_id`) ON DELETE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1444 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: monthly_expenses
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `monthly_expenses` (
  `monthly_expenses_id` int NOT NULL AUTO_INCREMENT,
  `survey_id` varchar(50) DEFAULT NULL,
  `expense_type` varchar(50) DEFAULT NULL,
  `amount` decimal(10, 2) DEFAULT NULL,
  PRIMARY KEY (`monthly_expenses_id`),
  UNIQUE KEY `unique_survey_expense` (`survey_id`, `expense_type`),
  CONSTRAINT `monthly_expenses_ibfk_1` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`survey_id`) ON DELETE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 578 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: non_ivatan
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `non_ivatan` (
  `resident_id` varchar(50) NOT NULL,
  `settlement_details` text,
  `ethnicity` varchar(100) DEFAULT NULL,
  `place_of_origin` varchar(100) DEFAULT NULL,
  `transient` tinyint(1) DEFAULT NULL,
  `house_owner` varchar(100) DEFAULT NULL,
  `date_registered` date DEFAULT NULL,
  PRIMARY KEY (`resident_id`),
  CONSTRAINT `non_ivatan_ibfk_1` FOREIGN KEY (`resident_id`) REFERENCES `population` (`resident_id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: officers
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `officers` (
  `officers_id` int NOT NULL AUTO_INCREMENT,
  `pwd_id` varchar(50) DEFAULT NULL,
  `person_id` int DEFAULT NULL,
  `role` enum('processor', 'approver', 'encoder') DEFAULT NULL,
  PRIMARY KEY (`officers_id`),
  KEY `pwd_id` (`pwd_id`),
  KEY `person_id` (`person_id`),
  CONSTRAINT `officers_ibfk_1` FOREIGN KEY (`pwd_id`) REFERENCES `pwd_id_applications` (`pwd_id`) ON DELETE CASCADE,
  CONSTRAINT `officers_ibfk_2` FOREIGN KEY (`person_id`) REFERENCES `person` (`person_id`)
) ENGINE = InnoDB AUTO_INCREMENT = 73 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: osca_information
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `osca_information` (
  `osca_information_id` int NOT NULL AUTO_INCREMENT,
  `senior_citizen_id` varchar(50) DEFAULT NULL,
  `association_name` varchar(50) DEFAULT NULL,
  `date_elected_as_officer` date DEFAULT NULL,
  `position` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`osca_information_id`),
  KEY `senior_citizen_id` (`senior_citizen_id`),
  CONSTRAINT `osca_information_ibfk_1` FOREIGN KEY (`senior_citizen_id`) REFERENCES `senior_citizen_id_applications` (`senior_citizen_id`) ON DELETE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 6 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: person
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `person` (
  `person_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) DEFAULT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `suffix` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`person_id`)
) ENGINE = InnoDB AUTO_INCREMENT = 193 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: physician
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `physician` (
  `physician_id` int NOT NULL AUTO_INCREMENT,
  `pwd_id` varchar(50) DEFAULT NULL,
  `person_id` int DEFAULT NULL,
  `license_number` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`physician_id`),
  KEY `pwd_id` (`pwd_id`),
  KEY `person_id` (`person_id`),
  CONSTRAINT `physician_ibfk_1` FOREIGN KEY (`pwd_id`) REFERENCES `pwd_id_applications` (`pwd_id`) ON DELETE CASCADE,
  CONSTRAINT `physician_ibfk_2` FOREIGN KEY (`person_id`) REFERENCES `person` (`person_id`)
) ENGINE = InnoDB AUTO_INCREMENT = 25 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: population
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `population` (
  `resident_id` varchar(50) NOT NULL,
  `family_id` varchar(50) DEFAULT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `suffix` varchar(50) DEFAULT NULL,
  `sex` enum('Male', 'Female', 'Other') DEFAULT NULL,
  `birthdate` date DEFAULT NULL,
  `civil_status` varchar(100) DEFAULT NULL,
  `religion` text,
  `relation_to_family_head` varchar(100) DEFAULT NULL,
  `birthplace` text,
  `verified_birthdate` tinyint(1) DEFAULT NULL,
  `specify_id` varchar(50) DEFAULT NULL,
  `other_relationship` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`resident_id`),
  KEY `fk_population_family` (`family_id`),
  KEY `idx_population_sex_birthdate` (`sex`, `birthdate`),
  KEY `idx_population_names` (`first_name`, `last_name`),
  CONSTRAINT `fk_population_family` FOREIGN KEY (`family_id`) REFERENCES `family_information` (`family_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: posts
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `posts` (
  `post_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) DEFAULT NULL,
  `post_title` text,
  `post_description` text,
  `post_thumbnail_url` text,
  `post_thumbnail_id` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`post_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE = InnoDB AUTO_INCREMENT = 6 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: problem_needs
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `problem_needs` (
  `problem_needs_id` int NOT NULL AUTO_INCREMENT,
  `solo_parent_id` varchar(50) DEFAULT NULL,
  `cause_solo_parent` text,
  `needs_solo_parent` text,
  PRIMARY KEY (`problem_needs_id`),
  KEY `solo_parent_id` (`solo_parent_id`),
  CONSTRAINT `problem_needs_ibfk_1` FOREIGN KEY (`solo_parent_id`) REFERENCES `solo_parent_id_applications` (`solo_parent_id`) ON DELETE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 12 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: professional_information
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `professional_information` (
  `resident_id` varchar(50) NOT NULL,
  `educational_attainment` varchar(100) DEFAULT NULL,
  `skills` text,
  `occupation` varchar(100) DEFAULT NULL,
  `company` varchar(100) DEFAULT NULL,
  `employment_status` varchar(100) DEFAULT NULL,
  `employment_category` varchar(100) DEFAULT NULL,
  `employment_type` varchar(100) DEFAULT NULL,
  `monthly_income` decimal(10, 2) DEFAULT NULL,
  `annual_income` decimal(10, 2) DEFAULT NULL,
  `receiving_pension` tinyint(1) DEFAULT NULL,
  `pension_type` varchar(50) DEFAULT NULL,
  `pension_income` decimal(10, 2) DEFAULT NULL,
  `other_pension_type` varchar(100) DEFAULT NULL,
  `other_occupation` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`resident_id`),
  CONSTRAINT `professional_information_ibfk_1` FOREIGN KEY (`resident_id`) REFERENCES `population` (`resident_id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: pwd_id_applications
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `pwd_id_applications` (
  `pwd_id` varchar(50) NOT NULL,
  `user_id` varchar(50) DEFAULT NULL,
  `resident_id` varchar(50) DEFAULT NULL,
  `pwd_photo_id_url` text,
  `pwd_photo_id_public_Id` text,
  `pwd_signature_url` text,
  `pwd_signature_public_id` text,
  `reporting_unit` varchar(50) DEFAULT NULL,
  `control_number` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`pwd_id`),
  KEY `user_id` (`user_id`),
  KEY `resident_id` (`resident_id`),
  CONSTRAINT `pwd_id_applications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `pwd_id_applications_ibfk_2` FOREIGN KEY (`resident_id`) REFERENCES `population` (`resident_id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: senior_citizen_id_applications
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `senior_citizen_id_applications` (
  `senior_citizen_id` varchar(50) NOT NULL,
  `user_id` varchar(50) DEFAULT NULL,
  `resident_id` varchar(50) DEFAULT NULL,
  `senior_citizen_photo_id_url` text,
  `senior_citizen_photo_id_public_Id` text,
  `senior_citizen_signature_url` text,
  `senior_citizen_signature_public_id` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`senior_citizen_id`),
  KEY `user_id` (`user_id`),
  KEY `resident_id` (`resident_id`),
  CONSTRAINT `senior_citizen_id_applications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `senior_citizen_id_applications_ibfk_2` FOREIGN KEY (`resident_id`) REFERENCES `population` (`resident_id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: service_availed
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `service_availed` (
  `service_availed_id` int NOT NULL AUTO_INCREMENT,
  `family_id` varchar(50) DEFAULT NULL,
  `date_service_availed` date DEFAULT NULL,
  `ngo_name` varchar(100) DEFAULT NULL,
  `service_availed` varchar(100) DEFAULT NULL,
  `male_served` int DEFAULT NULL,
  `female_served` int DEFAULT NULL,
  `how_service_help` text,
  `other_ngo_name` varchar(100) DEFAULT NULL,
  `other_service_availed` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`service_availed_id`),
  KEY `service_availed_ibfk_1` (`family_id`),
  CONSTRAINT `service_availed_ibfk_1` FOREIGN KEY (`family_id`) REFERENCES `family_information` (`family_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 19 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: social_classification
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `social_classification` (
  `resident_id` varchar(50) NOT NULL,
  `classification_code` varchar(50) NOT NULL,
  `classification_name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`resident_id`, `classification_code`),
  CONSTRAINT `social_classification_ibfk_1` FOREIGN KEY (`resident_id`) REFERENCES `population` (`resident_id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: solo_parent_id_applications
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `solo_parent_id_applications` (
  `solo_parent_id` varchar(50) NOT NULL,
  `user_id` varchar(50) DEFAULT NULL,
  `resident_id` varchar(50) DEFAULT NULL,
  `solo_parent_photo_id_url` text,
  `solo_parent_signature_url` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `pantawid_beneficiary` tinyint(1) DEFAULT NULL,
  `beneficiary_code` varchar(50) DEFAULT NULL,
  `household_id` varchar(50) DEFAULT NULL,
  `indigenous_person` tinyint(1) DEFAULT NULL,
  `indigenous_affiliation` varchar(50) DEFAULT NULL,
  `lgbtq` tinyint(1) DEFAULT NULL,
  `pwd` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`solo_parent_id`),
  KEY `user_id` (`user_id`),
  KEY `resident_id` (`resident_id`),
  CONSTRAINT `solo_parent_id_applications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `solo_parent_id_applications_ibfk_2` FOREIGN KEY (`resident_id`) REFERENCES `population` (`resident_id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: surveys
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `surveys` (
  `survey_id` varchar(50) NOT NULL,
  `user_id` varchar(50) DEFAULT NULL,
  `respondent_photo_url` text,
  `respondent_photo_id` text,
  `respondent_signature_url` text,
  `respondent_signature_id` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `respondent_first_name` varchar(50) DEFAULT NULL,
  `respondent_middle_name` varchar(50) DEFAULT NULL,
  `respondent_last_name` varchar(50) DEFAULT NULL,
  `respondent_suffix` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`survey_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `surveys_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: users
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `users` (
  `user_id` varchar(50) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `username` varchar(50) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(20) DEFAULT NULL,
  `barangay` varchar(20) DEFAULT NULL,
  `password_changed_at` datetime DEFAULT NULL,
  `must_change_password` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: water_information
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `water_information` (
  `water_information_id` int NOT NULL AUTO_INCREMENT,
  `water_access` tinyint(1) DEFAULT NULL,
  `potable_water` tinyint(1) DEFAULT NULL,
  `water_sources` text,
  `survey_id` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`water_information_id`),
  KEY `fk_water_survey` (`survey_id`),
  CONSTRAINT `fk_water_survey` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`survey_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 104 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: accomplished_by
# ------------------------------------------------------------

INSERT INTO
  `accomplished_by` (`accomplished_by_id`, `pwd_id`, `person_id`, `role`)
VALUES
  (7, NULL, 52, 'applicant');
INSERT INTO
  `accomplished_by` (`accomplished_by_id`, `pwd_id`, `person_id`, `role`)
VALUES
  (8, NULL, 60, 'applicant');
INSERT INTO
  `accomplished_by` (`accomplished_by_id`, `pwd_id`, `person_id`, `role`)
VALUES
  (19, '02-0902-000-0000001', 148, 'applicant');
INSERT INTO
  `accomplished_by` (`accomplished_by_id`, `pwd_id`, `person_id`, `role`)
VALUES
  (24, '02-0902-000-0000002', 188, 'applicant');

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: activity_log
# ------------------------------------------------------------

INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    1,
    'ADMIN-001',
    'Created User I Love',
    '2025-12-13 20:37:11'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    2,
    'ADMIN-001',
    'Created User Ruther Frith',
    '2025-12-14 12:29:11'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    3,
    'ADMIN-001',
    'Generated 5 users',
    '2025-12-14 20:02:59'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    4,
    'ADMIN-001',
    'Generated 10 users',
    '2025-12-14 20:24:52'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    5,
    'ADMIN-001',
    'Deleted user',
    '2025-12-14 20:28:09'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    6,
    'ADMIN-001',
    'Deleted user',
    '2025-12-14 20:28:09'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    7,
    'ADMIN-001',
    'Deleted user',
    '2025-12-14 20:28:09'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    8,
    'ADMIN-001',
    'Deleted user',
    '2025-12-14 20:28:09'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    9,
    'ADMIN-001',
    'Deleted user',
    '2025-12-14 20:28:09'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    10,
    'ADMIN-001',
    'Generated 5 users',
    '2025-12-15 12:51:21'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    11,
    'ADMIN-001',
    'Created post titled \"My PSA Birth Certificate\"',
    '2025-12-18 16:38:33'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    12,
    'ADMIN-001',
    'Created post titled \"GIT Cheatsheet Screenshot\"',
    '2025-12-18 16:45:43'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    13,
    'ADMIN-001',
    'Updated post titled \"My Updated PSA Birth Certificate \"',
    '2025-12-18 16:49:42'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    14,
    'ADMIN-001',
    'Deleted post titled \"GIT Cheatsheet Screenshot\"',
    '2025-12-18 16:50:21'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    15,
    'ADMIN-001',
    'Delete user UID-1225-0001',
    '2025-12-19 15:24:36'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    16,
    'ADMIN-001',
    'Delete user UID-1225-0002',
    '2025-12-19 15:24:36'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    17,
    'ADMIN-001',
    'Delete user UID-1225-0003',
    '2025-12-19 15:24:36'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    18,
    'ADMIN-001',
    'Delete user UID-1225-0004',
    '2025-12-19 15:24:36'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    19,
    'ADMIN-001',
    'Delete user UID-1225-0005',
    '2025-12-19 15:24:36'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    20,
    'ADMIN-001',
    'Generated 5 users',
    '2025-12-19 15:24:56'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    21,
    'ADMIN-001',
    'Delete user UID-1225-0002',
    '2025-12-25 18:11:44'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    22,
    'ADMIN-001',
    'Delete user UID-1225-0004',
    '2025-12-25 18:11:44'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    23,
    'ADMIN-001',
    'Delete user UID-1225-0003',
    '2025-12-25 18:11:44'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    24,
    'ADMIN-001',
    'Delete user UID-1225-0001',
    '2025-12-25 18:11:44'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    25,
    'ADMIN-001',
    'Delete user UID-1225-0005',
    '2025-12-25 18:11:45'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    26,
    'ADMIN-001',
    'Created post titled \"Git Cheat Sheet\"',
    '2025-12-26 15:14:09'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    27,
    'ADMIN-001',
    'Updated post titled \"Updated Git Cheat Sheet\"',
    '2025-12-26 15:38:25'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    28,
    'ADMIN-001',
    'Created survey #SID-0126-0001',
    '2026-01-02 22:49:17'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    29,
    'ADMIN-001',
    'Created survey #SID-0126-0002',
    '2026-01-04 19:16:26'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    30,
    'ADMIN-001',
    'Created survey #SID-0126-0003',
    '2026-01-05 18:53:11'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    31,
    'ADMIN-001',
    'Created survey #SID-0126-0004',
    '2026-01-05 20:43:01'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    32,
    'ADMIN-001',
    'Created survey #SID-0126-0005',
    '2026-01-05 20:44:22'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    33,
    'ADMIN-001',
    'Created survey #SID-0126-0006',
    '2026-01-05 20:52:33'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    34,
    'ADMIN-001',
    'Created survey #SID-0126-0007',
    '2026-01-05 20:53:04'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    35,
    'ADMIN-001',
    'Created survey #SID-0126-0008',
    '2026-01-05 20:55:02'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    36,
    'ADMIN-001',
    'Created survey #SID-0126-0001',
    '2026-01-06 06:57:31'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    37,
    'ADMIN-001',
    'Deleted survey #SID-0126-0001',
    '2026-01-06 08:11:22'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    38,
    'ADMIN-001',
    'Created survey #SID-0126-0001',
    '2026-01-06 09:27:09'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    39,
    'ADMIN-001',
    'Created survey #SID-0126-0002',
    '2026-01-06 09:47:51'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    40,
    'ADMIN-001',
    'Created survey #SID-0126-0003',
    '2026-01-06 09:48:27'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    41,
    'ADMIN-001',
    'Created survey #SID-0126-0001',
    '2026-01-06 09:55:43'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    42,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-08 15:24:07'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    43,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-08 15:30:03'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    44,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-08 16:30:14'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    45,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-08 18:29:23'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    46,
    'ADMIN-001',
    'Created survey #SID-0126-0001',
    '2026-01-08 18:47:06'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    47,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-08 18:59:35'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    48,
    'ADMIN-001',
    'Created survey #SID-0126-0001',
    '2026-01-08 19:36:07'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    49,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-08 19:38:15'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    50,
    'ADMIN-001',
    'Created survey #SID-0126-0002',
    '2026-01-08 19:48:05'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    51,
    'ADMIN-001',
    'Deleted survey #SID-0126-0002',
    '2026-01-08 19:52:24'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    52,
    'ADMIN-001',
    'Deleted survey #SID-0126-0001',
    '2026-01-08 19:53:45'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    53,
    'ADMIN-001',
    'Created survey #SID-0126-0001',
    '2026-01-08 20:00:50'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    54,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-08 21:38:38'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    55,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-08 21:43:47'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    56,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-08 21:46:07'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    57,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-08 21:51:59'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    58,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-08 21:52:50'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    59,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-08 22:01:17'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    60,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-08 22:06:55'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    61,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-08 22:08:12'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    62,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-08 22:08:53'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    63,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-09 07:55:43'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    64,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-09 07:58:20'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    65,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-09 10:21:19'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    66,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-09 10:22:12'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    67,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-09 12:08:07'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    68,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-09 12:09:58'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    69,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-09 12:29:35'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    70,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-09 12:31:06'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    71,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-09 13:00:28'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    72,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-09 13:05:03'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    73,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-09 13:10:56'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    74,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-09 13:12:27'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    75,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-09 13:15:13'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    76,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-09 13:16:30'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    77,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-09 13:21:37'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    78,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-09 14:53:07'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    79,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-09 15:03:58'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    80,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-09 15:08:45'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    81,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-09 15:14:43'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    82,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-09 15:25:30'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    83,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-09 15:25:50'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    84,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-09 16:15:10'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    85,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-09 16:16:22'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    86,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-09 16:29:37'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    87,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-09 16:31:25'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    88,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-09 16:54:43'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    89,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-09 16:57:12'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    90,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-09 16:57:33'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    91,
    'ADMIN-001',
    'Generated 5 users',
    '2026-01-09 18:44:43'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    92,
    'ADMIN-001',
    'Created survey #SID-0126-0002',
    '2026-01-10 15:53:37'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    93,
    'ADMIN-001',
    'Created survey #SID-0126-0003',
    '2026-01-10 16:08:45'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    94,
    'ADMIN-001',
    'Deleted survey #SID-0126-0002',
    '2026-01-10 16:09:41'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    95,
    'ADMIN-001',
    'Created survey #SID-0126-0004',
    '2026-01-10 16:41:03'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    96,
    'ADMIN-001',
    'Updated survey #SID-0126-0003',
    '2026-01-10 16:52:15'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    97,
    'ADMIN-001',
    'Updated survey #SID-0126-0003',
    '2026-01-10 16:52:52'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    98,
    'ADMIN-001',
    'Updated survey #SID-0126-0003',
    '2026-01-10 16:55:03'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    99,
    'ADMIN-001',
    'Updated survey #SID-0126-0003',
    '2026-01-10 17:27:34'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    100,
    'ADMIN-001',
    'Updated survey #SID-0126-0003',
    '2026-01-10 17:29:31'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    101,
    'ADMIN-001',
    'Created PWD ID Application #PWD-0126-0005',
    '2026-01-12 15:32:35'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    102,
    'ADMIN-001',
    'Created PWD ID Application #PWD-0126-0006',
    '2026-01-12 15:42:34'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    103,
    'ADMIN-001',
    'Created PWD ID Application #PWD-0126-0007',
    '2026-01-12 15:48:58'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    104,
    'ADMIN-001',
    'Created Solo Parent ID Application #SP-0126-0009',
    '2026-01-13 11:26:02'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    105,
    'ADMIN-001',
    'Created Solo Parent ID Application #SC-0126-0010',
    '2026-01-13 14:26:25'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    106,
    'ADMIN-001',
    'Updated survey #undefined',
    '2026-01-13 16:34:24'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    107,
    'ADMIN-001',
    'Updated survey #undefined',
    '2026-01-13 16:40:06'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    108,
    'ADMIN-001',
    'Updated survey #undefined',
    '2026-01-13 16:43:44'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    109,
    'ADMIN-001',
    'Updated survey #undefined',
    '2026-01-13 16:51:20'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    110,
    'ADMIN-001',
    'Deleted PWD ID Application #PWD-0126-0007',
    '2026-01-13 17:05:43'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    111,
    'ADMIN-001',
    'Delete user UID-0126-0002',
    '2026-01-14 08:24:37'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    112,
    'ADMIN-001',
    'Delete user UID-0126-0001',
    '2026-01-14 08:24:37'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    113,
    'ADMIN-001',
    'Delete user UID-0126-0003',
    '2026-01-14 08:24:37'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    114,
    'ADMIN-001',
    'Delete user UID-0126-0004',
    '2026-01-14 08:24:37'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    115,
    'ADMIN-001',
    'Delete user UID-0126-0005',
    '2026-01-14 08:24:37'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    116,
    'ADMIN-001',
    'Created user Klyden Malupa',
    '2026-01-14 08:32:27'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    117,
    'ADMIN-001',
    'Created PWD ID Application #PWD-0126-0007',
    '2026-01-14 08:39:33'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    118,
    'ADMIN-001',
    'Created user Kester Malupa',
    '2026-01-14 08:43:20'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    119,
    'ADMIN-001',
    'Delete user UID-0126-0002',
    '2026-01-14 09:06:56'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    120,
    'ADMIN-001',
    'Created user Kester Malupa',
    '2026-01-14 09:07:21'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    121,
    'ADMIN-001',
    'Created survey #SID-0126-0005',
    '2026-01-14 09:44:47'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    122,
    'ADMIN-001',
    'Deleted Solo Parent ID Application #SP-0126-0008',
    '2026-01-14 10:10:46'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    123,
    'ADMIN-001',
    'Updated Solo Parent ID Application #SP-0126-0009',
    '2026-01-14 10:26:11'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    124,
    'ADMIN-001',
    'Updated Solo Parent ID Application #SP-0126-0009',
    '2026-01-14 10:34:49'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    125,
    'ADMIN-001',
    'Updated Solo Parent ID Application #SP-0126-0009',
    '2026-01-14 10:39:17'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    126,
    'ADMIN-001',
    'Updated Solo Parent ID Application #SP-0126-0009',
    '2026-01-14 10:49:52'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    127,
    'ADMIN-001',
    'Updated Solo Parent ID Application #SP-0126-0009',
    '2026-01-14 10:51:14'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    128,
    'ADMIN-001',
    'Deleted Solo Parent ID Application #SP-0126-0009',
    '2026-01-14 10:51:31'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    129,
    'ADMIN-001',
    'Updated Solo Parent ID Application #SC-0126-0010',
    '2026-01-14 11:32:34'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    130,
    'ADMIN-001',
    'Updated Solo Parent ID Application #SC-0126-0010',
    '2026-01-14 11:34:10'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    131,
    'ADMIN-001',
    'Deleted Solo Parent ID Application #SC-0126-0010',
    '2026-01-14 11:36:03'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    132,
    'ADMIN-001',
    'Created hazard area //',
    '2026-01-14 13:38:46'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    133,
    'ADMIN-001',
    'Created Solo Parent ID Application #SP-0126-0001',
    '2026-01-15 10:25:18'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    134,
    'ADMIN-001',
    'Created survey #SID-0126-0006',
    '2026-01-15 11:57:16'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    135,
    'ADMIN-001',
    'Created survey #SID-0126-0007',
    '2026-01-15 14:09:57'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    136,
    'ADMIN-001',
    'Deleted survey #SID-0126-0004',
    '2026-01-15 15:24:11'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    137,
    'ADMIN-001',
    'Deleted survey #SID-0126-0003',
    '2026-01-15 15:24:11'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    138,
    'ADMIN-001',
    'Deleted survey #SID-0126-0007',
    '2026-01-15 15:24:11'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    139,
    'ADMIN-001',
    'Deleted survey #SID-0126-0001',
    '2026-01-15 15:24:11'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    140,
    'ADMIN-001',
    'Deleted survey #SID-0126-0005',
    '2026-01-15 15:24:14'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    141,
    'ADMIN-001',
    'Deleted survey #SID-0126-0006',
    '2026-01-15 15:25:47'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    142,
    'ADMIN-001',
    'Deleted Solo Parent ID Application #SP-0126-0001',
    '2026-01-15 15:27:25'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    143,
    'ADMIN-001',
    'Deleted PWD ID Application #PWD-0126-0007',
    '2026-01-15 15:27:29'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    144,
    'ADMIN-001',
    'Deleted post titled \"Updated Git Cheat Sheet\"',
    '2026-01-15 15:44:01'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    145,
    'ADMIN-001',
    'Deleted post titled \"My Updated PSA Birth Certificate \"',
    '2026-01-15 15:44:01'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    146,
    'ADMIN-001',
    'Created survey #SID-0126-0001',
    '2026-01-16 11:21:17'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    147,
    'ADMIN-001',
    'Deleted survey #SID-0126-0001',
    '2026-01-16 14:47:42'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    148,
    'ADMIN-001',
    'Created survey #SID-0126-0001',
    '2026-01-16 15:34:03'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    149,
    'ADMIN-001',
    'Created survey #SID-0126-0002',
    '2026-01-16 15:45:46'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    150,
    'ADMIN-001',
    'Deleted survey #SID-0126-0002',
    '2026-01-16 15:46:28'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    151,
    'ADMIN-001',
    'Created survey #SID-0126-0002',
    '2026-01-16 15:52:36'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    152,
    'ADMIN-001',
    'Created survey #SID-0126-0003',
    '2026-01-17 09:34:28'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    153,
    'ADMIN-001',
    'Created survey #SID-0126-0004',
    '2026-01-17 09:46:36'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    154,
    'ADMIN-001',
    'Deleted survey #SID-0126-0004',
    '2026-01-17 10:37:18'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    155,
    'ADMIN-001',
    'Created survey #SID-0126-0004',
    '2026-01-17 15:11:34'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    156,
    'ADMIN-001',
    'Created survey #SID-0126-0005',
    '2026-01-17 17:44:34'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    157,
    'ADMIN-001',
    'Created survey #SID-0126-0006',
    '2026-01-18 18:42:01'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    158,
    'ADMIN-001',
    'Created survey #SID-0126-0007',
    '2026-01-19 09:15:34'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    159,
    'ADMIN-001',
    'Deleted survey #SID-0126-0006',
    '2026-01-19 10:11:39'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    160,
    'ADMIN-001',
    'Deleted survey #SID-0126-0004',
    '2026-01-19 10:11:39'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    161,
    'ADMIN-001',
    'Deleted survey #SID-0126-0005',
    '2026-01-19 10:11:39'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    162,
    'ADMIN-001',
    'Deleted survey #SID-0126-0001',
    '2026-01-19 10:11:41'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    163,
    'ADMIN-001',
    'Deleted survey #SID-0126-0007',
    '2026-01-19 10:11:41'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    164,
    'UID-0126-0002',
    'Created survey #SID-0126-0001',
    '2026-01-19 10:21:37'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    165,
    'ADMIN-001',
    'Created user Angge Guimbs',
    '2026-01-19 10:32:46'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    166,
    'ADMIN-001',
    'Deleted user UID-0126-0003',
    '2026-01-19 10:39:16'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    167,
    'ADMIN-001',
    'Deleted user UID-0126-0001',
    '2026-01-19 10:39:16'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    168,
    'ADMIN-001',
    'Created survey #SID-0126-0002',
    '2026-01-19 11:07:43'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    169,
    'ADMIN-001',
    'Updated survey #SID-0126-0002',
    '2026-01-19 12:00:30'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    170,
    'UID-0126-0002',
    'Created survey #SID-0126-0003',
    '2026-01-19 12:06:17'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    171,
    'ADMIN-001',
    'Updated survey #SID-0126-0002',
    '2026-01-19 13:20:06'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    172,
    'ADMIN-001',
    'Updated survey #SID-0126-0003',
    '2026-01-19 13:21:29'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    173,
    'ADMIN-001',
    'Created user Angge Guimbs',
    '2026-01-19 13:24:29'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    174,
    'UID-0126-0003',
    'Updated survey #SID-0126-0001',
    '2026-01-19 13:29:34'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    175,
    'UID-0126-0002',
    'Created survey #SID-0126-0004',
    '2026-01-19 14:41:58'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    176,
    'UID-0126-0002',
    'Created survey #SID-0126-0005',
    '2026-01-19 16:15:33'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    177,
    'ADMIN-001',
    'Created post titled \"gohmasd\"',
    '2026-01-20 10:28:15'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    178,
    'ADMIN-001',
    'Created user Jin Kazama',
    '2026-01-22 14:39:37'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    179,
    'ADMIN-001',
    'Deleted hazard area //',
    '2026-01-22 20:04:15'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    180,
    'ADMIN-001',
    'Created hazard area //',
    '2026-01-22 20:04:22'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    181,
    'ADMIN-001',
    'Created hazard area //',
    '2026-01-22 20:04:29'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    182,
    'ADMIN-001',
    'Created hazard area //',
    '2026-01-22 20:04:31'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    183,
    'ADMIN-001',
    'Created hazard area //',
    '2026-01-22 20:04:36'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    184,
    'ADMIN-001',
    'Created hazard area //',
    '2026-01-22 20:04:51'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    185,
    'ADMIN-001',
    'Created hazard area //',
    '2026-01-22 20:04:52'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    186,
    'ADMIN-001',
    'Created hazard area //',
    '2026-01-22 20:04:52'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    187,
    'ADMIN-001',
    'Created hazard area //',
    '2026-01-22 20:04:52'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    188,
    'ADMIN-001',
    'Created hazard area //',
    '2026-01-22 20:04:53'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    189,
    'ADMIN-001',
    'Created hazard area //',
    '2026-01-22 20:04:53'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    190,
    'ADMIN-001',
    'Created hazard area //',
    '2026-01-22 20:04:54'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    191,
    'ADMIN-001',
    'Created hazard area //',
    '2026-01-22 20:04:54'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    192,
    'ADMIN-001',
    'Created hazard area //',
    '2026-01-22 20:04:55'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    193,
    'ADMIN-001',
    'Created hazard area //',
    '2026-01-22 20:04:55'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    194,
    'ADMIN-001',
    'Created hazard area //',
    '2026-01-22 20:12:09'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    195,
    'ADMIN-001',
    'Created hazard area //',
    '2026-01-22 20:13:08'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    196,
    'ADMIN-001',
    'Created hazard area //',
    '2026-01-22 20:14:35'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    197,
    'ADMIN-001',
    'Updated hazard area //',
    '2026-01-22 20:17:43'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    198,
    'ADMIN-001',
    'Created hazard area //',
    '2026-01-22 20:17:48'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    199,
    'ADMIN-001',
    'Updated hazard area //',
    '2026-01-22 20:17:49'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    200,
    'ADMIN-001',
    'Created hazard area //',
    '2026-01-22 20:34:26'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    201,
    'ADMIN-001',
    'Updated hazard area //',
    '2026-01-22 20:34:38'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    202,
    'ADMIN-001',
    'Created hazard area //',
    '2026-01-22 20:34:42'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    203,
    'ADMIN-001',
    'Updated hazard area //',
    '2026-01-22 20:34:47'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    204,
    'ADMIN-001',
    'Created hazard area //',
    '2026-01-22 20:38:00'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    205,
    'ADMIN-001',
    'Created hazard area //',
    '2026-01-22 20:38:03'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    206,
    'ADMIN-001',
    'Deleted hazard area //',
    '2026-01-22 20:38:08'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    207,
    'ADMIN-001',
    'Deleted hazard area //',
    '2026-01-22 20:38:11'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    208,
    'ADMIN-001',
    'Updated user undefined',
    '2026-01-22 21:05:54'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    209,
    'ADMIN-001',
    'Updated user undefined',
    '2026-01-22 21:05:54'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    210,
    'ADMIN-001',
    'Updated user undefined',
    '2026-01-22 21:05:54'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    211,
    'ADMIN-001',
    'Updated user undefined',
    '2026-01-22 21:05:54'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    212,
    'ADMIN-001',
    'Updated user undefined',
    '2026-01-22 21:05:54'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    213,
    'ADMIN-001',
    'Updated survey #SID-0126-0002',
    '2026-01-25 13:11:30'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    214,
    'ADMIN-001',
    'Created survey #SID-0126-0006',
    '2026-01-25 15:09:58'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    215,
    'ADMIN-001',
    'Deleted survey #SID-0126-0001',
    '2026-01-25 16:35:18'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    216,
    'ADMIN-001',
    'Deleted survey #SID-0126-0002',
    '2026-01-25 16:35:22'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    217,
    'ADMIN-001',
    'Deleted survey #SID-0126-0003',
    '2026-01-25 16:35:26'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    218,
    'ADMIN-001',
    'Deleted survey #SID-0126-0004',
    '2026-01-25 16:35:29'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    219,
    'ADMIN-001',
    'Deleted survey #SID-0126-0005',
    '2026-01-25 16:35:32'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    220,
    'ADMIN-001',
    'Created survey #SID-0126-0001',
    '2026-01-25 17:44:42'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    221,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-25 18:21:31'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    222,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-25 18:51:29'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    223,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-25 19:05:35'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    224,
    'ADMIN-001',
    'Created survey #SID-0126-0002',
    '2026-01-25 19:30:30'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    225,
    'ADMIN-001',
    'Created survey #SID-0126-0003',
    '2026-01-27 11:50:11'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    226,
    'ADMIN-001',
    'Deleted survey #SID-0126-0003',
    '2026-01-27 11:57:02'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    227,
    'ADMIN-001',
    'Created survey #SID-0126-0003',
    '2026-01-28 09:55:33'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    228,
    'ADMIN-001',
    'Deleted survey #SID-0126-0003',
    '2026-01-28 09:57:56'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    229,
    'ADMIN-001',
    'Created survey #SID-0126-0003',
    '2026-01-28 10:18:25'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    230,
    'ADMIN-001',
    'Created survey #SID-0126-0004',
    '2026-01-28 10:41:29'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    231,
    'ADMIN-001',
    'Created survey #SID-0126-0005',
    '2026-01-28 11:38:39'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    232,
    'ADMIN-001',
    'Updated user ADMIN-001',
    '2026-01-29 13:36:26'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    233,
    'ADMIN-001',
    'Deleted survey #SID-0126-0005',
    '2026-01-29 15:00:31'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    234,
    'ADMIN-001',
    'Updated survey #SID-0126-0003',
    '2026-01-29 16:20:22'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    235,
    'ADMIN-001',
    'Updated survey #SID-0126-0003',
    '2026-01-29 17:20:07'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    236,
    'ADMIN-001',
    'Created survey #SID-0126-0005',
    '2026-01-29 17:26:53'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    237,
    'ADMIN-001',
    'Created survey #SID-0126-0006',
    '2026-01-30 08:35:01'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    238,
    'ADMIN-001',
    'Created survey #SID-0126-0007',
    '2026-01-30 08:41:40'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    239,
    'ADMIN-001',
    'Created survey #SID-0126-0008',
    '2026-01-30 08:46:46'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    240,
    'ADMIN-001',
    'Created survey #SID-0126-0009',
    '2026-01-30 08:47:03'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    241,
    'ADMIN-001',
    'Created survey #SID-0126-0010',
    '2026-01-30 08:49:57'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    242,
    'ADMIN-001',
    'Deleted survey #SID-0126-0007',
    '2026-01-30 08:50:23'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    243,
    'ADMIN-001',
    'Deleted survey #SID-0126-0006',
    '2026-01-30 08:50:23'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    244,
    'ADMIN-001',
    'Deleted survey #SID-0126-0010',
    '2026-01-30 08:50:23'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    245,
    'ADMIN-001',
    'Deleted survey #SID-0126-0009',
    '2026-01-30 08:50:23'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    246,
    'ADMIN-001',
    'Deleted survey #SID-0126-0008',
    '2026-01-30 08:50:24'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    247,
    'ADMIN-001',
    'Created survey #SID-0126-0006',
    '2026-01-30 08:51:07'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    248,
    'ADMIN-001',
    'Deleted survey #SID-0126-0006',
    '2026-01-30 08:51:26'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    249,
    'ADMIN-001',
    'Created survey #SID-0126-0006',
    '2026-01-30 08:55:07'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    250,
    'ADMIN-001',
    'Updated survey #SID-0126-0006',
    '2026-01-30 09:13:51'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    251,
    'ADMIN-001',
    'Updated survey #SID-0126-0004',
    '2026-01-30 09:36:27'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    252,
    'ADMIN-001',
    'Deleted survey #SID-0126-0006',
    '2026-01-30 09:37:18'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    253,
    'ADMIN-001',
    'Deleted survey #SID-0126-0004',
    '2026-01-30 09:37:18'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    254,
    'ADMIN-001',
    'Created survey #SID-0126-0006',
    '2026-01-30 11:09:18'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    255,
    'ADMIN-001',
    'Deleted survey #SID-0126-0005',
    '2026-01-30 11:17:30'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    256,
    'ADMIN-001',
    'Deleted survey #SID-0126-0006',
    '2026-01-30 11:17:33'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    257,
    'ADMIN-001',
    'Created survey #SID-0126-0003',
    '2026-01-30 11:18:50'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    258,
    'ADMIN-001',
    'Created survey #SID-0126-0004',
    '2026-01-30 11:20:21'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    259,
    'ADMIN-001',
    'Deleted survey #SID-0126-0003',
    '2026-01-30 11:27:04'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    260,
    'ADMIN-001',
    'Deleted survey #SID-0126-0004',
    '2026-01-30 11:27:07'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    261,
    'ADMIN-001',
    'Created survey #SID-0126-0003',
    '2026-01-30 11:34:24'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    262,
    'ADMIN-001',
    'Created survey #SID-0126-0004',
    '2026-01-30 11:36:07'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    263,
    'ADMIN-001',
    'Updated survey #SID-0126-0003',
    '2026-01-30 11:58:37'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    264,
    'ADMIN-001',
    'Deleted survey #SID-0126-0003',
    '2026-01-30 11:59:10'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    265,
    'ADMIN-001',
    'Created survey #SID-0126-0005',
    '2026-01-30 12:00:31'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    266,
    'ADMIN-001',
    'Updated survey #SID-0126-0005',
    '2026-01-30 12:01:56'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    267,
    'ADMIN-001',
    'Deleted survey #SID-0126-0004',
    '2026-01-30 12:57:31'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    268,
    'ADMIN-001',
    'Deleted survey #SID-0126-0001',
    '2026-01-30 12:57:31'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    269,
    'ADMIN-001',
    'Deleted survey #SID-0126-0002',
    '2026-01-30 12:57:31'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    270,
    'ADMIN-001',
    'Deleted survey #SID-0126-0005',
    '2026-01-30 12:57:31'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    271,
    'ADMIN-001',
    'Deleted survey #SID-0126-0005',
    '2026-01-30 12:57:31'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    272,
    'ADMIN-001',
    'Created survey #SID-0126-0001',
    '2026-01-30 13:40:38'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    273,
    'ADMIN-001',
    'Deleted survey #SID-0126-0001',
    '2026-01-30 13:44:27'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    274,
    'ADMIN-001',
    'Created survey #SID-0126-0001',
    '2026-01-30 13:45:31'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    275,
    'ADMIN-001',
    'Deleted survey #SID-0126-0001',
    '2026-01-30 13:45:47'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    276,
    'ADMIN-001',
    'Created survey #SID-0126-0001',
    '2026-01-30 13:49:41'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    277,
    'ADMIN-001',
    'Created survey #SID-0126-0002',
    '2026-01-30 13:51:33'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    278,
    'ADMIN-001',
    'Updated survey #SID-0126-0002',
    '2026-01-30 13:52:16'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    279,
    'ADMIN-001',
    'Deleted survey #SID-0126-0002',
    '2026-01-30 13:55:30'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    280,
    'ADMIN-001',
    'Deleted survey #SID-0126-0001',
    '2026-01-30 13:55:57'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    281,
    'ADMIN-001',
    'Created survey #SID-0126-0001',
    '2026-01-30 14:08:03'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    282,
    'ADMIN-001',
    'Created survey #SID-0126-0002',
    '2026-01-30 14:09:26'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    283,
    'ADMIN-001',
    'Deleted survey #SID-0126-0002',
    '2026-01-30 14:24:35'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    284,
    'ADMIN-001',
    'Deleted survey #SID-0126-0002',
    '2026-01-30 14:24:35'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    285,
    'ADMIN-001',
    'Deleted survey #SID-0126-0001',
    '2026-01-30 14:24:35'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    286,
    'ADMIN-001',
    'Created survey #SID-0126-0001',
    '2026-01-30 14:32:37'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    287,
    'ADMIN-001',
    'Created survey #SID-0126-0002',
    '2026-01-30 14:45:47'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    288,
    'ADMIN-001',
    'Deleted survey #SID-0126-0001',
    '2026-01-30 16:20:58'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    289,
    'ADMIN-001',
    'Deleted survey #SID-0126-0002',
    '2026-01-30 16:21:00'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    290,
    'ADMIN-001',
    'Created survey #SID-0126-0001',
    '2026-01-30 16:23:18'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    291,
    'ADMIN-001',
    'Created survey #SID-0126-0002',
    '2026-01-30 16:24:15'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    292,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-30 16:25:03'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    293,
    'ADMIN-001',
    'Created survey #SID-0126-0003',
    '2026-01-30 16:32:10'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    294,
    'ADMIN-001',
    'Created survey #SID-0126-0004',
    '2026-01-30 16:33:17'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    295,
    'ADMIN-001',
    'Deleted survey #SID-0126-0001',
    '2026-01-30 16:48:06'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    296,
    'ADMIN-001',
    'Deleted survey #SID-0126-0002',
    '2026-01-30 16:48:06'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    297,
    'ADMIN-001',
    'Deleted survey #SID-0126-0004',
    '2026-01-30 16:48:06'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    298,
    'ADMIN-001',
    'Deleted survey #SID-0126-0003',
    '2026-01-30 16:48:07'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    299,
    'ADMIN-001',
    'Created survey #SID-0126-0001',
    '2026-01-30 16:50:04'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    300,
    'ADMIN-001',
    'Created survey #SID-0126-0002',
    '2026-01-30 16:50:56'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    301,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-30 21:06:17'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    302,
    'ADMIN-001',
    'Created survey #SID-0126-0003',
    '2026-01-30 21:13:23'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    303,
    'ADMIN-001',
    'Created survey #SID-0126-0004',
    '2026-01-30 21:31:18'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    304,
    'ADMIN-001',
    'Updated survey #SID-0126-0004',
    '2026-01-30 21:31:40'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    305,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-31 12:15:19'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    306,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-31 13:17:17'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    307,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-31 13:24:13'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    308,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-31 16:20:17'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    309,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-31 16:23:56'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    310,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-31 16:51:34'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    311,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-31 20:12:18'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    312,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-01-31 20:15:54'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    313,
    'ADMIN-001',
    'Created survey #SID-0226-0001',
    '2026-02-01 11:45:58'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    314,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-02-02 13:57:15'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    315,
    'ADMIN-001',
    'Updated survey #SID-0126-0001',
    '2026-02-02 14:02:20'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    317,
    'ADMIN-001',
    'Updated Family Class #FID-0126-0002 to C',
    '2026-02-06 14:52:52'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    318,
    'ADMIN-001',
    'Updated Family Class #FID-0126-0002-B to D',
    '2026-02-06 14:55:59'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    319,
    'ADMIN-001',
    'Created survey #SID-0226-0002',
    '2026-02-06 15:53:17'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    320,
    'ADMIN-001',
    'Created PWD ID Application #PWD-0226-0001',
    '2026-02-06 15:54:44'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    321,
    'ADMIN-001',
    'Updated survey #undefined',
    '2026-02-06 16:03:44'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    322,
    'ADMIN-001',
    'Updated survey #undefined',
    '2026-02-06 16:05:06'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    323,
    'ADMIN-001',
    'Updated survey #SID-0226-0001',
    '2026-02-06 17:08:23'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    324,
    'ADMIN-001',
    'Updated survey #SID-0226-0001',
    '2026-02-06 17:08:59'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    325,
    'ADMIN-001',
    'Created Solo Parent ID Application #SC-0226-0001',
    '2026-02-07 10:04:06'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    326,
    'ADMIN-001',
    'Updated survey #SID-0126-0004',
    '2026-02-07 10:05:40'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    327,
    'ADMIN-001',
    'Updated survey #undefined',
    '2026-02-09 10:04:57'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    328,
    'ADMIN-001',
    'Updated survey #SID-0126-0003',
    '2026-02-09 11:11:02'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    329,
    'ADMIN-001',
    'Updated survey #SID-0126-0004',
    '2026-02-09 13:32:11'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    330,
    'ADMIN-001',
    'Created survey #SID-0226-0003',
    '2026-02-09 14:54:21'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    331,
    'ADMIN-001',
    'Updated survey #SID-0226-0003',
    '2026-02-09 15:11:09'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    332,
    'ADMIN-001',
    'Updated survey #SID-0226-0003',
    '2026-02-09 15:14:46'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    333,
    'ADMIN-001',
    'Created survey #SID-0226-0004',
    '2026-02-09 15:52:22'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    334,
    'ADMIN-001',
    'Updated survey #SID-0226-0004',
    '2026-02-09 16:19:35'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    335,
    'ADMIN-001',
    'Created PWD ID Application #PWD-0226-0002',
    '2026-02-10 10:02:53'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    336,
    'ADMIN-001',
    'Deleted PWD ID Application #PWD-0226-0002',
    '2026-02-10 10:14:14'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    337,
    'ADMIN-001',
    'Created PWD ID Application #02-0902-000-0000001',
    '2026-02-10 10:26:06'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    338,
    'ADMIN-001',
    'Deleted PWD ID Application #02-0902-000-0000001',
    '2026-02-10 11:31:42'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    339,
    'ADMIN-001',
    'Created PWD ID Application #02-0902-000-0000001',
    '2026-02-10 11:36:07'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    340,
    'ADMIN-001',
    'Updated survey #SID-0226-0003',
    '2026-02-10 16:26:20'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    341,
    'ADMIN-001',
    'Updated survey #SID-0226-0003',
    '2026-02-10 17:11:37'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    342,
    'ADMIN-001',
    'Updated survey #SID-0226-0003',
    '2026-02-10 17:15:10'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    343,
    'ADMIN-001',
    'Updated survey #SID-0226-0003',
    '2026-02-10 17:16:35'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    344,
    'ADMIN-001',
    'Updated survey #SID-0226-0003',
    '2026-02-10 17:17:53'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    345,
    'ADMIN-001',
    'Updated survey #SID-0226-0003',
    '2026-02-11 09:49:02'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    346,
    'ADMIN-001',
    'Ignored duplicate pair: RID-0226-0003-A-3 and RID-0226-0004-A-1',
    '2026-02-11 10:06:00'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    348,
    'ADMIN-001',
    'Updated survey #SID-0126-0003',
    '2026-02-11 17:12:46'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    349,
    'ADMIN-001',
    'Updated survey #SID-0126-0004',
    '2026-02-12 10:09:07'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    350,
    'ADMIN-001',
    'Created survey #undefined',
    '2026-02-12 17:18:51'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    351,
    'ADMIN-001',
    'Updated survey #undefined',
    '2026-02-13 14:56:51'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    352,
    'ADMIN-001',
    'Deleted survey #SID-0226-0002',
    '2026-02-13 14:58:50'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    353,
    'ADMIN-001',
    'Deleted survey #SID-0226-0001',
    '2026-02-13 14:58:50'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    354,
    'ADMIN-001',
    'Deleted survey #SID-0226-0005',
    '2026-02-13 14:58:50'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    355,
    'ADMIN-001',
    'Deleted survey #SID-0226-0003',
    '2026-02-13 14:58:50'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    356,
    'ADMIN-001',
    'Deleted survey #SID-0126-0001',
    '2026-02-13 14:58:50'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    357,
    'ADMIN-001',
    'Deleted survey #SID-0126-0003',
    '2026-02-13 14:58:50'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    358,
    'ADMIN-001',
    'Deleted survey #SID-0126-0004',
    '2026-02-13 14:58:50'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    359,
    'ADMIN-001',
    'Deleted survey #SID-0226-0004',
    '2026-02-13 14:58:52'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    360,
    'ADMIN-001',
    'Deleted survey #SID-0126-0002',
    '2026-02-13 14:58:53'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    361,
    'ADMIN-001',
    'Created survey #undefined',
    '2026-02-13 15:50:59'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    362,
    'ADMIN-001',
    'Created PWD ID Application #02-0902-000-0000001',
    '2026-02-15 15:12:58'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    363,
    'ADMIN-001',
    'Created survey #undefined',
    '2026-02-16 11:07:42'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    364,
    'ADMIN-001',
    'Created user Baelor Targaryen',
    '2026-02-17 08:54:27'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    365,
    'ADMIN-001',
    'Deleted user UID-0226-0001',
    '2026-02-17 13:53:58'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    366,
    'ADMIN-001',
    'Created user Baelor Targaryen',
    '2026-02-17 13:54:26'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    367,
    'ADMIN-001',
    'Created Solo Parent ID Application #SP-0226-0001',
    '2026-02-17 16:45:32'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    368,
    'ADMIN-001',
    'Deleted Solo Parent ID Application #SP-0226-0001',
    '2026-02-18 10:47:28'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    370,
    'ADMIN-001',
    'Created Solo Parent ID Application #undefined',
    '2026-02-18 10:53:52'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    371,
    'ADMIN-001',
    'Created Solo Parent ID Application #SP-0226-0001',
    '2026-02-18 11:59:10'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    372,
    'ADMIN-001',
    'Created survey #SID-0226-0003',
    '2026-02-18 13:09:04'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    373,
    'ADMIN-001',
    'Deleted PWD ID Application #02-0902-000-0000001',
    '2026-02-18 15:32:54'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    374,
    'ADMIN-001',
    'Created PWD ID Application #02-0902-000-0000001',
    '2026-02-18 15:53:19'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    375,
    'ADMIN-001',
    'Deleted PWD ID Application #02-0902-000-0000001',
    '2026-02-18 16:16:58'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    376,
    'ADMIN-001',
    'Created PWD ID Application #02-0902-000-0000001',
    '2026-02-18 16:23:34'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    377,
    'ADMIN-001',
    'Deleted PWD ID Application #02-0902-000-0000001',
    '2026-02-18 16:47:56'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    378,
    'ADMIN-001',
    'Created PWD ID Application #02-0902-000-0000001',
    '2026-02-18 16:50:50'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    379,
    'ADMIN-001',
    'Deleted PWD ID Application #02-0902-000-0000001',
    '2026-02-18 16:52:58'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    380,
    'ADMIN-001',
    'Created PWD ID Application #02-0902-000-0000001',
    '2026-02-18 17:00:16'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    381,
    'ADMIN-001',
    'Deleted PWD ID Application #02-0902-000-0000001',
    '2026-02-18 17:02:17'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    382,
    'ADMIN-001',
    'Created PWD ID Application #02-0902-000-0000001',
    '2026-02-18 20:41:27'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    383,
    'ADMIN-001',
    'Updated survey #undefined',
    '2026-02-19 10:51:04'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    384,
    'ADMIN-001',
    'Created PWD ID Application #02-0902-000-0000002',
    '2026-02-19 11:41:32'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    385,
    'ADMIN-001',
    'Deleted PWD ID Application #02-0902-000-0000002',
    '2026-02-19 11:42:03'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    386,
    'ADMIN-001',
    'Created PWD ID Application #02-0902-000-0000002',
    '2026-02-19 14:39:50'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    387,
    'ADMIN-001',
    'Updated survey #undefined',
    '2026-02-19 14:54:48'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    388,
    'ADMIN-001',
    'Deleted PWD ID Application #02-0902-000-0000002',
    '2026-02-19 15:09:33'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    389,
    'ADMIN-001',
    'Created PWD ID Application #02-0902-000-0000002',
    '2026-02-19 15:16:18'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    390,
    'ADMIN-001',
    'Deleted PWD ID Application #02-0902-000-0000002',
    '2026-02-19 15:18:56'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    391,
    'ADMIN-001',
    'Created PWD ID Application #02-0902-000-0000002',
    '2026-02-19 15:30:17'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    392,
    'ADMIN-001',
    'Updated survey #undefined',
    '2026-02-19 15:46:16'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    393,
    'ADMIN-001',
    'Deleted PWD ID Application #02-0902-000-0000002',
    '2026-02-19 15:46:28'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    394,
    'ADMIN-001',
    'Created Solo Parent ID Application #SP-0226-0002',
    '2026-02-19 20:31:41'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    395,
    'ADMIN-001',
    'Deleted Solo Parent ID Application #SP-0226-0002',
    '2026-02-20 08:22:16'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    396,
    'ADMIN-001',
    'Deleted Solo Parent ID Application #SP-0226-0001',
    '2026-02-20 08:22:16'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    397,
    'ADMIN-001',
    'Created Solo Parent ID Application #SP-0226-0001',
    '2026-02-20 10:18:41'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    398,
    'ADMIN-001',
    'Updated Solo Parent ID Application #SP-0226-0001',
    '2026-02-20 10:44:05'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    399,
    'ADMIN-001',
    'Updated Solo Parent ID Application #SP-0226-0001',
    '2026-02-20 11:14:27'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    400,
    'ADMIN-001',
    'Updated Solo Parent ID Application #SP-0226-0001',
    '2026-02-20 11:19:39'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    401,
    'ADMIN-001',
    'Created Solo Parent ID Application #SP-0226-0002',
    '2026-02-20 12:02:42'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    402,
    'ADMIN-001',
    'Deleted Solo Parent ID Application #SP-0226-0001',
    '2026-02-20 12:59:24'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    403,
    'ADMIN-001',
    'Deleted Solo Parent ID Application #SP-0226-0002',
    '2026-02-20 12:59:24'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    404,
    'ADMIN-001',
    'Created Solo Parent ID Application #SC-0226-0002',
    '2026-02-20 14:11:57'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    405,
    'ADMIN-001',
    'Deleted Solo Parent ID Application #SC-0226-0001',
    '2026-02-20 16:17:16'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    406,
    'ADMIN-001',
    'Deleted Solo Parent ID Application #SC-0226-0002',
    '2026-02-20 19:51:16'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    407,
    'ADMIN-001',
    'Created PWD ID Application #02-0902-000-0000002',
    '2026-02-20 20:29:53'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    408,
    'ADMIN-001',
    'Created Solo Parent ID Application #SP-0226-0001',
    '2026-02-20 20:31:43'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    409,
    'ADMIN-001',
    'Created Solo Parent ID Application #SC-0226-0001',
    '2026-02-21 07:28:37'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    410,
    'ADMIN-001',
    'Deleted Solo Parent ID Application #SP-0226-0001',
    '2026-02-21 07:29:20'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    411,
    'ADMIN-001',
    'Created survey #SID-0226-0004',
    '2026-02-23 14:55:37'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    412,
    'ADMIN-001',
    'Updated ID Generator Information',
    '2026-02-24 17:10:02'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    413,
    'ADMIN-001',
    'Printed Id',
    '2026-02-25 17:04:50'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    414,
    'ADMIN-001',
    'Created survey #SID-0226-0005',
    '2026-02-25 20:29:41'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    415,
    'ADMIN-001',
    'Updated survey #SID-0226-0005',
    '2026-02-25 20:43:02'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    416,
    'ADMIN-001',
    'Updated survey #SID-0226-0005',
    '2026-02-26 08:24:18'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    417,
    'ADMIN-001',
    'Printed Id',
    '2026-02-26 13:46:36'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    418,
    'ADMIN-001',
    'Updated survey #undefined',
    '2026-02-26 21:06:07'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    419,
    'ADMIN-001',
    'Updated survey #undefined',
    '2026-02-26 21:06:35'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    420,
    'ADMIN-001',
    'Updated survey #undefined',
    '2026-02-26 21:12:34'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    421,
    'ADMIN-001',
    'Updated survey #SID-0226-0005',
    '2026-02-26 21:17:56'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    422,
    'ADMIN-001',
    'Updated survey #SID-0226-0005',
    '2026-02-26 21:40:34'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    423,
    'ADMIN-001',
    'Updated survey #SID-0226-0001',
    '2026-03-01 18:07:48'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    424,
    'ADMIN-001',
    'Created survey #SID-0326-0001',
    '2026-03-01 18:15:18'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    425,
    'ADMIN-001',
    'Updated survey #SID-0226-0001',
    '2026-03-01 18:18:18'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    426,
    'ADMIN-001',
    'Updated survey #SID-0226-0001',
    '2026-03-01 18:19:38'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    427,
    'ADMIN-001',
    'Updated survey #SID-0226-0001',
    '2026-03-01 18:20:17'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    428,
    'ADMIN-001',
    'Updated survey #SID-0226-0001',
    '2026-03-01 18:22:55'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    429,
    'ADMIN-001',
    'Updated survey #SID-0326-0001',
    '2026-03-01 18:30:10'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    430,
    'ADMIN-001',
    'Updated survey #SID-0326-0001',
    '2026-03-01 18:31:28'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    431,
    'ADMIN-001',
    'Created survey #SID-0326-0002',
    '2026-03-01 20:41:01'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    432,
    'ADMIN-001',
    'Created survey #SID-0326-0003',
    '2026-03-01 20:41:09'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    433,
    'ADMIN-001',
    'Export Databank',
    '2026-03-06 11:32:23'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    434,
    'ADMIN-001',
    'Export Databank',
    '2026-03-06 16:10:11'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    435,
    'ADMIN-001',
    'Export Databank',
    '2026-03-06 16:53:30'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    436,
    'ADMIN-001',
    'Export Databank',
    '2026-03-06 16:59:45'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    437,
    'ADMIN-001',
    'Export Databank',
    '2026-03-06 17:07:37'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    438,
    'ADMIN-001',
    'Export Databank',
    '2026-03-06 17:09:50'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    439,
    'ADMIN-001',
    'Export Databank',
    '2026-03-06 21:20:13'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    440,
    'ADMIN-001',
    'Export Databank',
    '2026-03-06 21:23:56'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    441,
    'ADMIN-001',
    'Export Databank',
    '2026-03-06 21:24:13'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    442,
    'ADMIN-001',
    'Export Databank',
    '2026-03-06 21:25:11'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    443,
    'ADMIN-001',
    'Export Databank',
    '2026-03-06 21:29:47'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    444,
    'ADMIN-001',
    'Export Databank',
    '2026-03-07 07:43:04'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    445,
    'ADMIN-001',
    'Export Databank',
    '2026-03-07 07:45:23'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    446,
    'ADMIN-001',
    'Export Databank',
    '2026-03-07 07:47:48'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    447,
    'ADMIN-001',
    'Export Databank',
    '2026-03-07 07:48:05'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    448,
    'ADMIN-001',
    'Updated Family Class #FID-0226-0001-A to A',
    '2026-03-11 15:50:42'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    449,
    'ADMIN-001',
    'Updated Family Class #FID-0226-0001-A to A',
    '2026-03-11 15:51:03'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    450,
    'ADMIN-001',
    'Updated Family Class #FID-0226-0001-A to A',
    '2026-03-11 15:51:24'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    451,
    'ADMIN-001',
    'Updated Family Class #FID-0226-0001-A to A',
    '2026-03-11 15:55:22'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    452,
    'ADMIN-001',
    'Updated Family Class #FID-0226-0001-A to B',
    '2026-03-11 15:55:40'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    453,
    'ADMIN-001',
    'Created hazard area //',
    '2026-03-12 09:17:35'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    454,
    'ADMIN-001',
    'Created backup',
    '2026-03-16 23:06:04'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    455,
    'ADMIN-001',
    'Created backup',
    '2026-03-16 23:10:24'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    456,
    'ADMIN-001',
    'Created backup',
    '2026-03-16 23:10:45'
  );
INSERT INTO
  `activity_log` (
    `activity_log_id`,
    `user_id`,
    `description`,
    `created_at`
  )
VALUES
  (
    457,
    'ADMIN-001',
    'Created backup',
    '2026-03-16 23:10:59'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: affiliation
# ------------------------------------------------------------

INSERT INTO
  `affiliation` (
    `resident_id`,
    `date_become_officer`,
    `date_become_member`,
    `organization_name`,
    `office_address`,
    `contact_number`
  )
VALUES
  (
    'RID-0226-0004-A-1',
    '2002-06-17',
    '2002-06-17',
    'Dasdadsa',
    NULL,
    NULL
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: amenities
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: appliances_own
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: community_issues
# ------------------------------------------------------------

INSERT INTO
  `community_issues` (
    `community_issues_id`,
    `survey_id`,
    `community_issue`
  )
VALUES
  (53, 'SID-0226-0001', NULL);
INSERT INTO
  `community_issues` (
    `community_issues_id`,
    `survey_id`,
    `community_issue`
  )
VALUES
  (54, 'SID-0226-0002', NULL);
INSERT INTO
  `community_issues` (
    `community_issues_id`,
    `survey_id`,
    `community_issue`
  )
VALUES
  (55, 'SID-0226-0003', 'Ako ay putangina naman oo');
INSERT INTO
  `community_issues` (
    `community_issues_id`,
    `survey_id`,
    `community_issue`
  )
VALUES
  (56, 'SID-0226-0004', NULL);
INSERT INTO
  `community_issues` (
    `community_issues_id`,
    `survey_id`,
    `community_issue`
  )
VALUES
  (57, 'SID-0226-0005', NULL);
INSERT INTO
  `community_issues` (
    `community_issues_id`,
    `survey_id`,
    `community_issue`
  )
VALUES
  (58, 'SID-0326-0001', NULL);
INSERT INTO
  `community_issues` (
    `community_issues_id`,
    `survey_id`,
    `community_issue`
  )
VALUES
  (59, 'SID-0326-0002', NULL);
INSERT INTO
  `community_issues` (
    `community_issues_id`,
    `survey_id`,
    `community_issue`
  )
VALUES
  (60, 'SID-0326-0003', NULL);

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: contact_information
# ------------------------------------------------------------

INSERT INTO
  `contact_information` (
    `resident_id`,
    `street`,
    `barangay`,
    `contact_number`,
    `telephone_number`,
    `email_address`
  )
VALUES
  ('RID-0226-0001-B-1', NULL, NULL, NULL, NULL, NULL);
INSERT INTO
  `contact_information` (
    `resident_id`,
    `street`,
    `barangay`,
    `contact_number`,
    `telephone_number`,
    `email_address`
  )
VALUES
  (
    'RID-0226-0002-A-1',
    'Dawdasdawdasdasdasd',
    'Sta. Rosa',
    '0923-456-7890',
    '0412831879',
    'sample@email.com'
  );
INSERT INTO
  `contact_information` (
    `resident_id`,
    `street`,
    `barangay`,
    `contact_number`,
    `telephone_number`,
    `email_address`
  )
VALUES
  ('RID-0226-0003-A-1', NULL, NULL, NULL, NULL, NULL);
INSERT INTO
  `contact_information` (
    `resident_id`,
    `street`,
    `barangay`,
    `contact_number`,
    `telephone_number`,
    `email_address`
  )
VALUES
  ('RID-0326-0001-A-1', NULL, NULL, NULL, NULL, NULL);
INSERT INTO
  `contact_information` (
    `resident_id`,
    `street`,
    `barangay`,
    `contact_number`,
    `telephone_number`,
    `email_address`
  )
VALUES
  ('RID-0326-0001-B-1', NULL, NULL, NULL, NULL, NULL);
INSERT INTO
  `contact_information` (
    `resident_id`,
    `street`,
    `barangay`,
    `contact_number`,
    `telephone_number`,
    `email_address`
  )
VALUES
  (
    'T-RID-0226-0001',
    '123',
    'Sta. Rosa',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `contact_information` (
    `resident_id`,
    `street`,
    `barangay`,
    `contact_number`,
    `telephone_number`,
    `email_address`
  )
VALUES
  (
    'T-RID-0226-0005',
    '123 RIZAL ST.',
    'Sta. Rosa',
    '0928-499-5166',
    '8310748904209',
    'rfsolloso@gmail.com'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: crops_planted
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: education_expenses
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: emergency_contact
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: family_background
# ------------------------------------------------------------

INSERT INTO
  `family_background` (
    `family_background_id`,
    `pwd_id`,
    `person_id`,
    `role`
  )
VALUES
  (19, NULL, 49, 'father');
INSERT INTO
  `family_background` (
    `family_background_id`,
    `pwd_id`,
    `person_id`,
    `role`
  )
VALUES
  (20, NULL, 50, 'mother');
INSERT INTO
  `family_background` (
    `family_background_id`,
    `pwd_id`,
    `person_id`,
    `role`
  )
VALUES
  (21, NULL, 51, 'guardian');
INSERT INTO
  `family_background` (
    `family_background_id`,
    `pwd_id`,
    `person_id`,
    `role`
  )
VALUES
  (22, NULL, 57, 'father');
INSERT INTO
  `family_background` (
    `family_background_id`,
    `pwd_id`,
    `person_id`,
    `role`
  )
VALUES
  (23, NULL, 58, 'mother');
INSERT INTO
  `family_background` (
    `family_background_id`,
    `pwd_id`,
    `person_id`,
    `role`
  )
VALUES
  (24, NULL, 59, 'guardian');
INSERT INTO
  `family_background` (
    `family_background_id`,
    `pwd_id`,
    `person_id`,
    `role`
  )
VALUES
  (55, '02-0902-000-0000001', 145, 'father');
INSERT INTO
  `family_background` (
    `family_background_id`,
    `pwd_id`,
    `person_id`,
    `role`
  )
VALUES
  (56, '02-0902-000-0000001', 146, 'mother');
INSERT INTO
  `family_background` (
    `family_background_id`,
    `pwd_id`,
    `person_id`,
    `role`
  )
VALUES
  (57, '02-0902-000-0000001', 147, 'guardian');
INSERT INTO
  `family_background` (
    `family_background_id`,
    `pwd_id`,
    `person_id`,
    `role`
  )
VALUES
  (70, '02-0902-000-0000002', 185, 'father');
INSERT INTO
  `family_background` (
    `family_background_id`,
    `pwd_id`,
    `person_id`,
    `role`
  )
VALUES
  (71, '02-0902-000-0000002', 186, 'mother');
INSERT INTO
  `family_background` (
    `family_background_id`,
    `pwd_id`,
    `person_id`,
    `role`
  )
VALUES
  (72, '02-0902-000-0000002', 187, 'guardian');

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: family_composition
# ------------------------------------------------------------

INSERT INTO
  `family_composition` (
    `family_composition_id`,
    `senior_citizen_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`,
    `sex`,
    `relationship`,
    `birthdate`,
    `civil_status`,
    `occupation`,
    `annual_income`
  )
VALUES
  (
    6,
    'SC-0226-0001',
    'Juan',
    NULL,
    'L',
    NULL,
    'Male',
    'Family Head',
    '2002-06-17',
    'Single',
    NULL,
    0.00
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: family_expenses
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: family_information
# ------------------------------------------------------------

INSERT INTO
  `family_information` (
    `family_id`,
    `household_id`,
    `survey_id`,
    `family_class`,
    `monthly_income`,
    `irregular_income`,
    `family_income`,
    `irregular_income_remarks`
  )
VALUES
  (
    'FID-0226-0001-A',
    'HID-0226-0001',
    'SID-0226-0001',
    'B',
    17250.00,
    0.00,
    34500.00,
    NULL
  );
INSERT INTO
  `family_information` (
    `family_id`,
    `household_id`,
    `survey_id`,
    `family_class`,
    `monthly_income`,
    `irregular_income`,
    `family_income`,
    `irregular_income_remarks`
  )
VALUES
  (
    'FID-0226-0001-B',
    'HID-0226-0001',
    'SID-0226-0002',
    NULL,
    324567.00,
    0.00,
    324567.00,
    NULL
  );
INSERT INTO
  `family_information` (
    `family_id`,
    `household_id`,
    `survey_id`,
    `family_class`,
    `monthly_income`,
    `irregular_income`,
    `family_income`,
    `irregular_income_remarks`
  )
VALUES
  (
    'FID-0226-0001-C',
    'HID-0226-0001',
    'SID-0326-0001',
    NULL,
    0.00,
    0.00,
    0.00,
    NULL
  );
INSERT INTO
  `family_information` (
    `family_id`,
    `household_id`,
    `survey_id`,
    `family_class`,
    `monthly_income`,
    `irregular_income`,
    `family_income`,
    `irregular_income_remarks`
  )
VALUES
  (
    'FID-0226-0002-A',
    'HID-0226-0002',
    'SID-0226-0003',
    NULL,
    23000.00,
    0.00,
    23000.00,
    NULL
  );
INSERT INTO
  `family_information` (
    `family_id`,
    `household_id`,
    `survey_id`,
    `family_class`,
    `monthly_income`,
    `irregular_income`,
    `family_income`,
    `irregular_income_remarks`
  )
VALUES
  (
    'FID-0226-0003-A',
    'HID-0226-0003',
    'SID-0226-0004',
    NULL,
    0.00,
    0.00,
    0.00,
    NULL
  );
INSERT INTO
  `family_information` (
    `family_id`,
    `household_id`,
    `survey_id`,
    `family_class`,
    `monthly_income`,
    `irregular_income`,
    `family_income`,
    `irregular_income_remarks`
  )
VALUES
  (
    'FID-0226-0004-A',
    'HID-0226-0004',
    'SID-0226-0005',
    NULL,
    0.00,
    0.00,
    0.00,
    NULL
  );
INSERT INTO
  `family_information` (
    `family_id`,
    `household_id`,
    `survey_id`,
    `family_class`,
    `monthly_income`,
    `irregular_income`,
    `family_income`,
    `irregular_income_remarks`
  )
VALUES
  (
    'FID-0326-0001-A',
    'HID-0326-0001',
    'SID-0326-0002',
    NULL,
    23000.00,
    0.00,
    23000.00,
    NULL
  );
INSERT INTO
  `family_information` (
    `family_id`,
    `household_id`,
    `survey_id`,
    `family_class`,
    `monthly_income`,
    `irregular_income`,
    `family_income`,
    `irregular_income_remarks`
  )
VALUES
  (
    'FID-0326-0001-B',
    'HID-0326-0001',
    'SID-0326-0003',
    NULL,
    0.00,
    0.00,
    0.00,
    NULL
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: family_resources
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: farm_lots
# ------------------------------------------------------------

INSERT INTO
  `farm_lots` (
    `farm_lots_id`,
    `survey_id`,
    `ownership_type`,
    `cultivation`,
    `pastureland`,
    `forestland`
  )
VALUES
  (97, 'SID-0226-0001', NULL, NULL, NULL, NULL);
INSERT INTO
  `farm_lots` (
    `farm_lots_id`,
    `survey_id`,
    `ownership_type`,
    `cultivation`,
    `pastureland`,
    `forestland`
  )
VALUES
  (98, 'SID-0226-0002', '', NULL, NULL, NULL);
INSERT INTO
  `farm_lots` (
    `farm_lots_id`,
    `survey_id`,
    `ownership_type`,
    `cultivation`,
    `pastureland`,
    `forestland`
  )
VALUES
  (99, 'SID-0226-0003', '', NULL, NULL, NULL);
INSERT INTO
  `farm_lots` (
    `farm_lots_id`,
    `survey_id`,
    `ownership_type`,
    `cultivation`,
    `pastureland`,
    `forestland`
  )
VALUES
  (100, 'SID-0226-0004', '', NULL, NULL, NULL);
INSERT INTO
  `farm_lots` (
    `farm_lots_id`,
    `survey_id`,
    `ownership_type`,
    `cultivation`,
    `pastureland`,
    `forestland`
  )
VALUES
  (101, 'SID-0226-0005', '', NULL, NULL, NULL);
INSERT INTO
  `farm_lots` (
    `farm_lots_id`,
    `survey_id`,
    `ownership_type`,
    `cultivation`,
    `pastureland`,
    `forestland`
  )
VALUES
  (102, 'SID-0326-0001', NULL, NULL, NULL, NULL);
INSERT INTO
  `farm_lots` (
    `farm_lots_id`,
    `survey_id`,
    `ownership_type`,
    `cultivation`,
    `pastureland`,
    `forestland`
  )
VALUES
  (103, 'SID-0326-0002', '', NULL, NULL, NULL);
INSERT INTO
  `farm_lots` (
    `farm_lots_id`,
    `survey_id`,
    `ownership_type`,
    `cultivation`,
    `pastureland`,
    `forestland`
  )
VALUES
  (104, 'SID-0326-0003', '', NULL, NULL, NULL);

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: food_expenses
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: fruit_bearing_trees
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: government_ids
# ------------------------------------------------------------

INSERT INTO
  `government_ids` (
    `resident_id`,
    `sss`,
    `gsis`,
    `pagibig`,
    `psn`,
    `philhealth`,
    `philsys`
  )
VALUES
  (
    'RID-0226-0001-B-1',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `government_ids` (
    `resident_id`,
    `sss`,
    `gsis`,
    `pagibig`,
    `psn`,
    `philhealth`,
    `philsys`
  )
VALUES
  (
    'RID-0226-0002-A-1',
    '31-2312809-8',
    '9808',
    '0980-8',
    '809',
    '89-0',
    '80980809'
  );
INSERT INTO
  `government_ids` (
    `resident_id`,
    `sss`,
    `gsis`,
    `pagibig`,
    `psn`,
    `philhealth`,
    `philsys`
  )
VALUES
  (
    'RID-0226-0003-A-1',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `government_ids` (
    `resident_id`,
    `sss`,
    `gsis`,
    `pagibig`,
    `psn`,
    `philhealth`,
    `philsys`
  )
VALUES
  (
    'RID-0326-0001-A-1',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `government_ids` (
    `resident_id`,
    `sss`,
    `gsis`,
    `pagibig`,
    `psn`,
    `philhealth`,
    `philsys`
  )
VALUES
  (
    'RID-0326-0001-B-1',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `government_ids` (
    `resident_id`,
    `sss`,
    `gsis`,
    `pagibig`,
    `psn`,
    `philhealth`,
    `philsys`
  )
VALUES
  ('T-RID-0226-0001', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO
  `government_ids` (
    `resident_id`,
    `sss`,
    `gsis`,
    `pagibig`,
    `psn`,
    `philhealth`,
    `philsys`
  )
VALUES
  (
    'T-RID-0226-0005',
    '02-4568934-5',
    '89480892830',
    '8923-0849-8023',
    'Psn-42394-23',
    '34-234234234-2',
    NULL
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: hazard_areas
# ------------------------------------------------------------

INSERT INTO
  `hazard_areas` (
    `hazard_area_id`,
    `latitude`,
    `longitude`,
    `radius`,
    `hazard_type`,
    `description`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    2,
    20.813411,
    121.855888,
    100,
    'landslide',
    'Landslide Prone Area',
    '2026-01-22 20:04:22',
    '2026-01-22 20:04:22'
  );
INSERT INTO
  `hazard_areas` (
    `hazard_area_id`,
    `latitude`,
    `longitude`,
    `radius`,
    `hazard_type`,
    `description`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    3,
    20.812135,
    121.854569,
    100,
    'landslide',
    'Landslide Prone Area',
    '2026-01-22 20:04:29',
    '2026-01-22 20:04:29'
  );
INSERT INTO
  `hazard_areas` (
    `hazard_area_id`,
    `latitude`,
    `longitude`,
    `radius`,
    `hazard_type`,
    `description`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    4,
    20.804826,
    121.846189,
    100,
    'landslide',
    'Landslide Prone Area',
    '2026-01-22 20:04:31',
    '2026-01-22 20:04:31'
  );
INSERT INTO
  `hazard_areas` (
    `hazard_area_id`,
    `latitude`,
    `longitude`,
    `radius`,
    `hazard_type`,
    `description`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    5,
    20.812288,
    121.847391,
    100,
    'landslide',
    'Landslide Prone Area',
    '2026-01-22 20:04:36',
    '2026-01-22 20:04:36'
  );
INSERT INTO
  `hazard_areas` (
    `hazard_area_id`,
    `latitude`,
    `longitude`,
    `radius`,
    `hazard_type`,
    `description`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    6,
    20.695155,
    121.810999,
    100,
    'landslide',
    'Landslide Prone Area',
    '2026-01-22 20:04:51',
    '2026-01-22 20:04:51'
  );
INSERT INTO
  `hazard_areas` (
    `hazard_area_id`,
    `latitude`,
    `longitude`,
    `radius`,
    `hazard_type`,
    `description`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    7,
    20.704338,
    121.809454,
    100,
    'landslide',
    'Landslide Prone Area',
    '2026-01-22 20:04:52',
    '2026-01-22 20:04:52'
  );
INSERT INTO
  `hazard_areas` (
    `hazard_area_id`,
    `latitude`,
    `longitude`,
    `radius`,
    `hazard_type`,
    `description`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    8,
    20.704338,
    121.809454,
    100,
    'landslide',
    'Landslide Prone Area',
    '2026-01-22 20:04:52',
    '2026-01-22 20:04:52'
  );
INSERT INTO
  `hazard_areas` (
    `hazard_area_id`,
    `latitude`,
    `longitude`,
    `radius`,
    `hazard_type`,
    `description`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    9,
    20.708432,
    121.806750,
    100,
    'landslide',
    'Landslide Prone Area',
    '2026-01-22 20:04:52',
    '2026-01-22 20:04:52'
  );
INSERT INTO
  `hazard_areas` (
    `hazard_area_id`,
    `latitude`,
    `longitude`,
    `radius`,
    `hazard_type`,
    `description`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    10,
    20.706385,
    121.806750,
    100,
    'landslide',
    'Landslide Prone Area',
    '2026-01-22 20:04:53',
    '2026-01-22 20:04:53'
  );
INSERT INTO
  `hazard_areas` (
    `hazard_area_id`,
    `latitude`,
    `longitude`,
    `radius`,
    `hazard_type`,
    `description`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    11,
    20.706385,
    121.806750,
    100,
    'landslide',
    'Landslide Prone Area',
    '2026-01-22 20:04:53',
    '2026-01-22 20:04:53'
  );
INSERT INTO
  `hazard_areas` (
    `hazard_area_id`,
    `latitude`,
    `longitude`,
    `radius`,
    `hazard_type`,
    `description`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    12,
    20.706746,
    121.807222,
    100,
    'landslide',
    'Landslide Prone Area',
    '2026-01-22 20:04:54',
    '2026-01-22 20:04:54'
  );
INSERT INTO
  `hazard_areas` (
    `hazard_area_id`,
    `latitude`,
    `longitude`,
    `radius`,
    `hazard_type`,
    `description`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    13,
    20.706746,
    121.807222,
    100,
    'landslide',
    'Landslide Prone Area',
    '2026-01-22 20:04:54',
    '2026-01-22 20:04:54'
  );
INSERT INTO
  `hazard_areas` (
    `hazard_area_id`,
    `latitude`,
    `longitude`,
    `radius`,
    `hazard_type`,
    `description`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    14,
    20.706746,
    121.807222,
    100,
    'landslide',
    'Landslide Prone Area',
    '2026-01-22 20:04:55',
    '2026-01-22 20:04:55'
  );
INSERT INTO
  `hazard_areas` (
    `hazard_area_id`,
    `latitude`,
    `longitude`,
    `radius`,
    `hazard_type`,
    `description`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    15,
    20.706746,
    121.807222,
    100,
    'landslide',
    'Landslide Prone Area',
    '2026-01-22 20:04:55',
    '2026-01-22 20:04:55'
  );
INSERT INTO
  `hazard_areas` (
    `hazard_area_id`,
    `latitude`,
    `longitude`,
    `radius`,
    `hazard_type`,
    `description`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    16,
    20.783667,
    121.838159,
    100,
    'landslide',
    'Landslide Prone Area',
    '2026-01-22 20:12:09',
    '2026-01-22 20:12:09'
  );
INSERT INTO
  `hazard_areas` (
    `hazard_area_id`,
    `latitude`,
    `longitude`,
    `radius`,
    `hazard_type`,
    `description`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    17,
    20.784032,
    121.838679,
    100,
    'landslide',
    'Landslide Prone Area',
    '2026-01-22 20:13:08',
    '2026-01-22 20:13:08'
  );
INSERT INTO
  `hazard_areas` (
    `hazard_area_id`,
    `latitude`,
    `longitude`,
    `radius`,
    `hazard_type`,
    `description`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    18,
    20.784243,
    121.838100,
    100,
    'landslide',
    'Landslide Prone Area',
    '2026-01-22 20:14:35',
    '2026-01-22 20:14:35'
  );
INSERT INTO
  `hazard_areas` (
    `hazard_area_id`,
    `latitude`,
    `longitude`,
    `radius`,
    `hazard_type`,
    `description`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    19,
    20.791264,
    121.846490,
    100,
    'landslide',
    'Landslide Prone Area',
    '2026-01-22 20:17:48',
    '2026-01-22 20:17:48'
  );
INSERT INTO
  `hazard_areas` (
    `hazard_area_id`,
    `latitude`,
    `longitude`,
    `radius`,
    `hazard_type`,
    `description`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    20,
    20.789638,
    121.846275,
    100,
    'landslide',
    'Landslide Prone Area',
    '2026-01-22 20:34:26',
    '2026-01-22 20:34:26'
  );
INSERT INTO
  `hazard_areas` (
    `hazard_area_id`,
    `latitude`,
    `longitude`,
    `radius`,
    `hazard_type`,
    `description`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    21,
    20.749441,
    121.845760,
    100,
    'landslide',
    'Landslide Prone Area',
    '2026-01-22 20:34:42',
    '2026-01-22 20:34:42'
  );
INSERT INTO
  `hazard_areas` (
    `hazard_area_id`,
    `latitude`,
    `longitude`,
    `radius`,
    `hazard_type`,
    `description`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    24,
    20.794152,
    121.837864,
    100,
    'tsunami',
    'Tsunami Risk Area',
    '2026-03-12 09:17:35',
    '2026-03-12 09:17:35'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: health_information
# ------------------------------------------------------------

INSERT INTO
  `health_information` (
    `resident_id`,
    `blood_type`,
    `health_status`,
    `disability_type`,
    `disability_cause`,
    `disability_specific`
  )
VALUES
  ('RID-0226-0001-B-1', NULL, NULL, NULL, NULL, NULL);
INSERT INTO
  `health_information` (
    `resident_id`,
    `blood_type`,
    `health_status`,
    `disability_type`,
    `disability_cause`,
    `disability_specific`
  )
VALUES
  (
    'RID-0226-0002-A-1',
    'A+',
    'Palpitations',
    'Psychological Disability',
    'Congenital / Inborn',
    'Autism'
  );
INSERT INTO
  `health_information` (
    `resident_id`,
    `blood_type`,
    `health_status`,
    `disability_type`,
    `disability_cause`,
    `disability_specific`
  )
VALUES
  ('RID-0226-0003-A-1', NULL, NULL, NULL, NULL, NULL);
INSERT INTO
  `health_information` (
    `resident_id`,
    `blood_type`,
    `health_status`,
    `disability_type`,
    `disability_cause`,
    `disability_specific`
  )
VALUES
  ('RID-0326-0001-A-1', NULL, NULL, NULL, NULL, NULL);
INSERT INTO
  `health_information` (
    `resident_id`,
    `blood_type`,
    `health_status`,
    `disability_type`,
    `disability_cause`,
    `disability_specific`
  )
VALUES
  ('RID-0326-0001-B-1', NULL, NULL, NULL, NULL, NULL);
INSERT INTO
  `health_information` (
    `resident_id`,
    `blood_type`,
    `health_status`,
    `disability_type`,
    `disability_cause`,
    `disability_specific`
  )
VALUES
  (
    'T-RID-0226-0001',
    'B+',
    NULL,
    'Rare Disease (RA 10747)',
    'Congenital / Inborn',
    'ADHD'
  );
INSERT INTO
  `health_information` (
    `resident_id`,
    `blood_type`,
    `health_status`,
    `disability_type`,
    `disability_cause`,
    `disability_specific`
  )
VALUES
  (
    'T-RID-0226-0005',
    'A+',
    NULL,
    'Speech and Language Impairment',
    'Congenital / Inborn',
    'Autism'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: house_images
# ------------------------------------------------------------

INSERT INTO
  `house_images` (
    `house_image_id`,
    `household_id`,
    `house_image_url`,
    `house_image_public_id`,
    `house_image_title`
  )
VALUES
  (
    75,
    'HID-0226-0002',
    'https://res.cloudinary.com/diuruuyas/image/upload/v1771391342/surveys/house-images/1771391339406-COVID%20-19%20Vaccine.jpg.jpg',
    'surveys/house-images/1771391339406-COVID -19 Vaccine.jpg',
    'House Image 1'
  );
INSERT INTO
  `house_images` (
    `house_image_id`,
    `household_id`,
    `house_image_url`,
    `house_image_public_id`,
    `house_image_title`
  )
VALUES
  (
    76,
    'HID-0226-0003',
    'https://res.cloudinary.com/diuruuyas/image/upload/v1771829735/surveys/house-images/1771829733661-COVID%20-19%20Vaccine.jpg.jpg',
    'surveys/house-images/1771829733661-COVID -19 Vaccine.jpg',
    'House Image 1'
  );
INSERT INTO
  `house_images` (
    `house_image_id`,
    `household_id`,
    `house_image_url`,
    `house_image_public_id`,
    `house_image_title`
  )
VALUES
  (
    78,
    'HID-0226-0004',
    'https://res.cloudinary.com/diuruuyas/image/upload/v1772111874/surveys/house-images/1772111873417-MVC%20School%20ID.jpg.jpg',
    'surveys/house-images/1772111873417-MVC School ID.jpg',
    'House Image 1'
  );
INSERT INTO
  `house_images` (
    `house_image_id`,
    `household_id`,
    `house_image_url`,
    `house_image_public_id`,
    `house_image_title`
  )
VALUES
  (
    83,
    'HID-0226-0001',
    'https://res.cloudinary.com/diuruuyas/image/upload/v1772361086/surveys/house-images/1772361085497-img30.jpg',
    'surveys/house-images/1772361085497-img30',
    'House Image 1'
  );
INSERT INTO
  `house_images` (
    `house_image_id`,
    `household_id`,
    `house_image_url`,
    `house_image_public_id`,
    `house_image_title`
  )
VALUES
  (
    84,
    'HID-0226-0001',
    'https://res.cloudinary.com/diuruuyas/image/upload/v1772361085/surveys/house-images/1772361085514-id-picture.jpg',
    'surveys/house-images/1772361085514-id-picture',
    'House Image 2'
  );
INSERT INTO
  `house_images` (
    `house_image_id`,
    `household_id`,
    `house_image_url`,
    `house_image_public_id`,
    `house_image_title`
  )
VALUES
  (
    85,
    'HID-0326-0001',
    'https://res.cloudinary.com/diuruuyas/image/upload/v1772368858/surveys/house-images/1772368856872-resume-picture.jpg',
    'surveys/house-images/1772368856872-resume-picture',
    'House Image 1'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: household_composition
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: households
# ------------------------------------------------------------

INSERT INTO
  `households` (
    `household_id`,
    `family_class`,
    `monthly_income`,
    `irregular_income`,
    `family_income`,
    `house_structure`,
    `house_condition`,
    `latitude`,
    `longitude`,
    `street`,
    `barangay`,
    `municipality`,
    `multiple_family`,
    `family_head_first_name`,
    `family_head_middle_name`,
    `family_head_last_name`,
    `family_head_suffix`,
    `sitio_yawran`
  )
VALUES
  (
    'HID-0226-0001',
    NULL,
    NULL,
    NULL,
    NULL,
    'Make Shift',
    'Owned',
    20.780952,
    121.835718,
    '123 rizal st.',
    'Sta. Lucia',
    NULL,
    1,
    'Juan',
    'Santos',
    'Dela Cruz',
    '',
    0
  );
INSERT INTO
  `households` (
    `household_id`,
    `family_class`,
    `monthly_income`,
    `irregular_income`,
    `family_income`,
    `house_structure`,
    `house_condition`,
    `latitude`,
    `longitude`,
    `street`,
    `barangay`,
    `municipality`,
    `multiple_family`,
    `family_head_first_name`,
    `family_head_middle_name`,
    `family_head_last_name`,
    `family_head_suffix`,
    `sitio_yawran`
  )
VALUES
  (
    'HID-0226-0002',
    NULL,
    NULL,
    NULL,
    NULL,
    'Light Materials (Traditional Cogon House)',
    'Owned',
    NULL,
    NULL,
    'Dawdasdawdasdasdasd',
    'Sta. Rosa',
    NULL,
    1,
    'John',
    'Santos',
    'Solloso',
    '',
    0
  );
INSERT INTO
  `households` (
    `household_id`,
    `family_class`,
    `monthly_income`,
    `irregular_income`,
    `family_income`,
    `house_structure`,
    `house_condition`,
    `latitude`,
    `longitude`,
    `street`,
    `barangay`,
    `municipality`,
    `multiple_family`,
    `family_head_first_name`,
    `family_head_middle_name`,
    `family_head_last_name`,
    `family_head_suffix`,
    `sitio_yawran`
  )
VALUES
  (
    'HID-0226-0003',
    NULL,
    NULL,
    NULL,
    NULL,
    'Light Materials (GI Sheets/Pipes)',
    'Owned',
    NULL,
    NULL,
    'Asda',
    'Sta. Rosa',
    NULL,
    0,
    '',
    '',
    '',
    '',
    0
  );
INSERT INTO
  `households` (
    `household_id`,
    `family_class`,
    `monthly_income`,
    `irregular_income`,
    `family_income`,
    `house_structure`,
    `house_condition`,
    `latitude`,
    `longitude`,
    `street`,
    `barangay`,
    `municipality`,
    `multiple_family`,
    `family_head_first_name`,
    `family_head_middle_name`,
    `family_head_last_name`,
    `family_head_suffix`,
    `sitio_yawran`
  )
VALUES
  (
    'HID-0226-0004',
    NULL,
    NULL,
    NULL,
    NULL,
    'Concrete',
    'Shared',
    NULL,
    NULL,
    '123',
    'Sta. Rosa',
    NULL,
    0,
    '',
    '',
    '',
    '',
    NULL
  );
INSERT INTO
  `households` (
    `household_id`,
    `family_class`,
    `monthly_income`,
    `irregular_income`,
    `family_income`,
    `house_structure`,
    `house_condition`,
    `latitude`,
    `longitude`,
    `street`,
    `barangay`,
    `municipality`,
    `multiple_family`,
    `family_head_first_name`,
    `family_head_middle_name`,
    `family_head_last_name`,
    `family_head_suffix`,
    `sitio_yawran`
  )
VALUES
  (
    'HID-0326-0001',
    NULL,
    NULL,
    NULL,
    NULL,
    'Concrete',
    'Owned',
    NULL,
    NULL,
    '123',
    'Sta. Rosa',
    NULL,
    1,
    'Aegon',
    '',
    'Targaryen',
    '',
    0
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: id_generator_information
# ------------------------------------------------------------

INSERT INTO
  `id_generator_information` (
    `id`,
    `mayor_name`,
    `mayor_signature`,
    `mswdo_officer`,
    `mswdo_signature`,
    `osca_head`,
    `osca_head_signature`
  )
VALUES
  (
    1,
    'Ruther Solloso',
    '/uploads/id_generator_information/Mayor Signature.jpeg',
    'Glai Malupa',
    NULL,
    'KesKes Malupa',
    NULL
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: ignored_duplicates
# ------------------------------------------------------------

INSERT INTO
  `ignored_duplicates` (
    `id`,
    `resident_id_1`,
    `resident_id_2`,
    `ignored_at`,
    `ignored_by`,
    `reason`
  )
VALUES
  (
    1,
    'RID-0226-0003-A-3',
    'RID-0226-0004-A-1',
    '2026-02-11 10:06:00',
    NULL,
    'User marked as not duplicate'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: livestock
# ------------------------------------------------------------

INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1328, 'SID-0226-0001', 'carabao', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1329, 'SID-0226-0001', 'pig', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1330, 'SID-0226-0001', 'goat', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1331, 'SID-0226-0001', 'horse', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1332, 'SID-0226-0001', 'poultry', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1333, 'SID-0226-0001', 'cow', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1334, 'SID-0226-0001', 'otherAnimals', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1335, 'SID-0226-0002', 'carabao', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1336, 'SID-0226-0002', 'pig', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1337, 'SID-0226-0002', 'goat', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1338, 'SID-0226-0002', 'horse', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1339, 'SID-0226-0002', 'poultry', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1340, 'SID-0226-0002', 'cow', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1341, 'SID-0226-0002', 'otherAnimals', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1342, 'SID-0226-0003', 'carabao', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1343, 'SID-0226-0003', 'pig', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1344, 'SID-0226-0003', 'goat', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1345, 'SID-0226-0003', 'horse', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1346, 'SID-0226-0003', 'poultry', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1347, 'SID-0226-0003', 'cow', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1348, 'SID-0226-0003', 'otherAnimals', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1349, 'SID-0226-0004', 'carabao', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1350, 'SID-0226-0004', 'pig', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1351, 'SID-0226-0004', 'goat', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1352, 'SID-0226-0004', 'horse', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1353, 'SID-0226-0004', 'poultry', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1354, 'SID-0226-0004', 'cow', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1355, 'SID-0226-0004', 'otherAnimals', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1356, 'SID-0226-0005', 'carabao', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1357, 'SID-0226-0005', 'pig', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1358, 'SID-0226-0005', 'goat', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1359, 'SID-0226-0005', 'horse', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1360, 'SID-0226-0005', 'poultry', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1361, 'SID-0226-0005', 'cow', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1362, 'SID-0226-0005', 'otherAnimals', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1387, 'SID-0326-0001', 'carabao', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1388, 'SID-0326-0001', 'pig', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1389, 'SID-0326-0001', 'goat', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1390, 'SID-0326-0001', 'horse', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1391, 'SID-0326-0001', 'poultry', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1392, 'SID-0326-0001', 'cow', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1393, 'SID-0326-0001', 'otherAnimals', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1430, 'SID-0326-0002', 'carabao', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1431, 'SID-0326-0002', 'pig', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1432, 'SID-0326-0002', 'goat', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1433, 'SID-0326-0002', 'horse', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1434, 'SID-0326-0002', 'poultry', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1435, 'SID-0326-0002', 'cow', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1436, 'SID-0326-0002', 'otherAnimals', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1437, 'SID-0326-0003', 'carabao', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1438, 'SID-0326-0003', 'pig', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1439, 'SID-0326-0003', 'goat', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1440, 'SID-0326-0003', 'horse', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1441, 'SID-0326-0003', 'poultry', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1442, 'SID-0326-0003', 'cow', 0, 0);
INSERT INTO
  `livestock` (
    `livestock_id`,
    `survey_id`,
    `animal_type`,
    `own`,
    `dispersal`
  )
VALUES
  (1443, 'SID-0326-0003', 'otherAnimals', 0, 0);

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: monthly_expenses
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: non_ivatan
# ------------------------------------------------------------

INSERT INTO
  `non_ivatan` (
    `resident_id`,
    `settlement_details`,
    `ethnicity`,
    `place_of_origin`,
    `transient`,
    `house_owner`,
    `date_registered`
  )
VALUES
  (
    'RID-0226-0004-A-1',
    'Married To Ivatan',
    'Itawes',
    'Rizal, Tugegarao',
    1,
    'Andres Balagtas',
    '2000-10-10'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: officers
# ------------------------------------------------------------

INSERT INTO
  `officers` (`officers_id`, `pwd_id`, `person_id`, `role`)
VALUES
  (19, NULL, 54, 'processor');
INSERT INTO
  `officers` (`officers_id`, `pwd_id`, `person_id`, `role`)
VALUES
  (20, NULL, 55, 'approver');
INSERT INTO
  `officers` (`officers_id`, `pwd_id`, `person_id`, `role`)
VALUES
  (21, NULL, 56, 'encoder');
INSERT INTO
  `officers` (`officers_id`, `pwd_id`, `person_id`, `role`)
VALUES
  (22, NULL, 62, 'processor');
INSERT INTO
  `officers` (`officers_id`, `pwd_id`, `person_id`, `role`)
VALUES
  (23, NULL, 63, 'approver');
INSERT INTO
  `officers` (`officers_id`, `pwd_id`, `person_id`, `role`)
VALUES
  (24, NULL, 64, 'encoder');
INSERT INTO
  `officers` (`officers_id`, `pwd_id`, `person_id`, `role`)
VALUES
  (55, '02-0902-000-0000001', 150, 'processor');
INSERT INTO
  `officers` (`officers_id`, `pwd_id`, `person_id`, `role`)
VALUES
  (56, '02-0902-000-0000001', 151, 'approver');
INSERT INTO
  `officers` (`officers_id`, `pwd_id`, `person_id`, `role`)
VALUES
  (57, '02-0902-000-0000001', 152, 'encoder');
INSERT INTO
  `officers` (`officers_id`, `pwd_id`, `person_id`, `role`)
VALUES
  (70, '02-0902-000-0000002', 190, 'processor');
INSERT INTO
  `officers` (`officers_id`, `pwd_id`, `person_id`, `role`)
VALUES
  (71, '02-0902-000-0000002', 191, 'approver');
INSERT INTO
  `officers` (`officers_id`, `pwd_id`, `person_id`, `role`)
VALUES
  (72, '02-0902-000-0000002', 192, 'encoder');

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: osca_information
# ------------------------------------------------------------

INSERT INTO
  `osca_information` (
    `osca_information_id`,
    `senior_citizen_id`,
    `association_name`,
    `date_elected_as_officer`,
    `position`
  )
VALUES
  (5, 'SC-0226-0001', NULL, NULL, '');

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: person
# ------------------------------------------------------------

INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (25, 'Ama', NULL, 'Pader', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (26, 'Ina', NULL, 'Mader', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (27, 'Guard', NULL, 'Dyan', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (28, 'Repo', NULL, 'Santi', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (29, 'Physic', NULL, 'Sad', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (30, 'PO', NULL, 'OPISERT', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (31, 'AO', NULL, 'OPISERT', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (32, 'PO', NULL, 'OPISERT', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (33, 'Ruther', NULL, 'Solloso', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (34, 'Mader', NULL, 'Solloso', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (35, 'Ruther Frith', NULL, 'Solloso', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (36, 'Ruther Frith', NULL, 'Solloso', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (37, 'Physiolo', NULL, 'Gical', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (38, 'dadas', NULL, 'dadad', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (39, 'dasd', NULL, 'asda', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (40, 'dadas', NULL, 'dadad', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (41, '', NULL, '', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (42, '', NULL, '', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (43, 'da', NULL, 'das', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (44, 'da', NULL, 'da', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (45, 'das', NULL, 'da', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (46, 'das', NULL, 'dad', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (47, 'a', NULL, 'asd', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (48, 'das', NULL, 'dad', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (49, '', NULL, '', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (50, '', NULL, '', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (51, 'da', NULL, 'das', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (52, 'da', NULL, 'da', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (53, 'das', NULL, 'da', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (54, 'das', NULL, 'dad', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (55, 'a', NULL, 'asd', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (56, 'das', NULL, 'dad', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (57, '', NULL, '', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (58, '', NULL, '', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (59, 'da', NULL, 'das', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (60, 'da', NULL, 'da', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (61, 'das', NULL, 'da', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (62, 'das', NULL, 'dad', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (63, 'a', NULL, 'asd', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (64, 'das', NULL, 'dad', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (65, 'Willliam', NULL, 'Bayaras', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (66, 'Karen', NULL, 'Malupa', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (67, 'Karen', NULL, 'Malupa', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (68, 'Klyden', NULL, 'Bayaras', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (69, 'Doc', NULL, 'Banjo', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (70, 'Glaiza', NULL, 'Malupa', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (71, 'Glaiza', NULL, 'Malupa', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (72, 'Glaiza', NULL, 'Malupa', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (73, '', NULL, '', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (74, '', NULL, '', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (75, 'asd', NULL, 'asda', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (76, 'dasda', NULL, 'asdas', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (77, 'asd', NULL, 'asdsa', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (78, 'dasdsa', NULL, 'dasda', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (79, 'dasdas', NULL, 'sdasdas', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (80, 'dasdsa', NULL, 'dasda', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (81, '', NULL, '', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (82, '', NULL, '', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (83, 'Dsa', NULL, 'Saddas', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (84, 'Dasd', NULL, 'Asd', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (85, 'Dasd', NULL, 'Asd', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (86, 'Dsadas', NULL, 'Dasd', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (87, 'Dadsa', NULL, 'Asdasdas', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (88, 'Dsadas', NULL, 'Dasd', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (89, '', NULL, '', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (90, '', NULL, '', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (91, 'Das', NULL, 'Das', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (92, 'Dasdas', NULL, 'Dasd', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (93, 'Dasdsad', NULL, 'Asdas', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (94, 'Dasd', NULL, 'Asd', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (95, 'Sadasd', NULL, 'Asdasd', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (96, 'Dasd', NULL, 'Asd', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (97, '', NULL, '', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (98, '', NULL, '', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (99, 'Aegon', NULL, 'Targaryen', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (100, 'Duncan', 'The ', 'Tall', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (101, 'Maekar', NULL, 'Targaryen', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (102, 'Aerion', NULL, 'Targaryen', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (103, 'Aerion', NULL, 'Targaryen', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (104, 'Aerion', NULL, 'Targaryen', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (105, '', NULL, '', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (106, '', NULL, '', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (107, 'Jarjar', NULL, 'Bonks', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (108, 'Aegon', NULL, 'Targaryen', 'V');
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (109, 'Maekar', NULL, 'Targaryen', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (110, 'Da', NULL, 'Asd', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (111, 'Dasd', NULL, 'Asda', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (112, 'Da', NULL, 'Asd', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (113, '', NULL, '', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (114, '', NULL, '', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (115, 'Juan', NULL, 'Tamad', 'Sr');
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (116, 'Juan', 'Santos', 'Dela Cruz', 'Jr');
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (117, 'Emg', NULL, 'Hed', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (118, 'Jajarija', NULL, 'Jarija', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (119, 'Sansannan', 'S', 'San', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (120, 'Jajarija', NULL, 'Jarija', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (121, '', NULL, '', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (122, '', NULL, '', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (123, 'Asd', NULL, 'Asd', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (124, 'Juan', 'Santos', 'Dela Cruz', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (125, 'Asdasd', NULL, 'Asd', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (126, 'Dasdasd', NULL, 'Asdasda', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (127, 'Sdasdas', NULL, 'Asdasdas', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (128, 'Dasdasd', NULL, 'Asdasda', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (129, '', NULL, '', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (130, '', NULL, '', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (131, 'Dasd', NULL, 'Dasd', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (132, 'Dasd', NULL, 'Asdas', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (133, 'Dsad', NULL, 'Asdasd', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (134, 'Das', NULL, 'Dasd', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (135, 'Dsa', NULL, 'Das', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (136, 'Das', NULL, 'Dasd', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (137, '', NULL, '', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (138, '', NULL, '', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (139, 'Das', NULL, 'Das', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (140, 'Das', NULL, 'Das', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (141, 'Dsa', NULL, 'Das', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (142, 'Dasdas', NULL, 'Sad', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (143, 'Dsadas', NULL, 'Dsa', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (144, 'Dasdas', NULL, 'Sad', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (145, 'JUAN', 'SANTOS', 'DELA CRUZ', 'Jr');
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (146, 'JUAN', 'SANTOS', 'DELA CRUZ', 'Jr');
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (147, 'JUAN', 'SANTOS', 'DELA CRUZ', 'Jr');
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (148, 'JUAN', 'SANTOS', 'DELA CRUZ', 'Jr');
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (149, 'JUAN', NULL, 'DELA CRUZ', 'Jr');
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (150, 'JUAN', 'SANTOS', 'DELA CRUZ', 'Jr');
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (151, 'JUAN', 'SANOTS', 'DELA CRUZ', 'Jr');
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (152, 'JUAN', 'SANTOS', 'DELA CRUZ', 'Jr');
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (153, '', NULL, '', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (154, '', NULL, '', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (155, 'Ds', NULL, 'A', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (156, 'Dsa', NULL, 'Sda', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (157, 'Dsa', NULL, 'Dsa', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (158, 'S', NULL, 'A', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (159, 'D', NULL, 'S', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (160, 'S', NULL, 'A', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (161, 'A', NULL, 'A', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (162, 'A', NULL, 'A', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (163, 'A', NULL, 'A', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (164, 'A', NULL, 'A', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (165, 'A', NULL, 'A', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (166, 'A', NULL, 'A', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (167, 'A', NULL, 'A', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (168, 'A', NULL, 'A', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (169, 'Dsa', NULL, 'Sd', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (170, 'Asd', NULL, 'Asd', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (171, 'Asd', NULL, 'Asd', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (172, 'Sad', NULL, 'Asd', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (173, 'Dsa', NULL, 'Dsa', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (174, 'Asd', NULL, 'Asd', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (175, 'Dsa', NULL, 'Asd', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (176, 'Asd', NULL, 'Asd', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (177, '', NULL, '', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (178, '', NULL, '', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (179, 'Asd', NULL, 'Asd', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (180, 'Das', NULL, 'Das', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (181, 'Dsa', NULL, 'Sda', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (182, 'A', NULL, 'A', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (183, 'A', NULL, 'A', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (184, 'A', NULL, 'A', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (185, '', NULL, '', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (186, '', NULL, '', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (187, 'Jk', NULL, 'Jk', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (188, 'K;', 'K', ';L', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (189, 'Kl;', NULL, 'Kl', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (190, 'Kk', NULL, 'Kk', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (191, 'K;K', NULL, 'Iop', NULL);
INSERT INTO
  `person` (
    `person_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`
  )
VALUES
  (192, 'Kk', NULL, 'Kk', NULL);

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: physician
# ------------------------------------------------------------

INSERT INTO
  `physician` (
    `physician_id`,
    `pwd_id`,
    `person_id`,
    `license_number`
  )
VALUES
  (7, NULL, 53, 'das');
INSERT INTO
  `physician` (
    `physician_id`,
    `pwd_id`,
    `person_id`,
    `license_number`
  )
VALUES
  (8, NULL, 61, 'das');
INSERT INTO
  `physician` (
    `physician_id`,
    `pwd_id`,
    `person_id`,
    `license_number`
  )
VALUES
  (19, '02-0902-000-0000001', 149, '381982319831031');
INSERT INTO
  `physician` (
    `physician_id`,
    `pwd_id`,
    `person_id`,
    `license_number`
  )
VALUES
  (24, '02-0902-000-0000002', 189, 'Kl');

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: population
# ------------------------------------------------------------

INSERT INTO
  `population` (
    `resident_id`,
    `family_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`,
    `sex`,
    `birthdate`,
    `civil_status`,
    `religion`,
    `relation_to_family_head`,
    `birthplace`,
    `verified_birthdate`,
    `specify_id`,
    `other_relationship`
  )
VALUES
  (
    'RID-0226-0001-A-1',
    'FID-0226-0001-A',
    'Juan',
    'Santos',
    'Dela cruz',
    NULL,
    'Male',
    '2000-06-17',
    'Married',
    NULL,
    'Family Head',
    NULL,
    0,
    '',
    NULL
  );
INSERT INTO
  `population` (
    `resident_id`,
    `family_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`,
    `sex`,
    `birthdate`,
    `civil_status`,
    `religion`,
    `relation_to_family_head`,
    `birthplace`,
    `verified_birthdate`,
    `specify_id`,
    `other_relationship`
  )
VALUES
  (
    'RID-0226-0001-A-2',
    'FID-0226-0001-A',
    'Maria',
    'Santos',
    'Dela cruz',
    NULL,
    'Female',
    '1978-09-19',
    'Married',
    'Iglesia ni Cristo',
    'Wife',
    NULL,
    0,
    '',
    NULL
  );
INSERT INTO
  `population` (
    `resident_id`,
    `family_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`,
    `sex`,
    `birthdate`,
    `civil_status`,
    `religion`,
    `relation_to_family_head`,
    `birthplace`,
    `verified_birthdate`,
    `specify_id`,
    `other_relationship`
  )
VALUES
  (
    'RID-0226-0001-B-1',
    'FID-0226-0001-B',
    'Miguelito',
    NULL,
    'Ays',
    NULL,
    'Male',
    '2002-06-17',
    'Single',
    NULL,
    'Family Head',
    NULL,
    NULL,
    '',
    NULL
  );
INSERT INTO
  `population` (
    `resident_id`,
    `family_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`,
    `sex`,
    `birthdate`,
    `civil_status`,
    `religion`,
    `relation_to_family_head`,
    `birthplace`,
    `verified_birthdate`,
    `specify_id`,
    `other_relationship`
  )
VALUES
  (
    'RID-0226-0001-C-1',
    'FID-0226-0001-C',
    'Jibanyan',
    NULL,
    'Jigaboo',
    NULL,
    'Male',
    '2000-06-17',
    'Single',
    NULL,
    'Family Head',
    'Itbayat',
    1,
    'National Id',
    NULL
  );
INSERT INTO
  `population` (
    `resident_id`,
    `family_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`,
    `sex`,
    `birthdate`,
    `civil_status`,
    `religion`,
    `relation_to_family_head`,
    `birthplace`,
    `verified_birthdate`,
    `specify_id`,
    `other_relationship`
  )
VALUES
  (
    'RID-0226-0002-A-1',
    'FID-0226-0002-A',
    'Juan',
    NULL,
    'Dela Cruz',
    'Sr',
    'Male',
    '1960-10-10',
    'Single',
    'Roman Catholic',
    'Family Head',
    'Itbayat, Batanes',
    NULL,
    '',
    NULL
  );
INSERT INTO
  `population` (
    `resident_id`,
    `family_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`,
    `sex`,
    `birthdate`,
    `civil_status`,
    `religion`,
    `relation_to_family_head`,
    `birthplace`,
    `verified_birthdate`,
    `specify_id`,
    `other_relationship`
  )
VALUES
  (
    'RID-0226-0003-A-1',
    'FID-0226-0003-A',
    'Juancho',
    NULL,
    'Santos',
    NULL,
    'Male',
    '2000-06-17',
    'Single',
    NULL,
    'Family Head',
    NULL,
    NULL,
    '',
    NULL
  );
INSERT INTO
  `population` (
    `resident_id`,
    `family_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`,
    `sex`,
    `birthdate`,
    `civil_status`,
    `religion`,
    `relation_to_family_head`,
    `birthplace`,
    `verified_birthdate`,
    `specify_id`,
    `other_relationship`
  )
VALUES
  (
    'RID-0226-0004-A-1',
    'FID-0226-0004-A',
    'Baelor',
    NULL,
    'Targaryen',
    NULL,
    'Male',
    '2002-06-17',
    'Married',
    NULL,
    'Family Head',
    NULL,
    0,
    '',
    NULL
  );
INSERT INTO
  `population` (
    `resident_id`,
    `family_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`,
    `sex`,
    `birthdate`,
    `civil_status`,
    `religion`,
    `relation_to_family_head`,
    `birthplace`,
    `verified_birthdate`,
    `specify_id`,
    `other_relationship`
  )
VALUES
  (
    'RID-0326-0001-A-1',
    'FID-0326-0001-A',
    'Aegon',
    NULL,
    'Targaryen',
    NULL,
    'Male',
    '2000-06-17',
    'Single',
    NULL,
    'Family Head',
    NULL,
    NULL,
    '',
    NULL
  );
INSERT INTO
  `population` (
    `resident_id`,
    `family_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`,
    `sex`,
    `birthdate`,
    `civil_status`,
    `religion`,
    `relation_to_family_head`,
    `birthplace`,
    `verified_birthdate`,
    `specify_id`,
    `other_relationship`
  )
VALUES
  (
    'RID-0326-0001-B-1',
    'FID-0326-0001-B',
    'Maekar',
    NULL,
    'Targaryen',
    'Sr',
    'Male',
    '2000-06-17',
    'Single',
    NULL,
    'Family Head',
    NULL,
    NULL,
    '',
    NULL
  );
INSERT INTO
  `population` (
    `resident_id`,
    `family_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`,
    `sex`,
    `birthdate`,
    `civil_status`,
    `religion`,
    `relation_to_family_head`,
    `birthplace`,
    `verified_birthdate`,
    `specify_id`,
    `other_relationship`
  )
VALUES
  (
    'T-RID-0226-0001',
    NULL,
    'Manda',
    NULL,
    'Aakon',
    NULL,
    'Male',
    '1990-06-17',
    'Single',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `population` (
    `resident_id`,
    `family_id`,
    `first_name`,
    `middle_name`,
    `last_name`,
    `suffix`,
    `sex`,
    `birthdate`,
    `civil_status`,
    `religion`,
    `relation_to_family_head`,
    `birthplace`,
    `verified_birthdate`,
    `specify_id`,
    `other_relationship`
  )
VALUES
  (
    'T-RID-0226-0005',
    NULL,
    'Juan',
    'Santos',
    'Dela Cruz',
    'Jr',
    'Male',
    '2002-06-17',
    'Single',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: posts
# ------------------------------------------------------------

INSERT INTO
  `posts` (
    `post_id`,
    `user_id`,
    `post_title`,
    `post_description`,
    `post_thumbnail_url`,
    `post_thumbnail_id`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    5,
    'ADMIN-001',
    'gohmasd',
    'aslkfd;fm;kwm;lkms;adfawefsadf',
    'https://res.cloudinary.com/diuruuyas/image/upload/v1768876100/posts/seooo6vkekepdtyinrjd.png',
    'posts/seooo6vkekepdtyinrjd',
    '2026-01-20 10:28:15',
    '2026-01-20 10:28:15'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: problem_needs
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: professional_information
# ------------------------------------------------------------

INSERT INTO
  `professional_information` (
    `resident_id`,
    `educational_attainment`,
    `skills`,
    `occupation`,
    `company`,
    `employment_status`,
    `employment_category`,
    `employment_type`,
    `monthly_income`,
    `annual_income`,
    `receiving_pension`,
    `pension_type`,
    `pension_income`,
    `other_pension_type`,
    `other_occupation`
  )
VALUES
  (
    'RID-0226-0001-A-1',
    'College Graduate',
    NULL,
    'Mason ako',
    NULL,
    NULL,
    NULL,
    NULL,
    34000.00,
    0.00,
    0,
    '',
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `professional_information` (
    `resident_id`,
    `educational_attainment`,
    `skills`,
    `occupation`,
    `company`,
    `employment_status`,
    `employment_category`,
    `employment_type`,
    `monthly_income`,
    `annual_income`,
    `receiving_pension`,
    `pension_type`,
    `pension_income`,
    `other_pension_type`,
    `other_occupation`
  )
VALUES
  (
    'RID-0226-0001-A-2',
    'Junior High School Level',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    500.00,
    0.00,
    0,
    '',
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `professional_information` (
    `resident_id`,
    `educational_attainment`,
    `skills`,
    `occupation`,
    `company`,
    `employment_status`,
    `employment_category`,
    `employment_type`,
    `monthly_income`,
    `annual_income`,
    `receiving_pension`,
    `pension_type`,
    `pension_income`,
    `other_pension_type`,
    `other_occupation`
  )
VALUES
  (
    'RID-0226-0001-B-1',
    'Pre School Graduate',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    324567.00,
    NULL,
    0,
    '',
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `professional_information` (
    `resident_id`,
    `educational_attainment`,
    `skills`,
    `occupation`,
    `company`,
    `employment_status`,
    `employment_category`,
    `employment_type`,
    `monthly_income`,
    `annual_income`,
    `receiving_pension`,
    `pension_type`,
    `pension_income`,
    `other_pension_type`,
    `other_occupation`
  )
VALUES
  (
    'RID-0226-0001-C-1',
    'No Grade Completed',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    0.00,
    0.00,
    0,
    '',
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `professional_information` (
    `resident_id`,
    `educational_attainment`,
    `skills`,
    `occupation`,
    `company`,
    `employment_status`,
    `employment_category`,
    `employment_type`,
    `monthly_income`,
    `annual_income`,
    `receiving_pension`,
    `pension_type`,
    `pension_income`,
    `other_pension_type`,
    `other_occupation`
  )
VALUES
  (
    'RID-0226-0002-A-1',
    'Pre School Level',
    NULL,
    'Others',
    'Mswdo',
    'Employed',
    'Government',
    'Employed (Government / Permanent)',
    23000.00,
    23000.00,
    0,
    '',
    0.00,
    NULL,
    'Samba Do Brasil'
  );
INSERT INTO
  `professional_information` (
    `resident_id`,
    `educational_attainment`,
    `skills`,
    `occupation`,
    `company`,
    `employment_status`,
    `employment_category`,
    `employment_type`,
    `monthly_income`,
    `annual_income`,
    `receiving_pension`,
    `pension_type`,
    `pension_income`,
    `other_pension_type`,
    `other_occupation`
  )
VALUES
  (
    'RID-0226-0003-A-1',
    'No Grade Completed',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    0.00,
    NULL,
    0,
    '',
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `professional_information` (
    `resident_id`,
    `educational_attainment`,
    `skills`,
    `occupation`,
    `company`,
    `employment_status`,
    `employment_category`,
    `employment_type`,
    `monthly_income`,
    `annual_income`,
    `receiving_pension`,
    `pension_type`,
    `pension_income`,
    `other_pension_type`,
    `other_occupation`
  )
VALUES
  (
    'RID-0226-0004-A-1',
    'No Grade Completed',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    0.00,
    0.00,
    0,
    '',
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `professional_information` (
    `resident_id`,
    `educational_attainment`,
    `skills`,
    `occupation`,
    `company`,
    `employment_status`,
    `employment_category`,
    `employment_type`,
    `monthly_income`,
    `annual_income`,
    `receiving_pension`,
    `pension_type`,
    `pension_income`,
    `other_pension_type`,
    `other_occupation`
  )
VALUES
  (
    'RID-0326-0001-A-1',
    'No Grade Completed',
    NULL,
    'None',
    NULL,
    NULL,
    NULL,
    NULL,
    23000.00,
    NULL,
    0,
    '',
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `professional_information` (
    `resident_id`,
    `educational_attainment`,
    `skills`,
    `occupation`,
    `company`,
    `employment_status`,
    `employment_category`,
    `employment_type`,
    `monthly_income`,
    `annual_income`,
    `receiving_pension`,
    `pension_type`,
    `pension_income`,
    `other_pension_type`,
    `other_occupation`
  )
VALUES
  (
    'RID-0326-0001-B-1',
    'No Grade Completed',
    NULL,
    'None',
    NULL,
    NULL,
    NULL,
    NULL,
    0.00,
    NULL,
    0,
    '',
    0.00,
    NULL,
    NULL
  );
INSERT INTO
  `professional_information` (
    `resident_id`,
    `educational_attainment`,
    `skills`,
    `occupation`,
    `company`,
    `employment_status`,
    `employment_category`,
    `employment_type`,
    `monthly_income`,
    `annual_income`,
    `receiving_pension`,
    `pension_type`,
    `pension_income`,
    `other_pension_type`,
    `other_occupation`
  )
VALUES
  (
    'T-RID-0226-0001',
    'Pre School Level',
    '',
    '',
    NULL,
    '',
    '',
    '',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `professional_information` (
    `resident_id`,
    `educational_attainment`,
    `skills`,
    `occupation`,
    `company`,
    `employment_status`,
    `employment_category`,
    `employment_type`,
    `monthly_income`,
    `annual_income`,
    `receiving_pension`,
    `pension_type`,
    `pension_income`,
    `other_pension_type`,
    `other_occupation`
  )
VALUES
  (
    'T-RID-0226-0005',
    'College Graduate',
    'Computer Literacy / Computer System Servicing',
    'Managers',
    NULL,
    'Employed',
    'Government',
    'Employed (Job Order / Contractual / Casual)',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: pwd_id_applications
# ------------------------------------------------------------

INSERT INTO
  `pwd_id_applications` (
    `pwd_id`,
    `user_id`,
    `resident_id`,
    `pwd_photo_id_url`,
    `pwd_photo_id_public_Id`,
    `pwd_signature_url`,
    `pwd_signature_public_id`,
    `reporting_unit`,
    `control_number`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    '02-0902-000-0000001',
    'ADMIN-001',
    'T-RID-0226-0005',
    '/uploads/pwd-id-applications/photo-id/photo-id-02-0902-000-0000002.png',
    NULL,
    '/uploads/pwd-id-applications/applicant-signatures/signature-02-0902-000-0000002.png',
    NULL,
    '4829384029841-2481093-',
    'I9E8I492JIL243',
    '2026-02-18 20:41:27',
    '2026-02-19 14:54:48'
  );
INSERT INTO
  `pwd_id_applications` (
    `pwd_id`,
    `user_id`,
    `resident_id`,
    `pwd_photo_id_url`,
    `pwd_photo_id_public_Id`,
    `pwd_signature_url`,
    `pwd_signature_public_id`,
    `reporting_unit`,
    `control_number`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    '02-0902-000-0000002',
    'ADMIN-001',
    'RID-0226-0002-A-1',
    '/uploads/pwd-id-applications/photo-id/photo-id-02-0902-000-0000002.jpeg',
    NULL,
    '/uploads/pwd-id-applications/applicant-signatures/signature-02-0902-000-0000002.png',
    NULL,
    'Iop',
    'Ipoi',
    '2026-02-20 20:29:53',
    '2026-02-20 20:29:53'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: senior_citizen_id_applications
# ------------------------------------------------------------

INSERT INTO
  `senior_citizen_id_applications` (
    `senior_citizen_id`,
    `user_id`,
    `resident_id`,
    `senior_citizen_photo_id_url`,
    `senior_citizen_photo_id_public_Id`,
    `senior_citizen_signature_url`,
    `senior_citizen_signature_public_id`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    'SC-0226-0001',
    'ADMIN-001',
    'RID-0226-0002-A-1',
    '/uploads/senior-citizen-id-applications/photo-id/photo-id-SC-0226-0001.jpeg',
    NULL,
    '/uploads/senior-citizen-id-applications/applicant-signatures/signature-SC-0226-0001.png',
    NULL,
    '2026-02-21 07:28:37',
    '2026-02-21 07:28:37'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: service_availed
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: social_classification
# ------------------------------------------------------------

INSERT INTO
  `social_classification` (
    `resident_id`,
    `classification_code`,
    `classification_name`
  )
VALUES
  ('RID-0226-0001-A-1', 'WY', 'Working Youth');
INSERT INTO
  `social_classification` (
    `resident_id`,
    `classification_code`,
    `classification_name`
  )
VALUES
  ('RID-0226-0001-B-1', 'IS', 'In School');
INSERT INTO
  `social_classification` (
    `resident_id`,
    `classification_code`,
    `classification_name`
  )
VALUES
  ('RID-0226-0001-C-1', 'OSY', 'Out of School Youth');
INSERT INTO
  `social_classification` (
    `resident_id`,
    `classification_code`,
    `classification_name`
  )
VALUES
  ('RID-0226-0001-C-1', 'OT', 'Out Of Town');
INSERT INTO
  `social_classification` (
    `resident_id`,
    `classification_code`,
    `classification_name`
  )
VALUES
  (
    'RID-0226-0002-A-1',
    'PWD',
    'Person with Disability'
  );
INSERT INTO
  `social_classification` (
    `resident_id`,
    `classification_code`,
    `classification_name`
  )
VALUES
  ('RID-0226-0002-A-1', 'SP', 'Solo Parent');
INSERT INTO
  `social_classification` (
    `resident_id`,
    `classification_code`,
    `classification_name`
  )
VALUES
  ('RID-0226-0003-A-1', 'OSY', 'Out of School Youth');
INSERT INTO
  `social_classification` (
    `resident_id`,
    `classification_code`,
    `classification_name`
  )
VALUES
  ('RID-0226-0004-A-1', 'IPULA', 'Ipula/Non-Ivatan');
INSERT INTO
  `social_classification` (
    `resident_id`,
    `classification_code`,
    `classification_name`
  )
VALUES
  ('RID-0226-0004-A-1', 'IS', 'In School');
INSERT INTO
  `social_classification` (
    `resident_id`,
    `classification_code`,
    `classification_name`
  )
VALUES
  (
    'RID-0226-0004-A-1',
    'OFW',
    'Overseas Filipino Worker'
  );
INSERT INTO
  `social_classification` (
    `resident_id`,
    `classification_code`,
    `classification_name`
  )
VALUES
  ('RID-0226-0004-A-1', 'OT', 'Out Of Town');
INSERT INTO
  `social_classification` (
    `resident_id`,
    `classification_code`,
    `classification_name`
  )
VALUES
  (
    'RID-0226-0004-A-1',
    'PWD',
    'Person with Disability'
  );
INSERT INTO
  `social_classification` (
    `resident_id`,
    `classification_code`,
    `classification_name`
  )
VALUES
  ('RID-0226-0004-A-1', 'SP', 'Solo Parent');
INSERT INTO
  `social_classification` (
    `resident_id`,
    `classification_code`,
    `classification_name`
  )
VALUES
  ('RID-0326-0001-A-1', 'OSY', 'Out of School Youth');
INSERT INTO
  `social_classification` (
    `resident_id`,
    `classification_code`,
    `classification_name`
  )
VALUES
  ('RID-0326-0001-B-1', 'OSY', 'Out of School Youth');
INSERT INTO
  `social_classification` (
    `resident_id`,
    `classification_code`,
    `classification_name`
  )
VALUES
  ('T-RID-0226-0001', 'PWD', 'Person with Disability');
INSERT INTO
  `social_classification` (
    `resident_id`,
    `classification_code`,
    `classification_name`
  )
VALUES
  ('T-RID-0226-0005', 'PWD', 'Person with Disability');

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: solo_parent_id_applications
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: surveys
# ------------------------------------------------------------

INSERT INTO
  `surveys` (
    `survey_id`,
    `user_id`,
    `respondent_photo_url`,
    `respondent_photo_id`,
    `respondent_signature_url`,
    `respondent_signature_id`,
    `created_at`,
    `updated_at`,
    `respondent_first_name`,
    `respondent_middle_name`,
    `respondent_last_name`,
    `respondent_suffix`
  )
VALUES
  (
    'SID-0226-0001',
    'ADMIN-001',
    NULL,
    NULL,
    'https://res.cloudinary.com/diuruuyas/image/upload/v1770969058/surveys/respondent-signatures/1770969058252-respondent-signature.png',
    'surveys/respondent-signatures/1770969058252-respondent-signature',
    '2026-02-13 15:50:59',
    '2026-03-01 18:22:55',
    'Juan',
    'Santos',
    'Dela Cruz',
    ''
  );
INSERT INTO
  `surveys` (
    `survey_id`,
    `user_id`,
    `respondent_photo_url`,
    `respondent_photo_id`,
    `respondent_signature_url`,
    `respondent_signature_id`,
    `created_at`,
    `updated_at`,
    `respondent_first_name`,
    `respondent_middle_name`,
    `respondent_last_name`,
    `respondent_suffix`
  )
VALUES
  (
    'SID-0226-0002',
    'ADMIN-001',
    NULL,
    NULL,
    'https://res.cloudinary.com/diuruuyas/image/upload/v1771211261/surveys/respondent-signatures/1771211261271-respondent-signature.png',
    'surveys/respondent-signatures/1771211261271-respondent-signature',
    '2026-02-16 11:07:41',
    '2026-02-16 11:07:41',
    'Miguelito',
    '',
    'Ays',
    ''
  );
INSERT INTO
  `surveys` (
    `survey_id`,
    `user_id`,
    `respondent_photo_url`,
    `respondent_photo_id`,
    `respondent_signature_url`,
    `respondent_signature_id`,
    `created_at`,
    `updated_at`,
    `respondent_first_name`,
    `respondent_middle_name`,
    `respondent_last_name`,
    `respondent_suffix`
  )
VALUES
  (
    'SID-0226-0003',
    'ADMIN-001',
    'https://res.cloudinary.com/diuruuyas/image/upload/v1771391343/surveys/respondent-photos/1771391343162-img30.jpg.jpg',
    'surveys/respondent-photos/1771391343162-img30.jpg',
    NULL,
    NULL,
    '2026-02-18 13:09:04',
    '2026-02-18 13:09:04',
    'Juan',
    '',
    'Dela Cruz',
    'Sr'
  );
INSERT INTO
  `surveys` (
    `survey_id`,
    `user_id`,
    `respondent_photo_url`,
    `respondent_photo_id`,
    `respondent_signature_url`,
    `respondent_signature_id`,
    `created_at`,
    `updated_at`,
    `respondent_first_name`,
    `respondent_middle_name`,
    `respondent_last_name`,
    `respondent_suffix`
  )
VALUES
  (
    'SID-0226-0004',
    'ADMIN-001',
    NULL,
    NULL,
    'https://res.cloudinary.com/diuruuyas/image/upload/v1771829736/surveys/respondent-signatures/1771829736564-respondent-signature.png',
    'surveys/respondent-signatures/1771829736564-respondent-signature',
    '2026-02-23 14:55:37',
    '2026-02-23 14:55:37',
    'Juancho',
    '',
    'Santos',
    ''
  );
INSERT INTO
  `surveys` (
    `survey_id`,
    `user_id`,
    `respondent_photo_url`,
    `respondent_photo_id`,
    `respondent_signature_url`,
    `respondent_signature_id`,
    `created_at`,
    `updated_at`,
    `respondent_first_name`,
    `respondent_middle_name`,
    `respondent_last_name`,
    `respondent_suffix`
  )
VALUES
  (
    'SID-0226-0005',
    'ADMIN-001',
    NULL,
    NULL,
    'https://res.cloudinary.com/diuruuyas/image/upload/v1772022580/surveys/respondent-signatures/1772022580147-respondent-signature.png',
    'surveys/respondent-signatures/1772022580147-respondent-signature',
    '2026-02-25 20:29:41',
    '2026-02-26 21:40:34',
    'Baelor',
    '',
    'Targaryen',
    ''
  );
INSERT INTO
  `surveys` (
    `survey_id`,
    `user_id`,
    `respondent_photo_url`,
    `respondent_photo_id`,
    `respondent_signature_url`,
    `respondent_signature_id`,
    `created_at`,
    `updated_at`,
    `respondent_first_name`,
    `respondent_middle_name`,
    `respondent_last_name`,
    `respondent_suffix`
  )
VALUES
  (
    'SID-0326-0001',
    'ADMIN-001',
    NULL,
    NULL,
    'https://res.cloudinary.com/diuruuyas/image/upload/v1772360116/surveys/respondent-signatures/1772360115576-respondent-signature.png',
    'surveys/respondent-signatures/1772360115576-respondent-signature',
    '2026-03-01 18:15:18',
    '2026-03-01 18:31:28',
    'Jibanyan',
    '',
    'Jigaboo',
    ''
  );
INSERT INTO
  `surveys` (
    `survey_id`,
    `user_id`,
    `respondent_photo_url`,
    `respondent_photo_id`,
    `respondent_signature_url`,
    `respondent_signature_id`,
    `created_at`,
    `updated_at`,
    `respondent_first_name`,
    `respondent_middle_name`,
    `respondent_last_name`,
    `respondent_suffix`
  )
VALUES
  (
    'SID-0326-0002',
    'ADMIN-001',
    NULL,
    NULL,
    'https://res.cloudinary.com/diuruuyas/image/upload/v1772368860/surveys/respondent-signatures/1772368860360-respondent-signature.png',
    'surveys/respondent-signatures/1772368860360-respondent-signature',
    '2026-03-01 20:41:01',
    '2026-03-01 20:41:01',
    'Aegon',
    '',
    'Targaryen',
    ''
  );
INSERT INTO
  `surveys` (
    `survey_id`,
    `user_id`,
    `respondent_photo_url`,
    `respondent_photo_id`,
    `respondent_signature_url`,
    `respondent_signature_id`,
    `created_at`,
    `updated_at`,
    `respondent_first_name`,
    `respondent_middle_name`,
    `respondent_last_name`,
    `respondent_suffix`
  )
VALUES
  (
    'SID-0326-0003',
    'ADMIN-001',
    NULL,
    NULL,
    'https://res.cloudinary.com/diuruuyas/image/upload/v1772368867/surveys/respondent-signatures/1772368867281-respondent-signature.png',
    'surveys/respondent-signatures/1772368867281-respondent-signature',
    '2026-03-01 20:41:09',
    '2026-03-01 20:41:09',
    'Maekar',
    '',
    'Targaryen',
    'Sr'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: users
# ------------------------------------------------------------

INSERT INTO
  `users` (
    `user_id`,
    `name`,
    `username`,
    `password`,
    `role`,
    `barangay`,
    `password_changed_at`,
    `must_change_password`
  )
VALUES
  (
    'ADMIN-001',
    'Ruther Solloso',
    'admin',
    '$2b$10$2ErWIKqHRde.O5jbA4KBG.fvzxCwzPNqzNm3jbl2URe1q2w8EykzS',
    'Admin',
    NULL,
    NULL,
    0
  );
INSERT INTO
  `users` (
    `user_id`,
    `name`,
    `username`,
    `password`,
    `role`,
    `barangay`,
    `password_changed_at`,
    `must_change_password`
  )
VALUES
  (
    'UID-0126-0002',
    'Kester Malupa',
    'kes',
    '$2b$12$4kIDn1l4IHP0X7zFTFQrrO7tZH5k7L/FCjhuqPVantalQYaM1m/uG',
    'Barangay Official',
    'Sta. Rosa',
    '2026-02-19 10:39:51',
    1
  );
INSERT INTO
  `users` (
    `user_id`,
    `name`,
    `username`,
    `password`,
    `role`,
    `barangay`,
    `password_changed_at`,
    `must_change_password`
  )
VALUES
  (
    'UID-0126-0003',
    'Angge Guimbs',
    'angge',
    '$2b$10$MVOaI3TbyEoJJ9BA8AKpseNhyeKEiICEkVOMcv4nhX1c2WZ5qgIi.',
    'MSWDO Staff',
    '',
    NULL,
    0
  );
INSERT INTO
  `users` (
    `user_id`,
    `name`,
    `username`,
    `password`,
    `role`,
    `barangay`,
    `password_changed_at`,
    `must_change_password`
  )
VALUES
  (
    'UID-0126-0004',
    'Jin Kazama',
    'jin',
    '$2b$10$B70mZOY90OtCK1vGEHBtpe.PF8PUG80z4dSNgWbEPz64.x4Z7UgYW',
    'MSWDO Staff',
    '',
    NULL,
    0
  );
INSERT INTO
  `users` (
    `user_id`,
    `name`,
    `username`,
    `password`,
    `role`,
    `barangay`,
    `password_changed_at`,
    `must_change_password`
  )
VALUES
  (
    'UID-0226-0001',
    'Baelor Targaryen',
    'baelor',
    '$2b$10$9zw5vkkEzr76OUQKo0jnp.M/XmM9Va3x7FPxera8k/sYvIGZAv6Ti',
    'Barangay Secretary',
    'Sta. Rosa',
    NULL,
    0
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: water_information
# ------------------------------------------------------------

INSERT INTO
  `water_information` (
    `water_information_id`,
    `water_access`,
    `potable_water`,
    `water_sources`,
    `survey_id`
  )
VALUES
  (
    96,
    0,
    0,
    'Spring, Water Tank (Communal)',
    'SID-0226-0001'
  );
INSERT INTO
  `water_information` (
    `water_information_id`,
    `water_access`,
    `potable_water`,
    `water_sources`,
    `survey_id`
  )
VALUES
  (
    97,
    0,
    0,
    'Water Tank (Communal), Rain Collectors',
    'SID-0226-0002'
  );
INSERT INTO
  `water_information` (
    `water_information_id`,
    `water_access`,
    `potable_water`,
    `water_sources`,
    `survey_id`
  )
VALUES
  (
    98,
    1,
    1,
    'Water Tank (Communal), Spring',
    'SID-0226-0003'
  );
INSERT INTO
  `water_information` (
    `water_information_id`,
    `water_access`,
    `potable_water`,
    `water_sources`,
    `survey_id`
  )
VALUES
  (
    99,
    0,
    0,
    'Water Tank (Communal), Rain Collectors',
    'SID-0226-0004'
  );
INSERT INTO
  `water_information` (
    `water_information_id`,
    `water_access`,
    `potable_water`,
    `water_sources`,
    `survey_id`
  )
VALUES
  (100, 1, 1, 'Water Tank (Communal)', 'SID-0226-0005');
INSERT INTO
  `water_information` (
    `water_information_id`,
    `water_access`,
    `potable_water`,
    `water_sources`,
    `survey_id`
  )
VALUES
  (101, 1, 1, 'Faucet', 'SID-0326-0001');
INSERT INTO
  `water_information` (
    `water_information_id`,
    `water_access`,
    `potable_water`,
    `water_sources`,
    `survey_id`
  )
VALUES
  (
    102,
    1,
    1,
    'Spring, Water Tank (Communal)',
    'SID-0326-0002'
  );
INSERT INTO
  `water_information` (
    `water_information_id`,
    `water_access`,
    `potable_water`,
    `water_sources`,
    `survey_id`
  )
VALUES
  (103, 0, 0, 'Spring', 'SID-0326-0003');

/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

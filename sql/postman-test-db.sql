CREATE DATABASE IF NOT EXISTS se_course_postman_db;
GRANT ALL PRIVILEGES ON se_course_postman_db.* TO 'se_course_user'@'%';
FLUSH PRIVILEGES;
CREATE TABLE IF NOT EXISTS se_course_postman_db.`user` (
  userEmail VARCHAR(85) NOT NULL PRIMARY KEY,
  userPassword VARCHAR(255) NOT NULL,
  userFirstName VARCHAR(50) NOT NULL,
  userLastName VARCHAR(50) NOT NULL,
  userTel VARCHAR(50) NOT NULL,
  dateOfBirth DATE NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
DELETE FROM se_course_postman_db.`user`;
INSERT IGNORE INTO se_course_postman_db.`user` (userEmail, userPassword, userFirstName, userLastName, userTel, dateOfBirth) VALUES
('student1@example.test', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Sample', 'One', '0800000001', '2001-01-01'),
('student2@example.test', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Sample', 'Two', '0800000002', '2002-02-02'),
('student3@example.test', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Sample', 'Three', '0800000003', '2003-03-03');

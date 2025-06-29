-- Create database
CREATE DATABASE IF NOT EXISTS transport_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (optional, you can use root)
-- CREATE USER 'transport_user'@'localhost' IDENTIFIED BY 'your_password';
-- GRANT ALL PRIVILEGES ON transport_db.* TO 'transport_user'@'localhost';
-- FLUSH PRIVILEGES;

USE transport_db;

-- The Django migrations will create the tables automatically
-- Run: python manage.py makemigrations
-- Run: python manage.py migrate

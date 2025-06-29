-- Reset the database completely
DROP DATABASE IF EXISTS transport_db;
CREATE DATABASE transport_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE transport_db;

-- Set foreign key checks to 0 to avoid constraint issues during setup
SET foreign_key_checks = 0;

-- The Django migrations will create all tables
-- Run these commands after creating the database:
-- python manage.py makemigrations users
-- python manage.py makemigrations communities
-- python manage.py makemigrations trips
-- python manage.py makemigrations ratings
-- python manage.py migrate

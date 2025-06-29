#!/bin/bash

# Setup script for the transport database

echo "Setting up Transport App Database..."

# Step 1: Reset database (run the SQL script first)
echo "Step 1: Please run the reset_database.sql script in MySQL first"
echo "mysql -u root -p < scripts/reset_database.sql"
echo ""

# Step 2: Remove existing migrations
echo "Step 2: Removing existing migration files..."
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
find . -path "*/migrations/*.pyc" -delete

# Step 3: Create new migrations
echo "Step 3: Creating new migrations..."
python manage.py makemigrations users
python manage.py makemigrations communities
python manage.py makemigrations trips
python manage.py makemigrations ratings

# Step 4: Apply migrations
echo "Step 4: Applying migrations..."
python manage.py migrate

# Step 5: Create superuser
echo "Step 5: Creating superuser..."
python manage.py createsuperuser

echo "Database setup complete!"

@echo off
echo Setting up Transport App Database...

echo Step 1: Please run the reset_database.sql script in MySQL first
echo mysql -u root -p ^< scripts/reset_database.sql
echo.

echo Step 2: Removing existing migration files...
for /r %%i in (migrations\*.py) do if not "%%~nxi"=="__init__.py" del "%%i"
for /r %%i in (migrations\*.pyc) do del "%%i"

echo Step 3: Creating new migrations...
python manage.py makemigrations users
python manage.py makemigrations communities
python manage.py makemigrations trips
python manage.py makemigrations ratings

echo Step 4: Applying migrations...
python manage.py migrate

echo Step 5: Creating superuser...
python manage.py createsuperuser

echo Database setup complete!
pause

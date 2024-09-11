# Form Builder Application

This project is a web application built using Django for the backend and React for the frontend. It allows users to create forms from the UI, which other users can find, fill out, and get the results as a JSON file.

## Features

- User Authentication
- Admin Dashboard
- Form Builder
- Form Filler
- Form Presets
- Form Response Management

## Prerequisites

- [Python 3.8+](https://www.python.org/downloads/)
- [Node.js](https://nodejs.org/en/download/)
- [PostgreSQL](https://www.postgresql.org/download/)

## Setup and Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/form-builder-app.git
cd form-builder-app
```

### 2. Set Up Virtual Environment
Create and activate a virtual environment:

```bash
# On macOS/Linux
python3 -m venv env
source env/bin/activate

# On Windows
python -m venv env
env\Scripts\activate
```

### 3. Install Backend Dependencies
Navigate to the form_app directory and install the required Python packages:

```bash
cd form_app
pip install -r requirements.txt
```

### 4. Set Up PostgreSQL Database
Create a PostgreSQL database and user. Replace your_db_name, your_db_user, and your_db_password with your actual database name, user, and password.

```bash
CREATE DATABASE your_db_name;
CREATE USER your_db_user WITH PASSWORD 'your_db_password';
ALTER ROLE your_db_user SET client_encoding TO 'utf8';
ALTER ROLE your_db_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE your_db_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE your_db_name TO your_db_user;
```

### 5. Create Environment File
Create a .env file in the form_app directory and add the following environment variables:


```bash
SECRET_KEY=your_django_secret_key
DEBUG=True
ALLOWED_HOSTS=localhost
CORS_ALLOWED_ORIGINS=http://localhost:3000
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
```

### 6. Apply Migrations
Apply the database migrations:

```bash
python manage.py migrate
```

### 7. Create superuser
Create a superuser to access the Django admin panel:

```bash
python manage.py createsuperuser
```

### 8. Run the Backend Server
Start the Django development server:

```bash
python manage.py runserver
```
The backend API should now be accessible at http://localhost:8001/api/.

### 9. Install Frontend Dependencies
Navigate to the frontend directory and install the required Node.js packages:

```bash
cd ../frontend
npm install
```

### 10. Run the Frontend Server
Start the React development server:

```bash
npm start
```
The frontend should now be accessible at http://localhost:3000.

## Usage
### Admin Dashboard
Log in as the superuser to access the admin dashboard.
From the admin dashboard, you can manage users, forms, and presets.
### Form Builder
Create new forms using the Form Builder interface.
Define form structure with various field types.
### Form Filler
Select and fill out forms from the dropdown menu.
Save and download form responses
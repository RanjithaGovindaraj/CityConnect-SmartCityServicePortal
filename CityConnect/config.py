import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'cityconnect_coimbatore_secret_key_2026'
    
    # MySQL Database Configuration (XAMPP / Localhost default)
    MYSQL_HOST = os.environ.get('MYSQL_HOST') or 'localhost'
    MYSQL_USER = os.environ.get('MYSQL_USER') or 'root'
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD') or ''
    MYSQL_DB = os.environ.get('MYSQL_DB') or 'cityconnect_db'
    MYSQL_PORT = int(os.environ.get('MYSQL_PORT') or 3306)
    
    # File Upload Configuration
    UPLOAD_FOLDER = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'static/uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max upload size

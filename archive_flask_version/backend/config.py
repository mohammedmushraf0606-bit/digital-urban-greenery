import os

BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
DATABASE_DIR = os.path.join(BASE_DIR, 'database')
DB_PATH = os.environ.get('DB_PATH', os.path.join(DATABASE_DIR, 'urban_greenery.db'))
SCHEMA_PATH = os.path.join(DATABASE_DIR, 'schema.sql')
SEED_PATH = os.path.join(DATABASE_DIR, 'seed_data.sql')

SECRET_KEY = os.environ.get('SECRET_KEY', 'urban-greenery-secret-key-2026-secure')
DEBUG = os.environ.get('DEBUG', 'True').lower() in ('true', '1')
PORT = int(os.environ.get('PORT', 8080))
HOST = os.environ.get('HOST', '0.0.0.0')

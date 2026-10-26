import os
import tempfile

BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
DATABASE_DIR = os.path.join(BASE_DIR, 'database')

# Detect Vercel / AWS Lambda Serverless environment
IS_VERCEL = bool(os.environ.get('VERCEL') or os.environ.get('VERCEL_ENV') or os.environ.get('AWS_LAMBDA_FUNCTION_NAME'))

if IS_VERCEL:
    # Serverless filesystem is read-only except temp directory
    temp_dir = '/tmp' if os.path.exists('/tmp') else tempfile.gettempdir()
    DB_PATH = os.path.join(temp_dir, 'urban_greenery.db')
else:
    DB_PATH = os.environ.get('DB_PATH', os.path.join(DATABASE_DIR, 'urban_greenery.db'))

SCHEMA_PATH = os.path.join(DATABASE_DIR, 'schema.sql')
SEED_PATH = os.path.join(DATABASE_DIR, 'seed_data.sql')

SECRET_KEY = os.environ.get('SECRET_KEY', 'urban-greenery-secret-key-2026-secure')
DEBUG = os.environ.get('DEBUG', 'False' if IS_VERCEL else 'True').lower() in ('true', '1')
PORT = int(os.environ.get('PORT', 8080))
HOST = os.environ.get('HOST', '0.0.0.0')

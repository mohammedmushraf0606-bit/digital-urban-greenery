import sqlite3
import os
import shutil
from backend.config import DB_PATH, SCHEMA_PATH, SEED_PATH, IS_VERCEL, DATABASE_DIR

def get_db():
    """Connect to SQLite database and configure row factory to return dictionary-like rows."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db(force_reset=False):
    """Initialize database tables and populate sample seed data if not initialized."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

    # In Vercel serverless environment, copy bundled DB to writable temp location if not already there
    if IS_VERCEL and not os.path.exists(DB_PATH):
        bundled_db = os.path.join(DATABASE_DIR, 'urban_greenery.db')
        if os.path.exists(bundled_db):
            try:
                shutil.copyfile(bundled_db, DB_PATH)
                print(f"[Database] Copied bundled DB to {DB_PATH}")
                return
            except Exception as e:
                print(f"[Database] Could not copy bundled DB ({e}), initializing fresh in temp dir...")

    db_exists = os.path.exists(DB_PATH)
    conn = get_db()
    cursor = conn.cursor()

    if force_reset or not db_exists:
        print("[Database] Initializing new database schema...")
        with open(SCHEMA_PATH, 'r', encoding='utf-8') as f:
            cursor.executescript(f.read())

        print("[Database] Seeding sample data...")
        with open(SEED_PATH, 'r', encoding='utf-8') as f:
            cursor.executescript(f.read())
        
        conn.commit()
        print("[Database] Initialization complete with sample records.")
    else:
        # Check if users table exists and has rows
        try:
            cursor.execute("SELECT COUNT(*) FROM users")
            user_count = cursor.fetchone()[0]
            if user_count == 0:
                print("[Database] Database exists but empty. Populating schema and seed...")
                with open(SCHEMA_PATH, 'r', encoding='utf-8') as f:
                    cursor.executescript(f.read())
                with open(SEED_PATH, 'r', encoding='utf-8') as f:
                    cursor.executescript(f.read())
                conn.commit()
        except sqlite3.OperationalError:
            print("[Database] Schema missing. Executing schema and seed...")
            with open(SCHEMA_PATH, 'r', encoding='utf-8') as f:
                cursor.executescript(f.read())
            with open(SEED_PATH, 'r', encoding='utf-8') as f:
                cursor.executescript(f.read())
            conn.commit()
    
    conn.close()

def query_db(query, args=(), one=False):
    """Execute a SELECT query and return rows as standard Python dictionaries."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute(query, args)
    rv = cur.fetchall()
    conn.close()
    if not rv:
        return None if one else []
    return dict(rv[0]) if one else [dict(row) for row in rv]

def execute_db(query, args=()):
    """Execute an INSERT, UPDATE, or DELETE query and return lastrowid and affected rows."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute(query, args)
    conn.commit()
    last_id = cur.lastrowid
    row_count = cur.rowcount
    conn.close()
    return last_id, row_count

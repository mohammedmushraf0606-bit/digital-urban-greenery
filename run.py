"""
Digital Urban Greenery Management System
One-click Runner Script
"""
import os
import sys

# Ensure project root is in Python sys.path
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from backend.app import create_app
from backend.config import HOST, PORT, DEBUG

if __name__ == '__main__':
    app = create_app()
    port_display = f":{PORT}" if PORT != 80 else ""
    print("=" * 64)
    print("  DIGITAL URBAN GREENERY MANAGEMENT SYSTEM")
    print(f"  Local Web App: http://localhost{port_display}")
    print(f"  Alt Loopback:  http://127.0.0.1{port_display}")
    print(f"  API Endpoint:  http://localhost{port_display}/api")
    print("  Demo Logins:")
    print("    - Admin:   username: admin   | password: admin123")
    print("    - Officer: username: officer | password: officer123")
    print("=" * 64)
    app.run(host=HOST, port=PORT, debug=DEBUG)

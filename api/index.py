"""
Vercel Serverless Entrypoint for Digital Urban Greenery Management System
Exports WSGI `app` for @vercel/python
"""
import os
import sys

# Ensure project root directory is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.app import create_app

# Vercel Serverless Python looks for WSGI callable named `app`
app = create_app()

if __name__ == '__main__':
    app.run()

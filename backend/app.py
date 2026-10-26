import os
import mimetypes
from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
from backend.config import SECRET_KEY, DEBUG, BASE_DIR
from backend.database import init_db

# Ensure correct MIME types across all platforms
mimetypes.add_type('text/javascript', '.js')
mimetypes.add_type('text/css', '.css')

# Import Route Blueprints
from backend.routes.auth import auth_bp
from backend.routes.dashboard import dashboard_bp
from backend.routes.parks import parks_bp
from backend.routes.trees import trees_bp
from backend.routes.urban_forests import urban_forests_bp
from backend.routes.green_belts import green_belts_bp
from backend.routes.environmental import environmental_bp
from backend.routes.maintenance import maintenance_bp
from backend.routes.reports import reports_bp

def create_app():
    frontend_folder = os.path.join(BASE_DIR, 'frontend')
    app = Flask(__name__, static_folder=frontend_folder, static_url_path='')
    app.config['SECRET_KEY'] = SECRET_KEY

    # Enable Cross-Origin Resource Sharing
    CORS(app, supports_credentials=True)

    # Initialize Database & Seed Sample Records
    with app.app_context():
        init_db()

    # Register API Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(parks_bp)
    app.register_blueprint(trees_bp)
    app.register_blueprint(urban_forests_bp)
    app.register_blueprint(green_belts_bp)
    app.register_blueprint(environmental_bp)
    app.register_blueprint(maintenance_bp)
    app.register_blueprint(reports_bp)

    # Serve Frontend HTML & Static Assets
    @app.route('/')
    def serve_index():
        return send_from_directory(frontend_folder, 'index.html')

    @app.route('/<path:path>')
    def serve_static(path):
        target = os.path.join(frontend_folder, path)
        if os.path.exists(target):
            return send_from_directory(frontend_folder, path)
        # Fallback to index if not found
        return send_from_directory(frontend_folder, 'index.html')

    # API Root Health Check
    @app.route('/api')
    def api_root():
        return jsonify({
            'status': 'online',
            'project': 'Digital Urban Greenery Management System',
            'version': '1.0.0',
            'endpoints': {
                'auth': '/api/auth',
                'dashboard': '/api/dashboard/stats',
                'parks': '/api/parks',
                'trees': '/api/trees',
                'urban_forests': '/api/urban-forests',
                'green_belts': '/api/green-belts',
                'environmental': '/api/environmental',
                'maintenance': '/api/maintenance',
                'reports': '/api/reports'
            }
        })

    # Error Handlers
    @app.errorhandler(404)
    def handle_404(e):
        if request.path.startswith('/api/'):
            return jsonify({'success': False, 'message': 'API endpoint not found.'}), 404
        return send_from_directory(frontend_folder, 'index.html')

    @app.errorhandler(500)
    def handle_500(e):
        return jsonify({'success': False, 'message': 'Internal server error occurred.'}), 500

    return app

if __name__ == '__main__':
    from backend.config import HOST, PORT
    application = create_app()
    port_display = f":{PORT}" if PORT != 80 else ""
    print(f"================================================================")
    print(f" Digital Urban Greenery Management System")
    print(f" Server running at: http://localhost{port_display} (or http://127.0.0.1{port_display})")
    print(f" API documentation root: http://localhost{port_display}/api")
    print(f" Default Admin Credentials: username 'admin' | password 'admin123'")
    print(f"================================================================")
    application.run(host=HOST, port=PORT, debug=DEBUG)

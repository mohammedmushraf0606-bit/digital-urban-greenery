"""
===================================================================
Digital Urban Greenery Management System - Simple College Demo
Single-file self-contained application for quick viva/presentation.
Run with: python simple_app.py
===================================================================
"""
import sqlite3
from flask import Flask, jsonify, request, render_template_string

app = Flask(__name__)
DB_NAME = "greenery_demo.db"

# ----------------- 1. DATABASE SETUP -----------------
def init_db():
    conn = sqlite3.connect(DB_NAME)
    cur = conn.cursor()
    # Create Parks table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS parks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            location TEXT NOT NULL,
            area_sq_m REAL NOT NULL
        )
    ''')
    # Create Trees table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS trees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tree_code TEXT UNIQUE NOT NULL,
            species TEXT NOT NULL,
            common_name TEXT NOT NULL,
            park_id INTEGER,
            age_years INTEGER,
            health_status TEXT NOT NULL,
            carbon_offset_kg REAL,
            FOREIGN KEY (park_id) REFERENCES parks(id)
        )
    ''')
    # Insert sample data if empty
    cur.execute("SELECT COUNT(*) FROM parks")
    if cur.fetchone()[0] == 0:
        cur.execute("INSERT INTO parks (name, location, area_sq_m) VALUES ('Central Botanical Park', 'Sector 14', 45000)")
        cur.execute("INSERT INTO parks (name, location, area_sq_m) VALUES ('Riverside Eco Park', 'River Promenade', 32000)")
        cur.execute("INSERT INTO trees (tree_code, species, common_name, park_id, age_years, health_status, carbon_offset_kg) VALUES ('TR-001', 'Azadirachta indica', 'Neem Tree', 1, 12, 'Healthy', 28.5)")
        cur.execute("INSERT INTO trees (tree_code, species, common_name, park_id, age_years, health_status, carbon_offset_kg) VALUES ('TR-002', 'Ficus religiosa', 'Peepal Tree', 1, 20, 'Healthy', 45.0)")
        cur.execute("INSERT INTO trees (tree_code, species, common_name, park_id, age_years, health_status, carbon_offset_kg) VALUES ('TR-003', 'Delonix regia', 'Gulmohar', 2, 8, 'Fair', 18.2)")
    conn.commit()
    conn.close()

# Helper function to query database
def query_db(query, args=()):
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute(query, args)
    rows = [dict(row) for row in cur.fetchall()]
    conn.close()
    return rows

# ----------------- 2. BACKEND REST APIS -----------------

# Dashboard Stats API
@app.route('/api/stats', methods=['GET'])
def get_stats():
    total_parks = query_db("SELECT COUNT(*) as c FROM parks")[0]['c']
    total_trees = query_db("SELECT COUNT(*) as c FROM trees")[0]['c']
    total_carbon = query_db("SELECT COALESCE(SUM(carbon_offset_kg), 0) as s FROM trees")[0]['s']
    return jsonify({
        'total_parks': total_parks,
        'total_trees': total_trees,
        'total_carbon_kg': total_carbon
    })

# List Trees API
@app.route('/api/trees', methods=['GET'])
def get_trees():
    trees = query_db("SELECT t.*, p.name as park_name FROM trees t LEFT JOIN parks p ON t.park_id = p.id ORDER BY t.id DESC")
    return jsonify(trees)

# Add Tree API
@app.route('/api/trees', methods=['POST'])
def add_tree():
    data = request.json or {}
    code = data.get('tree_code', '').strip()
    species = data.get('species', '').strip()
    name = data.get('common_name', '').strip()
    age = int(data.get('age_years', 5))
    health = data.get('health_status', 'Healthy')
    
    # Simple carbon sequestration formula: 10kg base + (age * 1.5kg)
    carbon = 10.0 + (age * 1.5)

    conn = sqlite3.connect(DB_NAME)
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO trees (tree_code, species, common_name, park_id, age_years, health_status, carbon_offset_kg) VALUES (?, ?, ?, 1, ?, ?, ?)",
        (code, species, name, age, health, carbon)
    )
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Tree registered successfully!'}), 201

# ----------------- 3. SIMPLE FRONTEND HTML & JS -----------------
HTML_PAGE = """
<!DOCTYPE html>
<html>
<head>
    <title>Urban Greenery - Simple Demo</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { background-color: #f8fafc; font-family: sans-serif; padding: 20px; }
        .card-stat { border-left: 4px solid #10b981; }
    </style>
</head>
<body class="container">
    <div class="my-4">
        <h2 class="text-success fw-bold">🌿 Digital Urban Greenery Management System</h2>
        <p class="text-muted">Simple Full-Stack Demonstration (Frontend + Flask Backend + SQLite)</p>
    </div>

    <!-- Dashboard KPI Cards -->
    <div class="row g-3 mb-4">
        <div class="col-md-4">
            <div class="card card-stat shadow-sm p-3">
                <div class="text-muted small">Total Parks</div>
                <h3 id="statParks" class="fw-bold mb-0">--</h3>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card card-stat shadow-sm p-3">
                <div class="text-muted small">Total Trees Cataloged</div>
                <h3 id="statTrees" class="fw-bold mb-0 text-success">--</h3>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card card-stat shadow-sm p-3">
                <div class="text-muted small">Total Carbon Absorption</div>
                <h3 id="statCarbon" class="fw-bold mb-0 text-primary">-- kg/yr</h3>
            </div>
        </div>
    </div>

    <!-- Tree Inventory Table & Add Form -->
    <div class="row g-4">
        <div class="col-md-8">
            <div class="card shadow-sm p-3">
                <h5 class="fw-bold mb-3">Tree Inventory Records</h5>
                <table class="table table-hover">
                    <thead class="table-light">
                        <tr>
                            <th>Code</th>
                            <th>Common Name</th>
                            <th>Botanical Species</th>
                            <th>Health</th>
                            <th>Carbon Offset</th>
                        </tr>
                    </thead>
                    <tbody id="treeTableBody">
                        <tr><td colspan="5" class="text-center">Loading...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="col-md-4">
            <div class="card shadow-sm p-3">
                <h5 class="fw-bold mb-3">Register New Tree</h5>
                <form id="treeForm" onsubmit="saveTree(event)">
                    <div class="mb-2">
                        <label class="small text-muted">Tree Code</label>
                        <input type="text" id="treeCode" class="form-control" placeholder="e.g. TR-105" required>
                    </div>
                    <div class="mb-2">
                        <label class="small text-muted">Common Name</label>
                        <input type="text" id="commonName" class="form-control" placeholder="e.g. Banyan Tree" required>
                    </div>
                    <div class="mb-2">
                        <label class="small text-muted">Botanical Species</label>
                        <input type="text" id="species" class="form-control" placeholder="e.g. Ficus benghalensis" required>
                    </div>
                    <div class="mb-2">
                        <label class="small text-muted">Estimated Age (Years)</label>
                        <input type="number" id="ageYears" class="form-control" value="5" required>
                    </div>
                    <div class="mb-3">
                        <label class="small text-muted">Health Condition</label>
                        <select id="healthStatus" class="form-select">
                            <option value="Healthy">Healthy</option>
                            <option value="Fair">Fair</option>
                            <option value="Poor">Poor</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-success w-100">+ Register Tree</button>
                </form>
            </div>
        </div>
    </div>

    <!-- Simple JavaScript Client -->
    <script>
        // Fetch dashboard statistics
        async function loadStats() {
            const res = await fetch('/api/stats');
            const data = await res.json();
            document.getElementById('statParks').textContent = data.total_parks;
            document.getElementById('statTrees').textContent = data.total_trees;
            document.getElementById('statCarbon').textContent = data.total_carbon_kg + ' kg';
        }

        // Fetch and display trees table
        async function loadTrees() {
            const res = await fetch('/api/trees');
            const trees = await res.json();
            const tbody = document.getElementById('treeTableBody');
            tbody.innerHTML = trees.map(t => `
                <tr>
                    <td><strong>${t.tree_code}</strong></td>
                    <td>${t.common_name}</td>
                    <td><em>${t.species}</em></td>
                    <td><span class="badge ${t.health_status === 'Healthy' ? 'bg-success' : 'bg-warning'}">${t.health_status}</span></td>
                    <td><strong>${t.carbon_offset_kg} kg/yr</strong></td>
                </tr>
            `).join('');
        }

        // Add tree using POST request
        async function saveTree(e) {
            e.preventDefault();
            const payload = {
                tree_code: document.getElementById('treeCode').value,
                common_name: document.getElementById('commonName').value,
                species: document.getElementById('species').value,
                age_years: document.getElementById('ageYears').value,
                health_status: document.getElementById('healthStatus').value
            };
            await fetch('/api/trees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            document.getElementById('treeForm').reset();
            loadStats();
            loadTrees();
        }

        // Initialize on page load
        loadStats();
        loadTrees();
    </script>
</body>
</html>
"""

@app.route('/')
def home():
    return render_template_string(HTML_PAGE)

if __name__ == '__main__':
    init_db()
    print("Simple demo running at: http://localhost:5001 (or http://127.0.0.1:5001)")
    app.run(port=5001, debug=True)

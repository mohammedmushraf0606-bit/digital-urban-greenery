import random
from flask import Blueprint, request, jsonify
from backend.database import query_db, execute_db

trees_bp = Blueprint('trees', __name__, url_prefix='/api/trees')

@trees_bp.route('', methods=['GET'])
def get_trees():
    search = request.args.get('search', '').strip()
    species = request.args.get('species', '').strip()
    health = request.args.get('health', '').strip()
    maint_status = request.args.get('maintenance_status', '').strip()
    park_id = request.args.get('park_id', '').strip()

    query = (
        "SELECT t.*, p.name as park_name "
        "FROM trees t LEFT JOIN parks p ON t.park_id = p.id WHERE 1=1"
    )
    args = []

    if search:
        query += " AND (t.tree_code LIKE ? OR t.species LIKE ? OR t.common_name LIKE ? OR t.location_details LIKE ?)"
        wildcard = f"%{search}%"
        args.extend([wildcard, wildcard, wildcard, wildcard])

    if species:
        query += " AND t.species = ?"
        args.append(species)

    if health:
        query += " AND t.health_status = ?"
        args.append(health)

    if maint_status:
        query += " AND t.maintenance_status = ?"
        args.append(maint_status)

    if park_id:
        try:
            query += " AND t.park_id = ?"
            args.append(int(park_id))
        except ValueError:
            pass

    query += " ORDER BY t.id DESC"
    trees = query_db(query, args)
    return jsonify({'success': True, 'count': len(trees), 'data': trees}), 200

@trees_bp.route('/<int:tree_id>', methods=['GET'])
def get_tree(tree_id):
    tree = query_db(
        "SELECT t.*, p.name as park_name "
        "FROM trees t LEFT JOIN parks p ON t.park_id = p.id WHERE t.id = ?",
        (tree_id,),
        one=True
    )
    if not tree:
        return jsonify({'success': False, 'message': 'Tree record not found.'}), 404
    return jsonify({'success': True, 'data': tree}), 200

@trees_bp.route('/species-list', methods=['GET'])
def get_species_list():
    species = query_db("SELECT DISTINCT species, common_name FROM trees ORDER BY species ASC")
    return jsonify({'success': True, 'data': species}), 200

@trees_bp.route('', methods=['POST'])
def add_tree():
    data = request.get_json() or {}
    tree_code = data.get('tree_code', '').strip()
    species = data.get('species', '').strip()
    common_name = data.get('common_name', '').strip()
    location_details = data.get('location_details', '').strip()
    health_status = data.get('health_status', 'Healthy').strip()
    maintenance_status = data.get('maintenance_status', 'Routine').strip()

    # Generate tree_code if not supplied
    if not tree_code:
        rand_num = random.randint(100, 999)
        tree_code = f"TR-2026-{rand_num}"

    # Validation
    errors = []
    if not species:
        errors.append('Botanical/Species name is required.')
    if not common_name:
        errors.append('Common name is required.')
    if not location_details:
        errors.append('Location details are required.')

    # Check tree_code uniqueness
    existing = query_db("SELECT id FROM trees WHERE tree_code = ?", (tree_code,), one=True)
    if existing:
        errors.append(f"Tree ID '{tree_code}' already exists. Please provide a unique code.")

    if errors:
        return jsonify({'success': False, 'message': 'Validation failed.', 'errors': errors}), 400

    park_id = data.get('park_id')
    if park_id in (None, '', 'null'):
        park_id = None
    else:
        try:
            park_id = int(park_id)
        except ValueError:
            park_id = None

    age_years = data.get('age_years')
    height_m = data.get('height_m')
    canopy_diameter_m = data.get('canopy_diameter_m')
    carbon_offset_kg = data.get('carbon_offset_kg')
    planted_date = data.get('planted_date') or None

    # Fallback carbon calculation: average 21.8 kg CO2 per mature tree per year
    if carbon_offset_kg is None or carbon_offset_kg == '':
        try:
            age = float(age_years) if age_years else 5.0
            height = float(height_m) if height_m else 5.0
            carbon_offset_kg = round(10.0 + (age * 1.5) + (height * 0.8), 1)
        except (ValueError, TypeError):
            carbon_offset_kg = 22.0

    try:
        last_id, _ = execute_db(
            "INSERT INTO trees (tree_code, species, common_name, park_id, location_details, "
            "age_years, height_m, canopy_diameter_m, health_status, maintenance_status, "
            "carbon_offset_kg, planted_date) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (tree_code, species, common_name, park_id, location_details,
             age_years, height_m, canopy_diameter_m, health_status, maintenance_status,
             carbon_offset_kg, planted_date)
        )
        new_tree = query_db(
            "SELECT t.*, p.name as park_name FROM trees t LEFT JOIN parks p ON t.park_id = p.id WHERE t.id = ?",
            (last_id,),
            one=True
        )
        return jsonify({'success': True, 'message': 'Tree registered successfully.', 'data': new_tree}), 201

    except Exception as e:
        return jsonify({'success': False, 'message': f"Database error: {str(e)}"}), 500

@trees_bp.route('/<int:tree_id>', methods=['PUT'])
def update_tree(tree_id):
    tree = query_db("SELECT * FROM trees WHERE id = ?", (tree_id,), one=True)
    if not tree:
        return jsonify({'success': False, 'message': 'Tree record not found.'}), 404

    data = request.get_json() or {}
    tree_code = data.get('tree_code', tree['tree_code']).strip()
    species = data.get('species', tree['species']).strip()
    common_name = data.get('common_name', tree['common_name']).strip()
    location_details = data.get('location_details', tree['location_details']).strip()
    health_status = data.get('health_status', tree['health_status']).strip()
    maintenance_status = data.get('maintenance_status', tree['maintenance_status']).strip()

    # Check tree_code uniqueness if changed
    if tree_code != tree['tree_code']:
        existing = query_db("SELECT id FROM trees WHERE tree_code = ? AND id != ?", (tree_code, tree_id), one=True)
        if existing:
            return jsonify({'success': False, 'message': f"Tree code '{tree_code}' is already used by another record."}), 400

    park_id = data.get('park_id', tree['park_id'])
    if park_id in (None, '', 'null'):
        park_id = None
    else:
        try:
            park_id = int(park_id)
        except ValueError:
            park_id = None

    age_years = data.get('age_years', tree['age_years'])
    height_m = data.get('height_m', tree['height_m'])
    canopy_diameter_m = data.get('canopy_diameter_m', tree['canopy_diameter_m'])
    carbon_offset_kg = data.get('carbon_offset_kg', tree['carbon_offset_kg'])
    planted_date = data.get('planted_date', tree['planted_date'])

    try:
        execute_db(
            "UPDATE trees SET tree_code = ?, species = ?, common_name = ?, park_id = ?, "
            "location_details = ?, age_years = ?, height_m = ?, canopy_diameter_m = ?, "
            "health_status = ?, maintenance_status = ?, carbon_offset_kg = ?, planted_date = ?, "
            "updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (tree_code, species, common_name, park_id, location_details,
             age_years, height_m, canopy_diameter_m, health_status, maintenance_status,
             carbon_offset_kg, planted_date, tree_id)
        )
        updated_tree = query_db(
            "SELECT t.*, p.name as park_name FROM trees t LEFT JOIN parks p ON t.park_id = p.id WHERE t.id = ?",
            (tree_id,),
            one=True
        )
        return jsonify({'success': True, 'message': 'Tree details updated successfully.', 'data': updated_tree}), 200

    except Exception as e:
        return jsonify({'success': False, 'message': f"Database error: {str(e)}"}), 500

@trees_bp.route('/<int:tree_id>', methods=['DELETE'])
def delete_tree(tree_id):
    tree = query_db("SELECT * FROM trees WHERE id = ?", (tree_id,), one=True)
    if not tree:
        return jsonify({'success': False, 'message': 'Tree record not found.'}), 404

    try:
        execute_db("DELETE FROM trees WHERE id = ?", (tree_id,))
        return jsonify({'success': True, 'message': f"Tree '{tree['tree_code']}' deleted successfully."}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f"Database error: {str(e)}"}), 500

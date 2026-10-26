from flask import Blueprint, request, jsonify
from backend.database import query_db, execute_db

urban_forests_bp = Blueprint('urban_forests', __name__, url_prefix='/api/urban-forests')

@urban_forests_bp.route('', methods=['GET'])
def get_urban_forests():
    search = request.args.get('search', '').strip()
    density = request.args.get('density', '').strip()

    query = "SELECT * FROM urban_forests WHERE 1=1"
    args = []

    if search:
        query += " AND (forest_name LIKE ? OR location LIKE ? OR forest_type LIKE ?)"
        wildcard = f"%{search}%"
        args.extend([wildcard, wildcard, wildcard])

    if density:
        query += " AND canopy_density = ?"
        args.append(density)

    query += " ORDER BY id DESC"
    forests = query_db(query, args)
    return jsonify({'success': True, 'count': len(forests), 'data': forests}), 200

@urban_forests_bp.route('/<int:forest_id>', methods=['GET'])
def get_urban_forest(forest_id):
    forest = query_db("SELECT * FROM urban_forests WHERE id = ?", (forest_id,), one=True)
    if not forest:
        return jsonify({'success': False, 'message': 'Urban forest not found.'}), 404
    return jsonify({'success': True, 'data': forest}), 200

@urban_forests_bp.route('', methods=['POST'])
def add_urban_forest():
    data = request.get_json() or {}
    forest_name = data.get('forest_name', '').strip()
    location = data.get('location', '').strip()
    area_hectares = data.get('area_hectares')

    errors = []
    if not forest_name:
        errors.append('Forest name is required.')
    if not location:
        errors.append('Location is required.')
    if area_hectares is None or area_hectares == '':
        errors.append('Area in hectares is required.')
    else:
        try:
            area_hectares = float(area_hectares)
            if area_hectares <= 0:
                errors.append('Area must be greater than 0.')
        except ValueError:
            errors.append('Area must be a valid number.')

    if errors:
        return jsonify({'success': False, 'message': 'Validation failed.', 'errors': errors}), 400

    tree_count = int(data.get('tree_count', 0) or 0)
    biodiversity_index = float(data.get('biodiversity_index', 3.5) or 3.5)
    canopy_density = data.get('canopy_density', 'Medium').strip()
    forest_type = data.get('forest_type', 'Miyawaki Forest').strip()
    maintenance_status = data.get('maintenance_status', 'Active').strip()
    established_year = data.get('established_year') or None
    remarks = data.get('remarks', '').strip()

    try:
        last_id, _ = execute_db(
            "INSERT INTO urban_forests (forest_name, location, area_hectares, tree_count, "
            "biodiversity_index, canopy_density, forest_type, maintenance_status, established_year, remarks) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (forest_name, location, area_hectares, tree_count, biodiversity_index,
             canopy_density, forest_type, maintenance_status, established_year, remarks)
        )
        new_forest = query_db("SELECT * FROM urban_forests WHERE id = ?", (last_id,), one=True)
        return jsonify({'success': True, 'message': 'Urban forest added successfully.', 'data': new_forest}), 201

    except Exception as e:
        return jsonify({'success': False, 'message': f"Database error: {str(e)}"}), 500

@urban_forests_bp.route('/<int:forest_id>', methods=['PUT'])
def update_urban_forest(forest_id):
    forest = query_db("SELECT * FROM urban_forests WHERE id = ?", (forest_id,), one=True)
    if not forest:
        return jsonify({'success': False, 'message': 'Urban forest not found.'}), 404

    data = request.get_json() or {}
    forest_name = data.get('forest_name', forest['forest_name']).strip()
    location = data.get('location', forest['location']).strip()
    area_hectares = data.get('area_hectares', forest['area_hectares'])
    tree_count = data.get('tree_count', forest['tree_count'])
    biodiversity_index = data.get('biodiversity_index', forest['biodiversity_index'])
    canopy_density = data.get('canopy_density', forest['canopy_density'])
    forest_type = data.get('forest_type', forest['forest_type'])
    maintenance_status = data.get('maintenance_status', forest['maintenance_status'])
    established_year = data.get('established_year', forest['established_year'])
    remarks = data.get('remarks', forest['remarks'])

    try:
        area_hectares = float(area_hectares)
        tree_count = int(tree_count or 0)
        biodiversity_index = float(biodiversity_index or 3.5)
    except (ValueError, TypeError):
        return jsonify({'success': False, 'message': 'Invalid numerical values.'}), 400

    try:
        execute_db(
            "UPDATE urban_forests SET forest_name = ?, location = ?, area_hectares = ?, "
            "tree_count = ?, biodiversity_index = ?, canopy_density = ?, forest_type = ?, "
            "maintenance_status = ?, established_year = ?, remarks = ?, updated_at = CURRENT_TIMESTAMP "
            "WHERE id = ?",
            (forest_name, location, area_hectares, tree_count, biodiversity_index,
             canopy_density, forest_type, maintenance_status, established_year, remarks, forest_id)
        )
        updated = query_db("SELECT * FROM urban_forests WHERE id = ?", (forest_id,), one=True)
        return jsonify({'success': True, 'message': 'Urban forest updated successfully.', 'data': updated}), 200

    except Exception as e:
        return jsonify({'success': False, 'message': f"Database error: {str(e)}"}), 500

@urban_forests_bp.route('/<int:forest_id>', methods=['DELETE'])
def delete_urban_forest(forest_id):
    forest = query_db("SELECT * FROM urban_forests WHERE id = ?", (forest_id,), one=True)
    if not forest:
        return jsonify({'success': False, 'message': 'Urban forest not found.'}), 404

    try:
        execute_db("DELETE FROM urban_forests WHERE id = ?", (forest_id,))
        return jsonify({'success': True, 'message': f"Urban forest '{forest['forest_name']}' deleted successfully."}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f"Database error: {str(e)}"}), 500

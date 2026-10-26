from flask import Blueprint, request, jsonify
from backend.database import query_db, execute_db

parks_bp = Blueprint('parks', __name__, url_prefix='/api/parks')

@parks_bp.route('', methods=['GET'])
def get_parks():
    search = request.args.get('search', '').strip()
    park_type = request.args.get('type', '').strip()
    status = request.args.get('status', '').strip()

    query = (
        "SELECT p.*, "
        "(SELECT COUNT(*) FROM trees t WHERE t.park_id = p.id) as tree_count "
        "FROM parks p WHERE 1=1"
    )
    args = []

    if search:
        query += " AND (p.name LIKE ? OR p.location LIKE ? OR p.ward_no LIKE ? OR p.facilities LIKE ?)"
        wildcard = f"%{search}%"
        args.extend([wildcard, wildcard, wildcard, wildcard])

    if park_type:
        query += " AND p.park_type = ?"
        args.append(park_type)

    if status:
        query += " AND p.status = ?"
        args.append(status)

    query += " ORDER BY p.id DESC"
    parks = query_db(query, args)
    return jsonify({'success': True, 'count': len(parks), 'data': parks}), 200

@parks_bp.route('/<int:park_id>', methods=['GET'])
def get_park(park_id):
    park = query_db(
        "SELECT p.*, "
        "(SELECT COUNT(*) FROM trees t WHERE t.park_id = p.id) as tree_count "
        "FROM parks p WHERE p.id = ?",
        (park_id,),
        one=True
    )
    if not park:
        return jsonify({'success': False, 'message': 'Park not found.'}), 404

    # Fetch trees in this park
    trees = query_db("SELECT * FROM trees WHERE park_id = ? ORDER BY id DESC", (park_id,))
    park_dict = dict(park)
    park_dict['trees'] = trees

    return jsonify({'success': True, 'data': park_dict}), 200

@parks_bp.route('', methods=['POST'])
def add_park():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    location = data.get('location', '').strip()
    area_sq_m = data.get('area_sq_m')
    park_type = data.get('park_type', '').strip()

    # Validation
    errors = []
    if not name:
        errors.append('Park name is required.')
    if not location:
        errors.append('Location is required.')
    if area_sq_m is None or area_sq_m == '':
        errors.append('Area in square meters is required.')
    else:
        try:
            area_sq_m = float(area_sq_m)
            if area_sq_m <= 0:
                errors.append('Area must be greater than 0.')
        except ValueError:
            errors.append('Area must be a valid number.')

    if not park_type:
        errors.append('Park type is required.')

    if errors:
        return jsonify({'success': False, 'message': 'Validation failed.', 'errors': errors}), 400

    ward_no = data.get('ward_no', '').strip()
    established_year = data.get('established_year') or None
    contact_officer = data.get('contact_officer', '').strip()
    contact_phone = data.get('contact_phone', '').strip()
    facilities = data.get('facilities', '').strip()
    status = data.get('status', 'Active').strip()
    maintenance_status = data.get('maintenance_status', 'Good').strip()

    try:
        last_id, _ = execute_db(
            "INSERT INTO parks (name, location, ward_no, area_sq_m, park_type, established_year, "
            "contact_officer, contact_phone, facilities, status, maintenance_status) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (name, location, ward_no, area_sq_m, park_type, established_year,
             contact_officer, contact_phone, facilities, status, maintenance_status)
        )
        new_park = query_db("SELECT * FROM parks WHERE id = ?", (last_id,), one=True)
        return jsonify({'success': True, 'message': 'Park added successfully.', 'data': new_park}), 201

    except Exception as e:
        return jsonify({'success': False, 'message': f"Database error: {str(e)}"}), 500

@parks_bp.route('/<int:park_id>', methods=['PUT'])
def update_park(park_id):
    park = query_db("SELECT * FROM parks WHERE id = ?", (park_id,), one=True)
    if not park:
        return jsonify({'success': False, 'message': 'Park not found.'}), 404

    data = request.get_json() or {}
    name = data.get('name', park['name']).strip()
    location = data.get('location', park['location']).strip()
    ward_no = data.get('ward_no', park['ward_no'])
    area_sq_m = data.get('area_sq_m', park['area_sq_m'])
    park_type = data.get('park_type', park['park_type'])
    established_year = data.get('established_year', park['established_year'])
    contact_officer = data.get('contact_officer', park['contact_officer'])
    contact_phone = data.get('contact_phone', park['contact_phone'])
    facilities = data.get('facilities', park['facilities'])
    status = data.get('status', park['status'])
    maintenance_status = data.get('maintenance_status', park['maintenance_status'])

    try:
        area_sq_m = float(area_sq_m)
    except (ValueError, TypeError):
        return jsonify({'success': False, 'message': 'Area must be a valid number.'}), 400

    try:
        execute_db(
            "UPDATE parks SET name = ?, location = ?, ward_no = ?, area_sq_m = ?, park_type = ?, "
            "established_year = ?, contact_officer = ?, contact_phone = ?, facilities = ?, "
            "status = ?, maintenance_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (name, location, ward_no, area_sq_m, park_type, established_year,
             contact_officer, contact_phone, facilities, status, maintenance_status, park_id)
        )
        updated_park = query_db("SELECT * FROM parks WHERE id = ?", (park_id,), one=True)
        return jsonify({'success': True, 'message': 'Park updated successfully.', 'data': updated_park}), 200

    except Exception as e:
        return jsonify({'success': False, 'message': f"Database error: {str(e)}"}), 500

@parks_bp.route('/<int:park_id>', methods=['DELETE'])
def delete_park(park_id):
    park = query_db("SELECT * FROM parks WHERE id = ?", (park_id,), one=True)
    if not park:
        return jsonify({'success': False, 'message': 'Park not found.'}), 404

    try:
        execute_db("DELETE FROM parks WHERE id = ?", (park_id,))
        return jsonify({'success': True, 'message': f"Park '{park['name']}' deleted successfully."}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f"Database error: {str(e)}"}), 500

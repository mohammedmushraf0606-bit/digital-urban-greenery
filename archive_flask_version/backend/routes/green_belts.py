from flask import Blueprint, request, jsonify
from backend.database import query_db, execute_db

green_belts_bp = Blueprint('green_belts', __name__, url_prefix='/api/green-belts')

@green_belts_bp.route('', methods=['GET'])
def get_green_belts():
    search = request.args.get('search', '').strip()
    status = request.args.get('status', '').strip()

    query = "SELECT * FROM green_belts WHERE 1=1"
    args = []

    if search:
        query += " AND (belt_name LIKE ? OR location LIKE ? OR vegetation_type LIKE ? OR buffer_type LIKE ?)"
        wildcard = f"%{search}%"
        args.extend([wildcard, wildcard, wildcard, wildcard])

    if status:
        query += " AND status = ?"
        args.append(status)

    query += " ORDER BY id DESC"
    belts = query_db(query, args)
    return jsonify({'success': True, 'count': len(belts), 'data': belts}), 200

@green_belts_bp.route('/<int:belt_id>', methods=['GET'])
def get_green_belt(belt_id):
    belt = query_db("SELECT * FROM green_belts WHERE id = ?", (belt_id,), one=True)
    if not belt:
        return jsonify({'success': False, 'message': 'Green belt record not found.'}), 404
    return jsonify({'success': True, 'data': belt}), 200

@green_belts_bp.route('', methods=['POST'])
def add_green_belt():
    data = request.get_json() or {}
    belt_name = data.get('belt_name', '').strip()
    location = data.get('location', '').strip()
    length_km = data.get('length_km')
    width_m = data.get('width_m')
    vegetation_type = data.get('vegetation_type', '').strip()

    errors = []
    if not belt_name:
        errors.append('Green belt name is required.')
    if not location:
        errors.append('Location is required.')
    if length_km is None or length_km == '':
        errors.append('Length in kilometers is required.')
    if width_m is None or width_m == '':
        errors.append('Width in meters is required.')
    if not vegetation_type:
        errors.append('Vegetation type is required.')

    try:
        length_km = float(length_km)
        width_m = float(width_m)
        if length_km <= 0 or width_m <= 0:
            errors.append('Dimensions must be positive values.')
    except (ValueError, TypeError):
        errors.append('Dimensions must be valid numbers.')

    if errors:
        return jsonify({'success': False, 'message': 'Validation failed.', 'errors': errors}), 400

    # Calculate area in sq meters: length (m) * width (m)
    area_sq_m = data.get('area_sq_m')
    if area_sq_m is None or area_sq_m == '':
        area_sq_m = length_km * 1000.0 * width_m
    else:
        area_sq_m = float(area_sq_m)

    buffer_type = data.get('buffer_type', 'Roadside').strip()
    status = data.get('status', 'Healthy').strip()
    maintenance_frequency = data.get('maintenance_frequency', 'Bi-weekly').strip()
    remarks = data.get('remarks', '').strip()

    try:
        last_id, _ = execute_db(
            "INSERT INTO green_belts (belt_name, location, length_km, width_m, area_sq_m, "
            "vegetation_type, buffer_type, status, maintenance_frequency, remarks) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (belt_name, location, length_km, width_m, area_sq_m,
             vegetation_type, buffer_type, status, maintenance_frequency, remarks)
        )
        new_belt = query_db("SELECT * FROM green_belts WHERE id = ?", (last_id,), one=True)
        return jsonify({'success': True, 'message': 'Green belt registered successfully.', 'data': new_belt}), 201

    except Exception as e:
        return jsonify({'success': False, 'message': f"Database error: {str(e)}"}), 500

@green_belts_bp.route('/<int:belt_id>', methods=['PUT'])
def update_green_belt(belt_id):
    belt = query_db("SELECT * FROM green_belts WHERE id = ?", (belt_id,), one=True)
    if not belt:
        return jsonify({'success': False, 'message': 'Green belt record not found.'}), 404

    data = request.get_json() or {}
    belt_name = data.get('belt_name', belt['belt_name']).strip()
    location = data.get('location', belt['location']).strip()
    length_km = data.get('length_km', belt['length_km'])
    width_m = data.get('width_m', belt['width_m'])
    vegetation_type = data.get('vegetation_type', belt['vegetation_type']).strip()
    buffer_type = data.get('buffer_type', belt['buffer_type']).strip()
    status = data.get('status', belt['status']).strip()
    maintenance_frequency = data.get('maintenance_frequency', belt['maintenance_frequency']).strip()
    remarks = data.get('remarks', belt['remarks'])

    try:
        length_km = float(length_km)
        width_m = float(width_m)
        area_sq_m = length_km * 1000.0 * width_m
    except (ValueError, TypeError):
        return jsonify({'success': False, 'message': 'Invalid numerical dimensions.'}), 400

    try:
        execute_db(
            "UPDATE green_belts SET belt_name = ?, location = ?, length_km = ?, width_m = ?, "
            "area_sq_m = ?, vegetation_type = ?, buffer_type = ?, status = ?, "
            "maintenance_frequency = ?, remarks = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (belt_name, location, length_km, width_m, area_sq_m,
             vegetation_type, buffer_type, status, maintenance_frequency, remarks, belt_id)
        )
        updated = query_db("SELECT * FROM green_belts WHERE id = ?", (belt_id,), one=True)
        return jsonify({'success': True, 'message': 'Green belt record updated successfully.', 'data': updated}), 200

    except Exception as e:
        return jsonify({'success': False, 'message': f"Database error: {str(e)}"}), 500

@green_belts_bp.route('/<int:belt_id>', methods=['DELETE'])
def delete_green_belt(belt_id):
    belt = query_db("SELECT * FROM green_belts WHERE id = ?", (belt_id,), one=True)
    if not belt:
        return jsonify({'success': False, 'message': 'Green belt record not found.'}), 404

    try:
        execute_db("DELETE FROM green_belts WHERE id = ?", (belt_id,))
        return jsonify({'success': True, 'message': f"Green belt '{belt['belt_name']}' deleted successfully."}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f"Database error: {str(e)}"}), 500

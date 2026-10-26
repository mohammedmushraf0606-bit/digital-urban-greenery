from flask import Blueprint, request, jsonify
from backend.database import query_db, execute_db

maintenance_bp = Blueprint('maintenance', __name__, url_prefix='/api/maintenance')

@maintenance_bp.route('', methods=['GET'])
def get_maintenance_activities():
    status = request.args.get('status', '').strip()
    target_type = request.args.get('target_type', '').strip()
    activity_type = request.args.get('activity_type', '').strip()
    search = request.args.get('search', '').strip()

    query = "SELECT * FROM maintenance WHERE 1=1"
    args = []

    if status:
        query += " AND status = ?"
        args.append(status)

    if target_type:
        query += " AND target_type = ?"
        args.append(target_type)

    if activity_type:
        query += " AND activity_type = ?"
        args.append(activity_type)

    if search:
        query += " AND (activity_title LIKE ? OR target_name LIKE ? OR responsible_person LIKE ? OR remarks LIKE ?)"
        wildcard = f"%{search}%"
        args.extend([wildcard, wildcard, wildcard, wildcard])

    query += " ORDER BY scheduled_date DESC, id DESC"
    activities = query_db(query, args)
    return jsonify({'success': True, 'count': len(activities), 'data': activities}), 200

@maintenance_bp.route('/<int:maint_id>', methods=['GET'])
def get_maintenance(maint_id):
    activity = query_db("SELECT * FROM maintenance WHERE id = ?", (maint_id,), one=True)
    if not activity:
        return jsonify({'success': False, 'message': 'Maintenance task not found.'}), 404
    return jsonify({'success': True, 'data': activity}), 200

@maintenance_bp.route('', methods=['POST'])
def add_maintenance():
    data = request.get_json() or {}
    activity_title = data.get('activity_title', '').strip()
    target_type = data.get('target_type', '').strip()
    target_name = data.get('target_name', '').strip()
    activity_type = data.get('activity_type', '').strip()
    scheduled_date = data.get('scheduled_date', '').strip()
    responsible_person = data.get('responsible_person', '').strip()

    errors = []
    if not activity_title:
        errors.append('Activity title is required.')
    if not target_type:
        errors.append('Target type (Park, Tree, Urban Forest, Green Belt) is required.')
    if not target_name:
        errors.append('Target entity name is required.')
    if not activity_type:
        errors.append('Activity type is required.')
    if not scheduled_date:
        errors.append('Scheduled date is required.')
    if not responsible_person:
        errors.append('Responsible person / team is required.')

    if errors:
        return jsonify({'success': False, 'message': 'Validation failed.', 'errors': errors}), 400

    target_id = data.get('target_id')
    if target_id in (None, '', 'null'):
        target_id = None
    else:
        try:
            target_id = int(target_id)
        except ValueError:
            target_id = None

    completion_date = data.get('completion_date') or None
    status = data.get('status', 'Scheduled').strip()
    cost = float(data.get('cost', 0.0) or 0.0)
    remarks = data.get('remarks', '').strip()

    try:
        last_id, _ = execute_db(
            "INSERT INTO maintenance (activity_title, target_type, target_id, target_name, "
            "activity_type, scheduled_date, completion_date, responsible_person, status, cost, remarks) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (activity_title, target_type, target_id, target_name, activity_type,
             scheduled_date, completion_date, responsible_person, status, cost, remarks)
        )
        new_activity = query_db("SELECT * FROM maintenance WHERE id = ?", (last_id,), one=True)
        return jsonify({'success': True, 'message': 'Maintenance task scheduled successfully.', 'data': new_activity}), 201

    except Exception as e:
        return jsonify({'success': False, 'message': f"Database error: {str(e)}"}), 500

@maintenance_bp.route('/<int:maint_id>', methods=['PUT'])
def update_maintenance(maint_id):
    activity = query_db("SELECT * FROM maintenance WHERE id = ?", (maint_id,), one=True)
    if not activity:
        return jsonify({'success': False, 'message': 'Maintenance task not found.'}), 404

    data = request.get_json() or {}
    activity_title = data.get('activity_title', activity['activity_title']).strip()
    target_type = data.get('target_type', activity['target_type']).strip()
    target_name = data.get('target_name', activity['target_name']).strip()
    activity_type = data.get('activity_type', activity['activity_type']).strip()
    scheduled_date = data.get('scheduled_date', activity['scheduled_date']).strip()
    completion_date = data.get('completion_date', activity['completion_date'])
    responsible_person = data.get('responsible_person', activity['responsible_person']).strip()
    status = data.get('status', activity['status']).strip()
    cost = float(data.get('cost', activity['cost']) or 0.0)
    remarks = data.get('remarks', activity['remarks'])

    try:
        execute_db(
            "UPDATE maintenance SET activity_title = ?, target_type = ?, target_name = ?, "
            "activity_type = ?, scheduled_date = ?, completion_date = ?, "
            "responsible_person = ?, status = ?, cost = ?, remarks = ?, updated_at = CURRENT_TIMESTAMP "
            "WHERE id = ?",
            (activity_title, target_type, target_name, activity_type, scheduled_date,
             completion_date, responsible_person, status, cost, remarks, maint_id)
        )
        updated = query_db("SELECT * FROM maintenance WHERE id = ?", (maint_id,), one=True)
        return jsonify({'success': True, 'message': 'Maintenance activity updated successfully.', 'data': updated}), 200

    except Exception as e:
        return jsonify({'success': False, 'message': f"Database error: {str(e)}"}), 500

@maintenance_bp.route('/<int:maint_id>/status', methods=['PATCH'])
def update_status(maint_id):
    activity = query_db("SELECT * FROM maintenance WHERE id = ?", (maint_id,), one=True)
    if not activity:
        return jsonify({'success': False, 'message': 'Maintenance task not found.'}), 404

    data = request.get_json() or {}
    new_status = data.get('status', '').strip()
    if new_status not in ('Scheduled', 'In Progress', 'Completed', 'Overdue'):
        return jsonify({'success': False, 'message': 'Invalid status option.'}), 400

    completion_date = data.get('completion_date')
    if new_status == 'Completed' and not completion_date:
        import datetime
        completion_date = datetime.date.today().isoformat()

    try:
        execute_db(
            "UPDATE maintenance SET status = ?, completion_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (new_status, completion_date, maint_id)
        )
        updated = query_db("SELECT * FROM maintenance WHERE id = ?", (maint_id,), one=True)
        return jsonify({'success': True, 'message': f"Status updated to '{new_status}'.", 'data': updated}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f"Database error: {str(e)}"}), 500

@maintenance_bp.route('/<int:maint_id>', methods=['DELETE'])
def delete_maintenance(maint_id):
    activity = query_db("SELECT * FROM maintenance WHERE id = ?", (maint_id,), one=True)
    if not activity:
        return jsonify({'success': False, 'message': 'Maintenance task not found.'}), 404

    try:
        execute_db("DELETE FROM maintenance WHERE id = ?", (maint_id,))
        return jsonify({'success': True, 'message': 'Maintenance task deleted successfully.'}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f"Database error: {str(e)}"}), 500

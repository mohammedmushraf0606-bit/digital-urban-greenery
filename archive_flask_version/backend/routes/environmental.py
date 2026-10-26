from flask import Blueprint, request, jsonify
from backend.database import query_db, execute_db

environmental_bp = Blueprint('environmental', __name__, url_prefix='/api/environmental')

@environmental_bp.route('', methods=['GET'])
def get_environmental_records():
    zone = request.args.get('zone', '').strip()
    start_date = request.args.get('start_date', '').strip()
    end_date = request.args.get('end_date', '').strip()

    query = "SELECT * FROM environmental_indicators WHERE 1=1"
    args = []

    if zone:
        query += " AND zone_name LIKE ?"
        args.append(f"%{zone}%")

    if start_date:
        query += " AND record_date >= ?"
        args.append(start_date)

    if end_date:
        query += " AND record_date <= ?"
        args.append(end_date)

    query += " ORDER BY record_date DESC, id DESC"
    records = query_db(query, args)
    return jsonify({'success': True, 'count': len(records), 'data': records}), 200

@environmental_bp.route('/<int:record_id>', methods=['GET'])
def get_environmental_record(record_id):
    record = query_db("SELECT * FROM environmental_indicators WHERE id = ?", (record_id,), one=True)
    if not record:
        return jsonify({'success': False, 'message': 'Environmental indicator record not found.'}), 404
    return jsonify({'success': True, 'data': record}), 200

@environmental_bp.route('/analytics', methods=['GET'])
def get_analytics():
    """Return aggregated indicators, averages, and time-series for charts."""
    zones = query_db("SELECT DISTINCT zone_name FROM environmental_indicators ORDER BY zone_name ASC")

    # Time series for charts
    trends = query_db(
        "SELECT record_date, AVG(air_quality_index) as aqi, "
        "AVG(green_coverage_percentage) as green_coverage, "
        "SUM(carbon_absorbed_tonnes) as carbon_total, "
        "AVG(tree_survival_rate) as survival_rate, "
        "AVG(environmental_score) as eco_score "
        "FROM environmental_indicators "
        "GROUP BY record_date ORDER BY record_date ASC"
    )

    # Zone-wise summary
    zone_stats = query_db(
        "SELECT zone_name, "
        "ROUND(AVG(air_quality_index), 1) as avg_aqi, "
        "ROUND(AVG(green_coverage_percentage), 1) as avg_green_coverage, "
        "ROUND(AVG(carbon_absorbed_tonnes), 1) as avg_carbon, "
        "ROUND(AVG(tree_survival_rate), 1) as avg_survival, "
        "ROUND(AVG(environmental_score), 1) as avg_score "
        "FROM environmental_indicators "
        "GROUP BY zone_name"
    )

    # Averages
    overall = query_db(
        "SELECT ROUND(AVG(air_quality_index), 1) as avg_aqi, "
        "ROUND(AVG(green_coverage_percentage), 1) as avg_coverage, "
        "ROUND(SUM(carbon_absorbed_tonnes), 1) as total_carbon, "
        "ROUND(AVG(tree_survival_rate), 1) as avg_survival, "
        "ROUND(AVG(environmental_score), 1) as avg_score, "
        "ROUND(SUM(water_usage_cubic_m), 1) as total_water "
        "FROM environmental_indicators",
        one=True
    )

    return jsonify({
        'success': True,
        'overall': overall,
        'trends': trends,
        'zone_stats': zone_stats,
        'zones': [z['zone_name'] for z in zones]
    }), 200

@environmental_bp.route('', methods=['POST'])
def add_environmental_record():
    data = request.get_json() or {}
    record_date = data.get('record_date', '').strip()
    zone_name = data.get('zone_name', '').strip()
    air_quality_index = data.get('air_quality_index')
    green_coverage_percentage = data.get('green_coverage_percentage')
    carbon_absorbed_tonnes = data.get('carbon_absorbed_tonnes')
    tree_survival_rate = data.get('tree_survival_rate')
    water_usage_cubic_m = data.get('water_usage_cubic_m')

    errors = []
    if not record_date:
        errors.append('Record date is required.')
    if not zone_name:
        errors.append('Zone name is required.')

    try:
        air_quality_index = int(air_quality_index)
        green_coverage_percentage = float(green_coverage_percentage)
        carbon_absorbed_tonnes = float(carbon_absorbed_tonnes)
        tree_survival_rate = float(tree_survival_rate)
        water_usage_cubic_m = float(water_usage_cubic_m)
    except (ValueError, TypeError):
        errors.append('Numerical environmental parameters are required and must be valid numbers.')

    if errors:
        return jsonify({'success': False, 'message': 'Validation failed.', 'errors': errors}), 400

    pm25 = float(data.get('pm25', 0) or 0)
    pm10 = float(data.get('pm10', 0) or 0)

    # Calculate Environmental Score (1 to 100) based on standard formula:
    # higher green coverage and survival rate add points; higher AQI subtracts points
    eco_score = data.get('environmental_score')
    if eco_score is None or eco_score == '':
        base_score = 50.0
        # AQI factor: optimal is < 50
        aqi_penalty = max(0, (air_quality_index - 50) * 0.25)
        # Coverage factor: 0-50%
        coverage_bonus = green_coverage_percentage * 0.6
        # Survival rate: 70-100%
        survival_bonus = (tree_survival_rate - 70) * 0.5
        calculated = base_score - aqi_penalty + coverage_bonus + survival_bonus
        eco_score = int(max(10, min(99, round(calculated))))
    else:
        eco_score = int(eco_score)

    notes = data.get('notes', '').strip()

    try:
        last_id, _ = execute_db(
            "INSERT INTO environmental_indicators (record_date, zone_name, air_quality_index, "
            "pm25, pm10, green_coverage_percentage, carbon_absorbed_tonnes, tree_survival_rate, "
            "water_usage_cubic_m, environmental_score, notes) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (record_date, zone_name, air_quality_index, pm25, pm10,
             green_coverage_percentage, carbon_absorbed_tonnes, tree_survival_rate,
             water_usage_cubic_m, eco_score, notes)
        )
        new_rec = query_db("SELECT * FROM environmental_indicators WHERE id = ?", (last_id,), one=True)
        return jsonify({'success': True, 'message': 'Environmental indicator recorded successfully.', 'data': new_rec}), 201

    except Exception as e:
        return jsonify({'success': False, 'message': f"Database error: {str(e)}"}), 500

@environmental_bp.route('/<int:record_id>', methods=['PUT'])
def update_environmental_record(record_id):
    rec = query_db("SELECT * FROM environmental_indicators WHERE id = ?", (record_id,), one=True)
    if not rec:
        return jsonify({'success': False, 'message': 'Record not found.'}), 404

    data = request.get_json() or {}
    record_date = data.get('record_date', rec['record_date']).strip()
    zone_name = data.get('zone_name', rec['zone_name']).strip()
    air_quality_index = int(data.get('air_quality_index', rec['air_quality_index']))
    pm25 = float(data.get('pm25', rec['pm25'] or 0))
    pm10 = float(data.get('pm10', rec['pm10'] or 0))
    green_coverage = float(data.get('green_coverage_percentage', rec['green_coverage_percentage']))
    carbon_absorbed = float(data.get('carbon_absorbed_tonnes', rec['carbon_absorbed_tonnes']))
    survival_rate = float(data.get('tree_survival_rate', rec['tree_survival_rate']))
    water_usage = float(data.get('water_usage_cubic_m', rec['water_usage_cubic_m']))
    eco_score = int(data.get('environmental_score', rec['environmental_score']))
    notes = data.get('notes', rec['notes'])

    try:
        execute_db(
            "UPDATE environmental_indicators SET record_date = ?, zone_name = ?, air_quality_index = ?, "
            "pm25 = ?, pm10 = ?, green_coverage_percentage = ?, carbon_absorbed_tonnes = ?, "
            "tree_survival_rate = ?, water_usage_cubic_m = ?, environmental_score = ?, notes = ? "
            "WHERE id = ?",
            (record_date, zone_name, air_quality_index, pm25, pm10,
             green_coverage, carbon_absorbed, survival_rate, water_usage, eco_score, notes, record_id)
        )
        updated = query_db("SELECT * FROM environmental_indicators WHERE id = ?", (record_id,), one=True)
        return jsonify({'success': True, 'message': 'Environmental record updated successfully.', 'data': updated}), 200

    except Exception as e:
        return jsonify({'success': False, 'message': f"Database error: {str(e)}"}), 500

@environmental_bp.route('/<int:record_id>', methods=['DELETE'])
def delete_environmental_record(record_id):
    rec = query_db("SELECT * FROM environmental_indicators WHERE id = ?", (record_id,), one=True)
    if not rec:
        return jsonify({'success': False, 'message': 'Record not found.'}), 404

    try:
        execute_db("DELETE FROM environmental_indicators WHERE id = ?", (record_id,))
        return jsonify({'success': True, 'message': 'Environmental record deleted successfully.'}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f"Database error: {str(e)}"}), 500

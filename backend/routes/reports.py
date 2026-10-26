import io
import csv
import json
from flask import Blueprint, request, jsonify, Response
from backend.database import query_db, execute_db

reports_bp = Blueprint('reports', __name__, url_prefix='/api/reports')

@reports_bp.route('', methods=['GET'])
def get_reports():
    reports = query_db("SELECT * FROM reports ORDER BY id DESC")
    return jsonify({'success': True, 'count': len(reports), 'data': reports}), 200

@reports_bp.route('/generate', methods=['POST'])
def generate_report():
    data = request.get_json() or {}
    report_type = data.get('report_type', 'Summary').strip()
    generated_by = data.get('generated_by', 'admin').strip()
    zone_filter = data.get('zone', '').strip()

    title = f"{report_type} Report - Urban Greenery"

    # Compile dynamic stats based on report type
    summary = {}
    if report_type == 'Carbon Sequestration':
        tree_carbon = query_db("SELECT SUM(carbon_offset_kg) as total_kg FROM trees", one=True)['total_kg'] or 0
        forest_trees = query_db("SELECT SUM(tree_count) as count FROM urban_forests", one=True)['count'] or 0
        total_carbon_metric_tonnes = round((tree_carbon + (forest_trees * 22.0)) / 1000.0, 2)
        summary = {
            'total_trees_assessed': query_db("SELECT COUNT(*) as c FROM trees", one=True)['c'],
            'total_forest_trees': forest_trees,
            'total_carbon_sequestration_metric_tonnes': total_carbon_metric_tonnes,
            'highest_carbon_species': query_db("SELECT species, SUM(carbon_offset_kg) as total FROM trees GROUP BY species ORDER BY total DESC LIMIT 3")
        }

    elif report_type == 'Maintenance Audit':
        maint_counts = query_db("SELECT status, COUNT(*) as count FROM maintenance GROUP BY status")
        total_cost = query_db("SELECT SUM(cost) as total FROM maintenance", one=True)['total'] or 0
        summary = {
            'status_breakdown': maint_counts,
            'total_expenditure_usd': round(total_cost, 2),
            'overdue_or_critical': query_db("SELECT COUNT(*) as c FROM maintenance WHERE status = 'Overdue' OR status = 'Scheduled'", one=True)['c']
        }

    else: # General Summary
        summary = {
            'total_parks': query_db("SELECT COUNT(*) as c FROM parks", one=True)['c'],
            'total_trees': query_db("SELECT COUNT(*) as c FROM trees", one=True)['c'],
            'total_forests': query_db("SELECT COUNT(*) as c FROM urban_forests", one=True)['c'],
            'total_green_belts': query_db("SELECT COUNT(*) as c FROM green_belts", one=True)['c'],
            'avg_environmental_score': query_db("SELECT ROUND(AVG(environmental_score), 1) as s FROM environmental_indicators", one=True)['s'],
            'healthy_tree_percentage': round(
                (query_db("SELECT COUNT(*) as c FROM trees WHERE health_status = 'Healthy'", one=True)['c'] /
                 max(1, query_db("SELECT COUNT(*) as c FROM trees", one=True)['c'])) * 100.0, 1
            )
        }

    summary_text = json.dumps(summary)
    filter_desc = f"Filter: Zone='{zone_filter or 'All'}' | Type='{report_type}'"

    last_id, _ = execute_db(
        "INSERT INTO reports (report_title, report_type, generated_by, filter_criteria, summary_data) "
        "VALUES (?, ?, ?, ?, ?)",
        (title, report_type, generated_by, filter_desc, summary_text)
    )

    new_report = query_db("SELECT * FROM reports WHERE id = ?", (last_id,), one=True)
    return jsonify({
        'success': True,
        'message': 'Report generated successfully.',
        'data': new_report,
        'summary_details': summary
    }), 201

@reports_bp.route('/export-csv', methods=['GET'])
def export_csv():
    """Export selected entity (parks, trees, maintenance, environmental) as a downloadable CSV."""
    entity = request.args.get('entity', 'trees').strip().lower()

    output = io.StringIO()
    writer = csv.writer(output)

    if entity == 'parks':
        rows = query_db("SELECT id, name, location, ward_no, area_sq_m, park_type, established_year, contact_officer, status, maintenance_status FROM parks")
        writer.writerow(['ID', 'Park Name', 'Location', 'Ward', 'Area (sq m)', 'Park Type', 'Established', 'Contact Officer', 'Status', 'Maintenance'])
        for r in rows:
            writer.writerow([r['id'], r['name'], r['location'], r['ward_no'], r['area_sq_m'], r['park_type'], r['established_year'], r['contact_officer'], r['status'], r['maintenance_status']])
        filename = "parks_export.csv"

    elif entity == 'trees':
        rows = query_db("SELECT t.id, t.tree_code, t.species, t.common_name, p.name as park_name, t.location_details, t.age_years, t.height_m, t.health_status, t.maintenance_status, t.carbon_offset_kg FROM trees t LEFT JOIN parks p ON t.park_id = p.id")
        writer.writerow(['ID', 'Tree Code', 'Species', 'Common Name', 'Park', 'Location', 'Age (Yrs)', 'Height (m)', 'Health', 'Maintenance', 'Carbon Offset (kg)'])
        for r in rows:
            writer.writerow([r['id'], r['tree_code'], r['species'], r['common_name'], r['park_name'] or 'N/A', r['location_details'], r['age_years'], r['height_m'], r['health_status'], r['maintenance_status'], r['carbon_offset_kg']])
        filename = "trees_inventory_export.csv"

    elif entity == 'maintenance':
        rows = query_db("SELECT id, activity_title, target_type, target_name, activity_type, scheduled_date, completion_date, responsible_person, status, cost FROM maintenance")
        writer.writerow(['ID', 'Activity Title', 'Target Type', 'Target Name', 'Activity Type', 'Scheduled Date', 'Completion Date', 'Responsible Person', 'Status', 'Cost ($)'])
        for r in rows:
            writer.writerow([r['id'], r['activity_title'], r['target_type'], r['target_name'], r['activity_type'], r['scheduled_date'], r['completion_date'], r['responsible_person'], r['status'], r['cost']])
        filename = "maintenance_log_export.csv"

    elif entity == 'environmental':
        rows = query_db("SELECT id, record_date, zone_name, air_quality_index, pm25, pm10, green_coverage_percentage, carbon_absorbed_tonnes, tree_survival_rate, water_usage_cubic_m, environmental_score FROM environmental_indicators")
        writer.writerow(['ID', 'Date', 'Zone', 'AQI', 'PM2.5', 'PM10', 'Green Coverage %', 'Carbon Absorbed (Tonnes)', 'Tree Survival %', 'Water Usage (m3)', 'Eco Score'])
        for r in rows:
            writer.writerow([r['id'], r['record_date'], r['zone_name'], r['air_quality_index'], r['pm25'], r['pm10'], r['green_coverage_percentage'], r['carbon_absorbed_tonnes'], r['tree_survival_rate'], r['water_usage_cubic_m'], r['environmental_score']])
        filename = "environmental_indicators_export.csv"

    else:
        return jsonify({'success': False, 'message': 'Invalid entity for CSV export. Options: parks, trees, maintenance, environmental'}), 400

    csv_data = output.getvalue()
    return Response(
        csv_data,
        mimetype="text/csv",
        headers={"Content-disposition": f"attachment; filename={filename}"}
    )

@reports_bp.route('/search', methods=['GET'])
def global_search():
    """Universal search across parks, trees, forests, green belts, and maintenance."""
    q = request.args.get('q', '').strip()
    if not q:
        return jsonify({'success': True, 'results': []}), 200

    wildcard = f"%{q}%"
    results = []

    # Parks
    parks = query_db("SELECT id, name as title, location as subtitle, 'Park' as category, status FROM parks WHERE name LIKE ? OR location LIKE ? LIMIT 5", (wildcard, wildcard))
    for p in parks:
        p['url'] = f"parks.html?id={p['id']}"
        results.append(p)

    # Trees
    trees = query_db("SELECT id, tree_code || ' - ' || common_name as title, species || ' (' || location_details || ')' as subtitle, 'Tree' as category, health_status as status FROM trees WHERE tree_code LIKE ? OR species LIKE ? OR common_name LIKE ? LIMIT 5", (wildcard, wildcard, wildcard))
    for t in trees:
        t['url'] = f"trees.html?id={t['id']}"
        results.append(t)

    # Forests
    forests = query_db("SELECT id, forest_name as title, location as subtitle, 'Urban Forest' as category, maintenance_status as status FROM urban_forests WHERE forest_name LIKE ? OR location LIKE ? LIMIT 5", (wildcard, wildcard))
    for f in forests:
        f['url'] = f"urban-forests.html?id={f['id']}"
        results.append(f)

    # Green belts
    belts = query_db("SELECT id, belt_name as title, location as subtitle, 'Green Belt' as category, status FROM green_belts WHERE belt_name LIKE ? OR location LIKE ? LIMIT 5", (wildcard, wildcard))
    for b in belts:
        b['url'] = f"green-belts.html?id={b['id']}"
        results.append(b)

    return jsonify({'success': True, 'query': q, 'count': len(results), 'results': results}), 200

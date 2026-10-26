from flask import Blueprint, jsonify
from backend.database import query_db

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@dashboard_bp.route('/stats', methods=['GET'])
def get_dashboard_stats():
    """Return aggregated metrics and chart dataset for dashboard visualization."""
    try:
        # 1. Total counts
        total_parks = query_db("SELECT COUNT(*) as count FROM parks", one=True)['count']
        total_trees = query_db("SELECT COUNT(*) as count FROM trees", one=True)['count']
        total_forests = query_db("SELECT COUNT(*) as count FROM urban_forests", one=True)['count']
        total_belts = query_db("SELECT COUNT(*) as count FROM green_belts", one=True)['count']

        # 2. Area computations
        parks_area_row = query_db("SELECT COALESCE(SUM(area_sq_m), 0) as total_area FROM parks", one=True)
        parks_area_sq_m = parks_area_row['total_area'] if parks_area_row else 0

        forests_area_row = query_db("SELECT COALESCE(SUM(area_hectares), 0) as total_hec, COALESCE(SUM(tree_count), 0) as forest_trees FROM urban_forests", one=True)
        forest_hectares = forests_area_row['total_hec'] if forests_area_row else 0
        forest_trees = forests_area_row['forest_trees'] if forests_area_row else 0
        forest_area_sq_m = forest_hectares * 10000.0  # 1 hectare = 10,000 sq m

        belts_area_row = query_db("SELECT COALESCE(SUM(area_sq_m), 0) as total_area FROM green_belts", one=True)
        belts_area_sq_m = belts_area_row['total_area'] if belts_area_row else 0

        total_green_area_sq_m = parks_area_sq_m + forest_area_sq_m + belts_area_sq_m
        total_green_area_hectares = round(total_green_area_sq_m / 10000.0, 2)

        # 3. Carbon offset total from inventoried trees + forests
        trees_carbon_row = query_db("SELECT COALESCE(SUM(carbon_offset_kg), 0) as total_carbon FROM trees", one=True)
        tree_carbon_kg = trees_carbon_row['total_carbon'] if trees_carbon_row else 0
        # Estimated 22kg/tree/yr for forest trees as well
        forest_carbon_kg = forest_trees * 22.0
        total_carbon_kg = tree_carbon_kg + forest_carbon_kg
        total_carbon_tonnes = round(total_carbon_kg / 1000.0, 2)

        # 4. Latest Environmental metrics
        latest_env = query_db(
            "SELECT air_quality_index, green_coverage_percentage, carbon_absorbed_tonnes, tree_survival_rate, environmental_score "
            "FROM environmental_indicators ORDER BY record_date DESC, id DESC LIMIT 1",
            one=True
        )

        avg_env = query_db(
            "SELECT ROUND(AVG(air_quality_index), 1) as avg_aqi, "
            "ROUND(AVG(environmental_score), 1) as avg_score, "
            "ROUND(AVG(tree_survival_rate), 1) as avg_survival, "
            "ROUND(AVG(green_coverage_percentage), 1) as avg_coverage "
            "FROM environmental_indicators",
            one=True
        )

        # 5. Charts: Trees by Species
        species_data = query_db(
            "SELECT species, common_name, COUNT(*) as count "
            "FROM trees GROUP BY species ORDER BY count DESC LIMIT 8"
        )

        # 6. Charts: Trees by Health Status
        health_data = query_db(
            "SELECT health_status, COUNT(*) as count "
            "FROM trees GROUP BY health_status"
        )

        # 7. Charts: Trees by Maintenance Status
        maint_status_data = query_db(
            "SELECT maintenance_status, COUNT(*) as count "
            "FROM trees GROUP BY maintenance_status"
        )

        # 8. Charts: Parks by Type
        parks_by_type = query_db(
            "SELECT park_type, COUNT(*) as count "
            "FROM parks GROUP BY park_type"
        )

        # 9. Charts: Environmental Trends (Ordered by date ascending for timeline graph)
        env_trends = query_db(
            "SELECT record_date, zone_name, air_quality_index, green_coverage_percentage, "
            "carbon_absorbed_tonnes, environmental_score "
            "FROM environmental_indicators ORDER BY record_date ASC LIMIT 10"
        )

        # 10. Recent Maintenance Tasks
        recent_maintenance = query_db(
            "SELECT id, activity_title, target_type, target_name, activity_type, scheduled_date, responsible_person, status "
            "FROM maintenance ORDER BY scheduled_date DESC LIMIT 5"
        )

        # 11. Recent Trees Added
        recent_trees = query_db(
            "SELECT t.id, t.tree_code, t.common_name, t.species, t.health_status, t.location_details, "
            "p.name as park_name "
            "FROM trees t LEFT JOIN parks p ON t.park_id = p.id "
            "ORDER BY t.id DESC LIMIT 5"
        )

        # 12. Maintenance summary
        maint_summary = query_db(
            "SELECT status, COUNT(*) as count FROM maintenance GROUP BY status"
        )

        return jsonify({
            'success': True,
            'summary': {
                'total_parks': total_parks,
                'total_trees': total_trees,
                'total_forest_trees': forest_trees,
                'total_all_trees': total_trees + forest_trees,
                'total_forests': total_forests,
                'total_green_belts': total_belts,
                'total_green_area_sq_m': round(total_green_area_sq_m, 2),
                'total_green_area_hectares': total_green_area_hectares,
                'total_carbon_tonnes': total_carbon_tonnes,
                'latest_aqi': latest_env['air_quality_index'] if latest_env else 72,
                'avg_environmental_score': avg_env['avg_score'] if avg_env and avg_env['avg_score'] else 82.5,
                'avg_tree_survival_rate': avg_env['avg_survival'] if avg_env and avg_env['avg_survival'] else 91.2,
                'avg_green_coverage': avg_env['avg_coverage'] if avg_env and avg_env['avg_coverage'] else 27.5
            },
            'charts': {
                'species': species_data,
                'health': health_data,
                'maintenance_status': maint_status_data,
                'parks_by_type': parks_by_type,
                'env_trends': env_trends
            },
            'recent_maintenance': recent_maintenance,
            'recent_trees': recent_trees,
            'maintenance_summary': maint_summary
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

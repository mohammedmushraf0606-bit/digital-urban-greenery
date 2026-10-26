"""
Automated Test Suite for Digital Urban Greenery Management System
Comprehensive tests covering all API endpoints, CRUD operations,
static page serving, CSV generation, search, validation, and error handling.
"""
import os
import sys
import unittest
import json

# Ensure project root is in python path
BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from backend.app import create_app
from backend.database import init_db, query_db

class TestUrbanGreenery(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.client = cls.app.test_client()

    # 1. API Health & Static Route Tests
    def test_01_api_health(self):
        """Test API root status"""
        res = self.client.get('/api')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data.get('status'), 'online')
        self.assertEqual(data.get('project'), 'Digital Urban Greenery Management System')

    def test_02_static_pages(self):
        """Test frontend static HTML views are served successfully"""
        pages = [
            ('/', 'Urban Greenery Central Dashboard'),
            ('/index.html', 'Urban Greenery Central Dashboard'),
            ('/login.html', 'Sign In to Portal'),
            ('/parks.html', 'Park Management Module'),
            ('/trees.html', 'Tree Inventory Management'),
            ('/urban-forests.html', 'Urban Forest Reserves'),
            ('/green-belts.html', 'Green Belts & Buffer Zones'),
            ('/environmental.html', 'Environmental Performance Indicators'),
            ('/maintenance.html', 'Greenery Maintenance Operations'),
            ('/reports.html', 'Reports & Environmental Analytics')
        ]
        for path, expected_text in pages:
            res = self.client.get(path)
            self.assertEqual(res.status_code, 200, f"Failed loading {path}")
            self.assertIn(expected_text.encode('utf-8'), res.data, f"Missing '{expected_text}' in {path}")

    # 2. Authentication Tests
    def test_03_auth_login(self):
        """Test authentication login for admin, officer, and invalid credentials"""
        # Admin login
        res = self.client.post('/api/auth/login', json={'username': 'admin', 'password': 'admin123'})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data.get('success'))
        self.assertEqual(data['user']['role'], 'admin')

        # Officer login
        res_off = self.client.post('/api/auth/login', json={'username': 'officer', 'password': 'officer123'})
        self.assertEqual(res_off.status_code, 200)
        self.assertEqual(res_off.get_json()['user']['role'], 'officer')

        # Invalid password
        res_fail = self.client.post('/api/auth/login', json={'username': 'admin', 'password': 'wrongpassword'})
        self.assertEqual(res_fail.status_code, 401)
        self.assertFalse(res_fail.get_json().get('success'))

        # Missing fields
        res_empty = self.client.post('/api/auth/login', json={'username': ''})
        self.assertEqual(res_empty.status_code, 400)

    # 3. Dashboard Analytics Tests
    def test_04_dashboard_stats(self):
        """Test dashboard statistics aggregation and chart data"""
        res = self.client.get('/api/dashboard/stats')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data.get('success'))
        self.assertIn('summary', data)
        self.assertGreater(data['summary']['total_parks'], 0)
        self.assertGreater(data['summary']['total_trees'], 0)
        self.assertGreater(data['summary']['total_forests'], 0)
        self.assertGreater(data['summary']['total_green_belts'], 0)
        self.assertIn('charts', data)
        self.assertIn('species', data['charts'])
        self.assertIn('health', data['charts'])
        self.assertIn('parks_by_type', data['charts'])
        self.assertIn('env_trends', data['charts'])

    # 4. Parks CRUD & Validation Tests
    def test_05_parks_crud(self):
        """Test Parks CRUD operations and edge cases"""
        # Create
        new_park = {
            'name': 'Unit Test Botanical Enclave',
            'location': 'Ward 99 Sector Z',
            'ward_no': 'Ward-99',
            'area_sq_m': 15000.0,
            'park_type': 'Botanical',
            'established_year': 2024,
            'contact_officer': 'Dr. Test Officer',
            'contact_phone': '+1-555-9999',
            'facilities': 'Walking Trail, Solar Aerator',
            'status': 'Active',
            'maintenance_status': 'Good'
        }
        create_res = self.client.post('/api/parks', json=new_park)
        self.assertEqual(create_res.status_code, 201)
        created = create_res.get_json()
        park_id = created['data']['id']

        # Read single
        get_res = self.client.get(f'/api/parks/{park_id}')
        self.assertEqual(get_res.status_code, 200)
        self.assertEqual(get_res.get_json()['data']['name'], 'Unit Test Botanical Enclave')
        self.assertIn('trees', get_res.get_json()['data'])

        # List with filter
        list_res = self.client.get('/api/parks?type=Botanical')
        self.assertEqual(list_res.status_code, 200)
        self.assertTrue(any(p['id'] == park_id for p in list_res.get_json()['data']))

        # Update
        update_res = self.client.put(f'/api/parks/{park_id}', json={
            'name': 'Updated Test Botanical Garden',
            'area_sq_m': 17500.0
        })
        self.assertEqual(update_res.status_code, 200)
        self.assertEqual(update_res.get_json()['data']['name'], 'Updated Test Botanical Garden')

        # Delete
        delete_res = self.client.delete(f'/api/parks/{park_id}')
        self.assertEqual(delete_res.status_code, 200)

        # Confirm deleted
        check_res = self.client.get(f'/api/parks/{park_id}')
        self.assertEqual(check_res.status_code, 404)

    def test_06_parks_validation(self):
        """Test park input validation errors"""
        invalid_park = {
            'name': '',
            'location': '',
            'area_sq_m': -10
        }
        res = self.client.post('/api/parks', json=invalid_park)
        self.assertEqual(res.status_code, 400)
        self.assertFalse(res.get_json()['success'])

    # 5. Trees CRUD & Validation Tests
    def test_07_trees_crud(self):
        """Test Trees Inventory CRUD operations and species lookup"""
        # Species list
        species_res = self.client.get('/api/trees/species-list')
        self.assertEqual(species_res.status_code, 200)
        self.assertGreater(len(species_res.get_json()['data']), 0)

        # Create
        new_tree = {
            'tree_code': 'TR-TEST-999',
            'species': 'Jacaranda mimosifolia',
            'common_name': 'Blue Jacaranda Test',
            'location_details': 'Test Promenade Section B',
            'age_years': 7,
            'height_m': 6.5,
            'canopy_diameter_m': 4.2,
            'health_status': 'Healthy',
            'maintenance_status': 'Routine'
        }
        res = self.client.post('/api/trees', json=new_tree)
        self.assertEqual(res.status_code, 201)
        tree_id = res.get_json()['data']['id']

        # Read
        get_res = self.client.get(f'/api/trees/{tree_id}')
        self.assertEqual(get_res.status_code, 200)
        self.assertEqual(get_res.get_json()['data']['tree_code'], 'TR-TEST-999')

        # Update
        up_res = self.client.put(f'/api/trees/{tree_id}', json={
            'health_status': 'Fair',
            'maintenance_status': 'Pruning Needed'
        })
        self.assertEqual(up_res.status_code, 200)
        self.assertEqual(up_res.get_json()['data']['health_status'], 'Fair')

        # Delete
        del_res = self.client.delete(f'/api/trees/{tree_id}')
        self.assertEqual(del_res.status_code, 200)

        # Confirm 404
        check_res = self.client.get(f'/api/trees/{tree_id}')
        self.assertEqual(check_res.status_code, 404)

    def test_08_trees_validation(self):
        """Test tree input validation: duplicate code and missing species"""
        # Missing required fields
        res = self.client.post('/api/trees', json={'tree_code': 'TR-FAIL-01'})
        self.assertEqual(res.status_code, 400)

        # Duplicate tree code test
        tree_a = {
            'tree_code': 'TR-DUP-01',
            'species': 'Ficus elastica',
            'common_name': 'Rubber Fig',
            'location_details': 'Sector 1'
        }
        r1 = self.client.post('/api/trees', json=tree_a)
        self.assertEqual(r1.status_code, 201)
        tree_a_id = r1.get_json()['data']['id']

        # Duplicate insert
        r2 = self.client.post('/api/trees', json=tree_a)
        self.assertEqual(r2.status_code, 400)
        self.assertIn('already exists', r2.get_json()['errors'][0])

        # Cleanup
        self.client.delete(f'/api/trees/{tree_a_id}')

    # 6. Urban Forests CRUD
    def test_09_urban_forests_crud(self):
        """Test Urban Forests CRUD"""
        forest = {
            'forest_name': 'Test Miyawaki Biosphere',
            'location': 'Test East Hills',
            'area_hectares': 4.2,
            'tree_count': 6000,
            'biodiversity_index': 4.1,
            'canopy_density': 'Dense',
            'forest_type': 'Miyawaki Forest',
            'maintenance_status': 'Active',
            'established_year': 2021,
            'remarks': 'Experimental fast-growth woodland'
        }
        res = self.client.post('/api/urban-forests', json=forest)
        self.assertEqual(res.status_code, 201)
        f_id = res.get_json()['data']['id']

        # Read
        get_res = self.client.get(f'/api/urban-forests/{f_id}')
        self.assertEqual(get_res.status_code, 200)
        self.assertEqual(get_res.get_json()['data']['forest_name'], 'Test Miyawaki Biosphere')

        # Update
        up_res = self.client.put(f'/api/urban-forests/{f_id}', json={'area_hectares': 5.0})
        self.assertEqual(up_res.status_code, 200)

        # Delete
        del_res = self.client.delete(f'/api/urban-forests/{f_id}')
        self.assertEqual(del_res.status_code, 200)

    # 7. Green Belts CRUD
    def test_10_green_belts_crud(self):
        """Test Green Belts CRUD"""
        belt = {
            'belt_name': 'Test Highway Noise Buffer',
            'location': 'Highway Sector 10',
            'length_km': 5.0,
            'width_m': 20.0,
            'vegetation_type': 'Evergreen Conifers',
            'buffer_type': 'Roadside',
            'status': 'Healthy',
            'maintenance_frequency': 'Weekly'
        }
        res = self.client.post('/api/green-belts', json=belt)
        self.assertEqual(res.status_code, 201)
        b_id = res.get_json()['data']['id']

        # Read
        get_res = self.client.get(f'/api/green-belts/{b_id}')
        self.assertEqual(get_res.status_code, 200)
        self.assertEqual(get_res.get_json()['data']['belt_name'], 'Test Highway Noise Buffer')

        # Update
        up_res = self.client.put(f'/api/green-belts/{b_id}', json={'status': 'Moderate'})
        self.assertEqual(up_res.status_code, 200)

        # Delete
        del_res = self.client.delete(f'/api/green-belts/{b_id}')
        self.assertEqual(del_res.status_code, 200)

    # 8. Environmental Performance Tests
    def test_11_environmental_indicators(self):
        """Test Environmental Performance recording, analytics and scoring"""
        rec = {
            'record_date': '2026-10-25',
            'zone_name': 'Test Eco Zone Delta',
            'air_quality_index': 52,
            'green_coverage_percentage': 32.5,
            'carbon_absorbed_tonnes': 175.0,
            'tree_survival_rate': 94.5,
            'water_usage_cubic_m': 295.0,
            'notes': 'Fine crisp air, good leaf flush'
        }
        res = self.client.post('/api/environmental', json=rec)
        self.assertEqual(res.status_code, 201)
        rec_id = res.get_json()['data']['id']
        # Verify auto-computed environmental score
        self.assertGreater(res.get_json()['data']['environmental_score'], 0)

        # Analytics
        analytics_res = self.client.get('/api/environmental/analytics')
        self.assertEqual(analytics_res.status_code, 200)
        self.assertIn('overall', analytics_res.get_json())
        self.assertIn('trends', analytics_res.get_json())

        # Cleanup
        del_res = self.client.delete(f'/api/environmental/{rec_id}')
        self.assertEqual(del_res.status_code, 200)

    # 9. Maintenance Tasks & Quick Status Update Tests
    def test_12_maintenance_tasks(self):
        """Test Maintenance scheduling, quick status patch, and filtering"""
        task = {
            'activity_title': 'Unit Test Canopy Trimming',
            'target_type': 'Park',
            'target_name': 'Central Botanical Garden',
            'activity_type': 'Pruning',
            'scheduled_date': '2026-10-30',
            'responsible_person': 'Test Arborist'
        }
        res = self.client.post('/api/maintenance', json=task)
        self.assertEqual(res.status_code, 201)
        task_id = res.get_json()['data']['id']

        # Quick Status Update (PATCH)
        patch_res = self.client.patch(f'/api/maintenance/{task_id}/status', json={'status': 'Completed'})
        self.assertEqual(patch_res.status_code, 200)
        self.assertEqual(patch_res.get_json()['data']['status'], 'Completed')
        self.assertIsNotNone(patch_res.get_json()['data']['completion_date'])

        # Invalid Status Option
        bad_patch = self.client.patch(f'/api/maintenance/{task_id}/status', json={'status': 'NotAStatus'})
        self.assertEqual(bad_patch.status_code, 400)

        # Cleanup
        del_res = self.client.delete(f'/api/maintenance/{task_id}')
        self.assertEqual(del_res.status_code, 200)

    # 10. Reports, CSV Export & Global Search Tests
    def test_13_reports_and_csv_export(self):
        """Test report generation and CSV dataset downloads"""
        # Summary report generation
        gen_res = self.client.post('/api/reports/generate', json={'report_type': 'Summary', 'generated_by': 'admin'})
        self.assertEqual(gen_res.status_code, 201)
        self.assertTrue(gen_res.get_json()['success'])

        # Carbon report generation
        carbon_res = self.client.post('/api/reports/generate', json={'report_type': 'Carbon Sequestration', 'generated_by': 'admin'})
        self.assertEqual(carbon_res.status_code, 201)

        # Maintenance audit report generation
        maint_res = self.client.post('/api/reports/generate', json={'report_type': 'Maintenance Audit', 'generated_by': 'admin'})
        self.assertEqual(maint_res.status_code, 201)

        # Export CSV for all supported entities
        entities = ['parks', 'trees', 'maintenance', 'environmental']
        for ent in entities:
            csv_res = self.client.get(f'/api/reports/export-csv?entity={ent}')
            self.assertEqual(csv_res.status_code, 200, f"Failed exporting {ent} CSV")
            self.assertIn('text/csv', csv_res.headers.get('Content-Type'))
            self.assertGreater(len(csv_res.data), 10)

        # Invalid CSV entity
        bad_csv = self.client.get('/api/reports/export-csv?entity=invalid_entity')
        self.assertEqual(bad_csv.status_code, 400)

    def test_14_global_search(self):
        """Test universal search endpoint across parks, trees, forests, belts"""
        # Search for 'Central'
        search_res = self.client.get('/api/reports/search?q=Central')
        self.assertEqual(search_res.status_code, 200)
        data = search_res.get_json()
        self.assertTrue(data['success'])
        self.assertGreater(data['count'], 0)

        # Empty search
        empty_res = self.client.get('/api/reports/search?q=')
        self.assertEqual(empty_res.status_code, 200)
        self.assertEqual(len(empty_res.get_json()['results']), 0)

if __name__ == '__main__':
    unittest.main()

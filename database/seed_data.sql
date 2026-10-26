-- ==============================================================
-- Digital Urban Greenery Management System
-- Seed / Sample Data Script
-- ==============================================================

-- 1. Users (Passwords hashed with SHA-256: admin123 and officer123)
INSERT INTO users (username, password_hash, full_name, email, role) VALUES
('admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Urban Greenery Administrator', 'admin@citygreen.gov', 'admin'),
('officer', '118b8d35a17bcf2c7d2d790509e12308dc6332c5d234f0098d2d6be6700bebb1', 'Horticulture Field Officer', 'officer@citygreen.gov', 'officer');

-- 2. Parks
INSERT INTO parks (name, location, ward_no, area_sq_m, park_type, established_year, contact_officer, contact_phone, facilities, status, maintenance_status) VALUES
('Central Botanical Garden', 'Sector 14, Downtown North', 'Ward-12', 45000.0, 'Botanical', 2012, 'Dr. Aris Thorne', '+1-555-0101', 'Walking Trails, Conservatory, Drip Irrigation, Native Plant Nursery', 'Active', 'Good'),
('Riverside Eco Park', 'East River Promenade', 'Ward-08', 32000.0, 'Ecological', 2018, 'Elena Vance', '+1-555-0102', 'Bird Watching Deck, Solar Lighting, Bio-swales, Rainwater Harvesting', 'Active', 'Good'),
('Highland Community Park', 'Highland Heights, Block C', 'Ward-04', 18500.0, 'Community', 2015, 'Marcus Bell', '+1-555-0103', 'Children Playground, Jogging Track, Fitness Zone, Public Benches', 'Active', 'Moderate'),
('Metro Pocket Park', 'Transit Hub Crossing', 'Ward-01', 4200.0, 'Pocket Park', 2021, 'Sarah Chen', '+1-555-0104', 'Vertical Gardens, Seating Alcoves, Automated Sprinklers', 'Active', 'Good'),
('Heritage Silver Oaks Park', 'Old Town Heritage Quarter', 'Ward-15', 28000.0, 'Heritage Park', 2008, 'Vikram Mehta', '+1-555-0105', 'Ancient Tree Conservation, Gazebos, Herbal Garden', 'Active', 'Needs Attention'),
('Sunrise Lake Greenway Park', 'South Valley Waterfront', 'Ward-21', 52000.0, 'Lakefront Eco Park', 2020, 'Dr. Aris Thorne', '+1-555-0106', 'Wetland Boardwalk, Solar Aerators, Flowering Perennial Zones', 'Active', 'Good');

-- 3. Tree Inventory
INSERT INTO trees (tree_code, species, common_name, park_id, location_details, age_years, height_m, canopy_diameter_m, health_status, maintenance_status, carbon_offset_kg, planted_date) VALUES
('TR-2024-001', 'Azadirachta indica', 'Neem Tree', 1, 'Sector 14 Botanical - North Gate Pathway', 12, 11.5, 8.2, 'Healthy', 'Routine', 28.5, '2014-04-10'),
('TR-2024-002', 'Ficus religiosa', 'Sacred Peepal', 1, 'Botanical Garden - Meditation Circle', 25, 18.0, 14.5, 'Healthy', 'Routine', 48.0, '2001-08-15'),
('TR-2024-003', 'Delonix regia', 'Gulmohar / Royal Poinciana', 3, 'Highland Park - East Children Play Zone', 8, 7.8, 6.0, 'Fair', 'Pruning Needed', 18.2, '2018-06-20'),
('TR-2024-004', 'Magnolia champaca', 'Golden Champa', 2, 'Riverside Eco Park - Waterfront Trail A', 5, 5.2, 4.0, 'Healthy', 'Routine', 14.0, '2021-03-12'),
('TR-2024-005', 'Jacaranda mimosifolia', 'Blue Jacaranda', 4, 'Metro Pocket Park - Central Plaza', 4, 4.5, 3.5, 'Healthy', 'Routine', 12.0, '2022-09-05'),
('TR-2024-006', 'Samanea saman', 'Rain Tree', 5, 'Heritage Silver Oaks - Southern Boundary', 35, 22.0, 19.0, 'Fair', 'Inspection Required', 65.0, '1991-05-18'),
('TR-2024-007', 'Syzygium cumini', 'Jamun / Black Plum', 6, 'Sunrise Lake Greenway - Wetland Zone 2', 9, 8.4, 7.1, 'Healthy', 'Routine', 22.5, '2017-07-25'),
('TR-2024-008', 'Pongamia pinnata', 'Indian Beech / Karanj', 3, 'Highland Park - Perimeter Green Wall', 6, 6.1, 5.0, 'Poor', 'Pest Treatment Required', 15.0, '2020-02-14'),
('TR-2024-009', 'Cassia fistula', 'Golden Shower Tree', 1, 'Botanical Garden - Flower Promenade', 11, 9.2, 7.5, 'Healthy', 'Routine', 24.0, '2015-05-30'),
('TR-2024-010', 'Quercus virginiana', 'Southern Live Oak', 5, 'Heritage Silver Oaks - East Lawn', 40, 20.5, 17.0, 'Critical', 'Inspection Required', 58.0, '1986-11-10'),
('TR-2024-011', 'Tamarindus indica', 'Tamarind Tree', 2, 'Riverside Eco Park - Sector 2 Lawn', 15, 13.0, 9.5, 'Healthy', 'Routine', 32.0, '2011-04-17'),
('TR-2024-012', 'Bauhinia variegata', 'Orchid Tree / Kachnar', 4, 'Metro Pocket Park - Transit Walkway', 3, 3.8, 2.9, 'Healthy', 'Routine', 9.5, '2023-01-20');

-- 4. Urban Forests
INSERT INTO urban_forests (forest_name, location, area_hectares, tree_count, biodiversity_index, canopy_density, forest_type, maintenance_status, established_year, remarks) VALUES
('North Ridge Miyawaki Woodland', 'North Ridge Bypass, Corridor 7', 8.5, 14200, 4.6, 'Dense', 'Miyawaki Forest', 'Active', 2019, 'Ultra-dense multi-layered native forest creating a climate cooling buffer.'),
('Riverfront Riparian Forest Reserve', 'Lower Basin Watershed', 15.2, 21500, 4.8, 'Dense', 'Natural Reserve', 'Active', 2016, 'Protects riverbank erosion and provides key bird migration habitat.'),
('Industrial Border Biosphere', 'Eastern Industrial District Sector 5', 6.8, 9800, 3.9, 'Medium', 'Buffer Forest', 'Active', 2021, 'Designed specifically for heavy particulate matter filtering and noise absorption.'),
('Southern Hills Ecological Belt', 'Southern Escarpment', 22.0, 31000, 4.9, 'Dense', 'Natural Reserve', 'Active', 2014, 'Rich biodiversity zone with endemic evergreen and deciduous flora.');

-- 5. Green Belts
INSERT INTO green_belts (belt_name, location, length_km, width_m, area_sq_m, vegetation_type, buffer_type, status, maintenance_frequency, remarks) VALUES
('Ring Expressway Northern Buffer', 'Outer Ring Road Km 12 to 24', 12.0, 35.0, 420000.0, 'Tall Pine, Eucalyptus, Oleander & Bougainvillea', 'Roadside', 'Healthy', 'Weekly', 'Reduces highway dust emission and creates noise dampening acoustic screen.'),
('Tech Park Eco Corridor Green Belt', 'Innovation District Avenue', 4.5, 20.0, 90000.0, 'Native Flowering Shrubs & Shade Trees', 'Residential/Commercial', 'Healthy', 'Bi-weekly', 'Pedestrian-friendly green canopy with micro-misting irrigation.'),
('Chemical Zone Safety Perimeter Belt', 'Heavy Industry Sector 9', 6.2, 45.0, 279000.0, 'Pollutant-Tolerant Evergreen Conifers & Bamboo', 'Industrial Buffer', 'Moderate', 'Bi-weekly', 'Absorbs gaseous emissions and prevents wind-blown debris.'),
('Coastal Flood Protection Mangrove Belt', 'Estuary Tidal Inlet Zone', 3.8, 50.0, 190000.0, 'Mangrove & Halophytic Marine Shrubbery', 'Coastal/River Buffer', 'Healthy', 'Monthly', 'Crucial tidal storm barrier and water filtration biome.');

-- 6. Environmental Performance Indicators
INSERT INTO environmental_indicators (record_date, zone_name, air_quality_index, pm25, pm10, green_coverage_percentage, carbon_absorbed_tonnes, tree_survival_rate, water_usage_cubic_m, environmental_score, notes) VALUES
('2026-09-01', 'Zone A - Downtown & Central', 68, 22.4, 45.1, 28.4, 185.6, 92.4, 420.0, 84, 'Good canopy growth post-monsoon; AQI remains moderate.'),
('2026-09-01', 'Zone B - Riverside & Waterfront', 45, 14.2, 28.5, 36.2, 240.2, 95.8, 310.0, 92, 'Excellent air quality and highest biodiversity metrics across all wards.'),
('2026-09-01', 'Zone C - Industrial Corridor', 115, 42.8, 86.4, 19.8, 125.4, 84.1, 580.0, 71, 'Green buffer expanding; particulate levels lower by 12% compared to prior quarter.'),
('2026-08-01', 'Zone A - Downtown & Central', 74, 25.1, 52.0, 27.9, 178.2, 91.8, 450.0, 81, 'Mid-summer maintenance and mulch application completed.'),
('2026-08-01', 'Zone B - Riverside & Waterfront', 48, 15.6, 31.2, 35.8, 232.0, 95.2, 330.0, 90, 'Optimal natural hydration and flourishing wetland shrubs.'),
('2026-08-01', 'Zone C - Industrial Corridor', 122, 46.0, 92.1, 19.2, 119.8, 83.5, 610.0, 68, 'High summer particulate matter requires supplementary tree washing.');

-- 7. Maintenance Activities
INSERT INTO maintenance (activity_title, target_type, target_id, target_name, activity_type, scheduled_date, completion_date, responsible_person, status, cost, remarks) VALUES
('Seasonal Canopy Pruning & Trimming', 'Park', 1, 'Central Botanical Garden', 'Pruning', '2026-09-15', '2026-09-17', 'Foreman Robert Diaz', 'Completed', 1200.0, 'Hazardous overhanging branches cleared along Visitor Walking Trail A.'),
('Urgent Root Treatment & Fungicide', 'Tree', 10, 'Quercus virginiana (TR-2024-010)', 'Pest Control', '2026-09-28', NULL, 'Arborist Dr. Laura Smith', 'In Progress', 450.0, 'Trenching and bio-fungicide injection underway for root health stabilization.'),
('Drip Irrigation Sensor Calibration', 'Green Belt', 2, 'Tech Park Eco Corridor Green Belt', 'Irrigation System Repair', '2026-10-05', NULL, 'Eng. Kevin Patel', 'Scheduled', 600.0, 'Upgrading 15 moisture sensors and automated flow control valves.'),
('Post-Storm Debris Clearance', 'Park', 3, 'Highland Community Park', 'General Cleaning', '2026-09-22', '2026-09-23', 'Maintenance Crew #3', 'Completed', 350.0, 'Fallen dry limbs cleared, turf restored, walking paths swept clean.'),
('Miyawaki Bio-Fertilizer Enriched Mulching', 'Urban Forest', 1, 'North Ridge Miyawaki Woodland', 'Soil Fertilization', '2026-10-12', NULL, 'EcoCare Services Ltd', 'Scheduled', 2200.0, 'Application of 5 tonnes of organic vermicompost and microbial inoculant.'),
('Neem Borer Infestation Quarantine', 'Tree', 8, 'Pongamia pinnata (TR-2024-008)', 'Pest Control', '2026-09-20', '2026-09-24', 'Arborist Dr. Laura Smith', 'Completed', 380.0, 'Organic neem oil spray and bark wrap applied. Recovery monitored.');

-- 8. Reports
INSERT INTO reports (report_title, report_type, generated_by, filter_criteria, summary_data) VALUES
('Quarterly Urban Canopy & Carbon Sequestration Audit', 'Carbon Sequestration', 'admin', 'All Zones - Q3 2026', 'Total estimated carbon sequestration: 76,500 kg CO2/year across 6 parks and 4 urban forests. Overall healthy canopy coverage: 31.4%.'),
('City Parks Health & Maintenance Compliance Review', 'Maintenance Audit', 'admin', 'Status: Active, All Wards', '94% of scheduled maintenance activities completed on schedule. Identified 2 critical vintage trees requiring arboricultural care.');

-- ==============================================================
-- Digital Urban Greenery Management System
-- Relational Database Schema
-- Compatible with MySQL (8.0+), PostgreSQL, and SQLite (3.x)
-- ==============================================================

-- 1. Users Table (System Administrators and Greenery Officers)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(20) DEFAULT 'officer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Parks Table
CREATE TABLE IF NOT EXISTS parks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(150) NOT NULL,
    ward_no VARCHAR(20),
    area_sq_m REAL NOT NULL,
    park_type VARCHAR(50) NOT NULL,
    established_year INTEGER,
    contact_officer VARCHAR(100),
    contact_phone VARCHAR(20),
    facilities TEXT,
    status VARCHAR(30) DEFAULT 'Active',
    maintenance_status VARCHAR(30) DEFAULT 'Good',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tree Inventory Table
CREATE TABLE IF NOT EXISTS trees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tree_code VARCHAR(50) NOT NULL UNIQUE,
    species VARCHAR(100) NOT NULL,
    common_name VARCHAR(100) NOT NULL,
    park_id INTEGER,
    location_details VARCHAR(150) NOT NULL,
    age_years INTEGER,
    height_m REAL,
    canopy_diameter_m REAL,
    health_status VARCHAR(30) NOT NULL,
    maintenance_status VARCHAR(40) NOT NULL,
    carbon_offset_kg REAL DEFAULT 22.0,
    planted_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (park_id) REFERENCES parks(id) ON DELETE SET NULL
);

-- 4. Urban Forests Table
CREATE TABLE IF NOT EXISTS urban_forests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    forest_name VARCHAR(100) NOT NULL,
    location VARCHAR(150) NOT NULL,
    area_hectares REAL NOT NULL,
    tree_count INTEGER DEFAULT 0,
    biodiversity_index REAL DEFAULT 3.5,
    canopy_density VARCHAR(30) DEFAULT 'Medium',
    forest_type VARCHAR(50) DEFAULT 'Miyawaki Forest',
    maintenance_status VARCHAR(30) DEFAULT 'Active',
    established_year INTEGER,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Green Belts Table
CREATE TABLE IF NOT EXISTS green_belts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    belt_name VARCHAR(100) NOT NULL,
    location VARCHAR(150) NOT NULL,
    length_km REAL NOT NULL,
    width_m REAL NOT NULL,
    area_sq_m REAL NOT NULL,
    vegetation_type VARCHAR(100) NOT NULL,
    buffer_type VARCHAR(50) DEFAULT 'Roadside',
    status VARCHAR(30) DEFAULT 'Healthy',
    maintenance_frequency VARCHAR(30) DEFAULT 'Bi-weekly',
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Environmental Performance Indicators Table
CREATE TABLE IF NOT EXISTS environmental_indicators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_date DATE NOT NULL,
    zone_name VARCHAR(100) NOT NULL,
    air_quality_index INTEGER NOT NULL,
    pm25 REAL,
    pm10 REAL,
    green_coverage_percentage REAL NOT NULL,
    carbon_absorbed_tonnes REAL NOT NULL,
    tree_survival_rate REAL NOT NULL,
    water_usage_cubic_m REAL NOT NULL,
    environmental_score INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Maintenance Management Table
CREATE TABLE IF NOT EXISTS maintenance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    activity_title VARCHAR(150) NOT NULL,
    target_type VARCHAR(30) NOT NULL,
    target_id INTEGER,
    target_name VARCHAR(150) NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    scheduled_date DATE NOT NULL,
    completion_date DATE,
    responsible_person VARCHAR(100) NOT NULL,
    status VARCHAR(30) DEFAULT 'Scheduled',
    cost REAL DEFAULT 0.0,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_title VARCHAR(150) NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    generated_by VARCHAR(100) NOT NULL,
    filter_criteria TEXT,
    summary_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_trees_park_id ON trees(park_id);
CREATE INDEX IF NOT EXISTS idx_trees_health ON trees(health_status);
CREATE INDEX IF NOT EXISTS idx_trees_species ON trees(species);
CREATE INDEX IF NOT EXISTS idx_parks_status ON parks(status);
CREATE INDEX IF NOT EXISTS idx_env_zone ON environmental_indicators(zone_name);
CREATE INDEX IF NOT EXISTS idx_maint_status ON maintenance(status);

# PROJECT REPORT

## DIGITAL URBAN GREENERY MANAGEMENT SYSTEM
**A Centralized Web-Based Platform for Municipal Green Assets, Tree Census, and Environmental Monitoring**

---

### Executive Summary

Rapid urbanization has exacerbated challenges related to microclimates, particulate air pollution, biodiversity depletion, and urban heat island (UHI) phenomena. Municipal authorities often face critical operational bottlenecks due to fragmented record-keeping across paper registers and disparate spreadsheets. Consequently, urban forestry and horticulture departments lack real-time visibility into tree canopy health, spatial green distribution, maintenance backlogs, and carbon sequestration performance.

The **Digital Urban Greenery Management System (DUGMS)** is an end-to-end full-stack web application designed to serve as a digital command center for municipal greenery. The system provides integrated modules for managing public parks, maintaining an individual biometric tree census, monitoring dense Miyawaki urban forests, cataloging linear roadside green belts, capturing environmental sensor indicators (AQI, PM2.5, PM10, tree survival rate, water usage), scheduling maintenance work orders, and compiling verifiable audit reports with one-click CSV export capability.

---

## 1. Introduction & Background

### 1.1 Problem Statement
Urban environmental authorities encounter multiple operational challenges:
1. **Data Fragmentation & Loss:** Disconnected physical logs make it difficult to determine tree counts, mortality rates, and species distributions across municipal wards.
2. **Absence of Ecological Intelligence:** Cities struggle to calculate annual greenhouse gas (CO₂) sequestration metrics or correlate tree health with local air quality indexes (AQI).
3. **Reactive Maintenance:** Lack of structured workflow scheduling leads to overlooked pruning, delayed pest control interventions, and water inefficiency.
4. **Tedious Audit & Reporting:** Preparing environmental compliance filings for state or national regulatory bodies requires weeks of manual data compilation.

### 1.2 Project Objectives
- Build a centralized relational database cataloging municipal green assets with geographic, biometric, and operational attributes.
- Provide a responsive, real-time dashboard delivering key performance indicators (KPIs) and interactive visual analytics.
- Automate calculations for tree-level and forest-level carbon sequestration using established allometric models.
- Implement an automated composite **Environmental Eco-Score** algorithm combining air quality, canopy density, and vegetation survival rates.
- Streamline maintenance scheduling with one-click status transitions and cost audits.
- Offer dynamic report generation and filtered CSV dataset export capabilities.

### 1.3 Scope of the System
The system is scoped for urban local bodies (ULBs), municipal corporations, environmental non-profits, and smart city administration teams. It encompasses 9 core functional modules operating on a secure role-based access model (Administrator and Field Officer).

---

## 2. System Architecture & Flow Diagrams

The system follows a standard **3-Tier Client-Server Architecture** characterized by clean separation of concerns:
1. **Presentation Layer (Frontend):** Modern HTML5, CSS3, Bootstrap 5.3, and Chart.js communicating via asynchronous Fetch APIs.
2. **Application / Logic Layer (Backend):** Python Flask RESTful API utilizing modular Blueprints, input validators, error handlers, and business logic algorithms.
3. **Data Layer (Database):** Relational database (SQLite/MySQL/PostgreSQL compatible) enforcing referential integrity and performance indexing.

### 2.1 High-Level 3-Tier System Architecture

```mermaid
flowchart TD
    subgraph ClientLayer["Presentation Layer (Client Browser)"]
        UI["Bootstrap 5 Responsive UI"]
        Dashboard["Chart.js Dynamic Visualizations"]
        ClientFetch["Async Fetch API Client (api.js)"]
    end

    subgraph APILayer["Application Logic Layer (Python Flask)"]
        Router["WSGI Application Router (app.py)"]
        AuthBP["Auth Blueprint (/api/auth)"]
        DashBP["Dashboard Blueprint (/api/dashboard)"]
        ParkBP["Parks Blueprint (/api/parks)"]
        TreeBP["Trees Blueprint (/api/trees)"]
        ForestBP["Urban Forests Blueprint (/api/urban-forests)"]
        BeltBP["Green Belts Blueprint (/api/green-belts)"]
        EnvBP["Environmental Blueprint (/api/environmental)"]
        MaintBP["Maintenance Blueprint (/api/maintenance)"]
        ReportBP["Reports & Export Blueprint (/api/reports)"]
        
        CalcEngine["Math Engine (Carbon & Eco-Score)"]
    end

    subgraph DataLayer["Persistence Layer (Relational Database)"]
        DBHelper["Database Abstraction (database.py)"]
        SQLiteDB[("Relational Database (urban_greenery.db)")]
        Tables["8 Relational Tables (parks, trees, etc.)"]
    end

    UI --> ClientFetch
    Dashboard --> ClientFetch
    ClientFetch <== "HTTP / JSON REST" ==> Router

    Router --> AuthBP
    Router --> DashBP
    Router --> ParkBP
    Router --> TreeBP
    Router --> ForestBP
    Router --> BeltBP
    Router --> EnvBP
    Router --> MaintBP
    Router --> ReportBP

    TreeBP --> CalcEngine
    EnvBP --> CalcEngine
    DashBP --> CalcEngine

    AuthBP --> DBHelper
    DashBP --> DBHelper
    ParkBP --> DBHelper
    TreeBP --> DBHelper
    ForestBP --> DBHelper
    BeltBP --> DBHelper
    EnvBP --> DBHelper
    MaintBP --> DBHelper
    ReportBP --> DBHelper

    DBHelper <== "SQL Queries (Parameterized)" ==> SQLiteDB
    SQLiteDB --- Tables
```

---

### 2.2 End-to-End Request & Data Flow (Sequence Diagram)

The following sequence illustrates the lifecycle of a typical client interaction—registering a tree record, computing its carbon sequestration metric, persisting the data, and updating the client interface dynamically:

```mermaid
sequenceDiagram
    autonumber
    actor Officer as Field Officer / User
    participant Browser as Web Browser (UI & JS)
    participant Flask as Flask REST Controller
    participant Engine as Carbon Calculation Engine
    participant DB as SQLite Relational Database

    Officer->>Browser: Enters Tree Details (Species, Age, Height) & clicks Save
    Browser->>Browser: Validates client inputs & packages payload as JSON
    Browser->>Flask: POST /api/trees (JSON Payload)
    
    activate Flask
    Flask->>Flask: Validates required fields & verifies Tree Code uniqueness
    Flask->>Engine: compute_carbon(age_years, height_m)
    activate Engine
    Engine-->>Flask: Returns carbon_offset_kg = 10 + (age*1.5) + (height*0.8)
    deactivate Engine

    Flask->>DB: INSERT INTO trees (...) VALUES (?, ?, ...)
    activate DB
    DB-->>Flask: Returns last_insert_rowid & 1 row affected
    deactivate DB

    Flask-->>Browser: HTTP 201 Created {'success': true, 'data': new_tree}
    deactivate Flask

    Browser->>Browser: Displays Toast Notification & updates Tree Table DOM
    Browser->>Flask: GET /api/dashboard/stats
    activate Flask
    Flask->>DB: Aggregates counts, total carbon, and health distribution
    activate DB
    DB-->>Flask: Returns aggregate metrics
    deactivate DB
    Flask-->>Browser: HTTP 200 OK (Updated KPI & Chart datasets)
    deactivate Flask
    Browser->>Officer: Dashboard charts & counter cards re-render smoothly
```

---

### 2.3 Entity-Relationship Diagram (ERD)

The relational schema strictly enforces foreign key constraints, default timestamps, and uniqueness rules:

```mermaid
erDiagram
    users ||--o{ reports : "generates"
    parks ||--o{ trees : "contains"
    parks ||--o{ maintenance : "target_asset"
    trees ||--o{ maintenance : "target_asset"
    urban_forests ||--o{ maintenance : "target_asset"
    green_belts ||--o{ maintenance : "target_asset"

    users {
        int id PK
        string username UK
        string password_hash
        string full_name
        string email UK
        string role
        timestamp created_at
    }

    parks {
        int id PK
        string name
        string location
        string ward_no
        real area_sq_m
        string park_type
        int established_year
        string contact_officer
        string contact_phone
        text facilities
        string status
        string maintenance_status
        timestamp created_at
        timestamp updated_at
    }

    trees {
        int id PK
        string tree_code UK
        string species
        string common_name
        int park_id FK
        string location_details
        int age_years
        real height_m
        real canopy_diameter_m
        string health_status
        string maintenance_status
        real carbon_offset_kg
        date planted_date
        timestamp created_at
        timestamp updated_at
    }

    urban_forests {
        int id PK
        string forest_name
        string location
        real area_hectares
        int tree_count
        real biodiversity_index
        string canopy_density
        string forest_type
        string maintenance_status
        int established_year
        text remarks
        timestamp created_at
    }

    green_belts {
        int id PK
        string belt_name
        string location
        real length_km
        real width_m
        real area_sq_m
        string vegetation_type
        string buffer_type
        string status
        string maintenance_frequency
        text remarks
        timestamp created_at
    }

    environmental_indicators {
        int id PK
        date record_date
        string zone_name
        int air_quality_index
        real pm25
        real pm10
        real green_coverage_percentage
        real carbon_absorbed_tonnes
        real tree_survival_rate
        real water_usage_cubic_m
        int environmental_score
        text notes
        timestamp created_at
    }

    maintenance {
        int id PK
        string activity_title
        string target_type
        int target_id
        string target_name
        string activity_type
        date scheduled_date
        date completion_date
        string responsible_person
        string status
        real cost
        text remarks
        timestamp created_at
    }

    reports {
        int id PK
        string report_title
        string report_type
        string generated_by
        text filter_criteria
        text summary_data
        timestamp created_at
    }
```

---

### 2.4 Maintenance Task State Machine

The maintenance management subsystem implements a finite state model ensuring work orders move predictably through audit stages:

```mermaid
stateDiagram-v2
    [*] --> Scheduled : Task Created (Officer assigns date & crew)
    Scheduled --> InProgress : Crew initiates field operations
    Scheduled --> Overdue : Scheduled date elapsed without action
    InProgress --> Completed : Work verified & completion_date logged
    InProgress --> Overdue : Work delayed beyond operational window
    Overdue --> InProgress : Rescheduled / Remedial crew assigned
    Overdue --> Completed : Delayed work executed & signed off
    Completed --> [*] : Archived in audit trail
```

---

## 3. Mathematical & Algorithmic Models

The system incorporates domain-specific ecological models implemented in backend Python routines:

### 3.1 Allometric Carbon Sequestration Model
Individual tree annual carbon offset is estimated using standard arboricultural allometric relationships based on tree maturity and physical dimensions:

$$\text{CO}_2\text{ Offset (kg/yr)} = 10.0 + (\text{Age (years)} \times 1.5) + (\text{Height (m)} \times 0.8)$$

- Where biometric data is unavailable, the system defaults to the international baseline benchmark for mature temperate/tropical trees: **$22.0\text{ kg CO}_2\text{/tree/year}$**.
- For dense Miyawaki forests, aggregate sequestration is computed across the cataloged tree census:

$$\text{Total Forest Sequestration (Tonnes)} = \frac{\sum_{i=1}^{N} \text{Tree Count}_i \times 22.0}{1000.0}$$

### 3.2 Composite Environmental Eco-Score Index
To normalize divergent environmental parameters (air pollution, canopy coverage, irrigation hydration, sapling survival) into an intuitive municipal indicator ($1 \text{ to } 100$), the system calculates:

$$\text{Eco Score} = 50.0 - \text{Penalty}_{\text{AQI}} + \text{Bonus}_{\text{Coverage}} + \text{Bonus}_{\text{Survival}}$$

Where:
$$\text{Penalty}_{\text{AQI}} = \max\left(0, (\text{AQI} - 50) \times 0.25\right)$$
$$\text{Bonus}_{\text{Coverage}} = \text{Green Coverage \%} \times 0.6$$
$$\text{Bonus}_{\text{Survival}} = (\text{Tree Survival Rate \%} - 70) \times 0.5$$

- The resulting score is constrained within the range $[10, 99]$.
- A score of $\ge 85$ indicates **Eco Grade A** (optimal balance of canopy volume, clean air, and high survival).

---

## 4. Module Specifications & Technical Implementation

| Module | Primary Interface File | Backend Blueprint | Key Functional Capabilities |
| :--- | :--- | :--- | :--- |
| **Authentication** | `login.html`, `auth.js` | `auth.py` | SHA-256 password hash verification, role enforcement (`admin`, `officer`), session management via `localStorage`. |
| **Dashboard** | `index.html`, `dashboard.js` | `dashboard.py` | Real-time aggregate KPIs (Total parks, trees, forest acreage, annual CO₂ tonnes), Chart.js species bar chart, health status donut, multi-line environmental trend. |
| **Park Management** | `parks.html`, `parks.js` | `parks.py` | Full CRUD operations, acreage filtering, ward categorization, and relational tree inspector displaying trees planted in each park. |
| **Tree Inventory** | `trees.html`, `trees.js` | `trees.py` | Tree census, automated tree code assignment (`TR-YYYY-XXX`), biometric height/age tracking, health rating badges, carbon calculation. |
| **Urban Forests** | `urban-forests.html`, `urban-forests.js` | `urban_forests.py` | Tracking dense Miyawaki reserves, biodiversity rating index ($1.0 - 5.0$), canopy density categorization (Dense, Medium, Low). |
| **Green Belts** | `green-belts.html`, `green-belts.js` | `green_belts.py` | Linear buffer tracking, automatic surface area calculation ($L\text{ [km]} \times 1000 \times W\text{ [m]}$), buffer classification (Roadside, Industrial, Coastal). |
| **Environmental Performance** | `environmental.html`, `environmental.js` | `environmental.py` | Microclimate observations (AQI, PM2.5, PM10, green coverage %, water usage), multi-zone comparison charts, automated Eco-Score evaluation. |
| **Maintenance Management** | `maintenance.html`, `maintenance.js` | `maintenance.py` | Work order scheduling across all asset types, status tagging (`Scheduled`, `In Progress`, `Completed`, `Overdue`), 1-click completion patch. |
| **Reports & Export** | `reports.html`, `reports.js` | `reports.py` | Dynamic compilation of executive audits, instant CSV dataset streaming via Python `csv.writer`, clean `@media print` print-friendly styling. |
| **Universal Search** | `api.js` (Top Navigation) | `reports.py` | Real-time debounced search dropdown querying parks, trees, forests, and green belts simultaneously. |

---

## 5. Software Quality Assurance & Testing

### 5.1 Test Methodology
A comprehensive automated test suite was developed using Python's native `unittest` framework (`tests/test_app.py`). The test harness operates on an isolated Flask test client, verifying HTTP response status codes, payload structures, calculation results, and database transactional integrity.

### 5.2 Test Matrix & Verification Results

| Test ID | Target Component | Test Case Description | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Root API | Ping `/api` health check endpoint | HTTP 200, `status: 'online'` | **PASSED** |
| **TC-02** | Auth Module | Valid login (`admin:admin123`) & Invalid password rejection | HTTP 200 with user profile; HTTP 401 on bad password | **PASSED** |
| **TC-03** | Dashboard API | Compute aggregate statistics and chart series | HTTP 200, non-zero parks/trees, arrays for species/health | **PASSED** |
| **TC-04** | Parks Module | Complete lifecycle: Create $\rightarrow$ Read $\rightarrow$ Update $\rightarrow$ Delete | HTTP 201/210 on creation, 200 on edit, 200 on deletion, 404 on re-fetch | **PASSED** |
| **TC-05** | Trees Module | Add tree, verify automated carbon computation, update health | HTTP 201, carbon offset matches formula, HTTP 200 on update | **PASSED** |
| **TC-06** | Urban Forests | Add Miyawaki forest, verify biodiversity rating, delete | HTTP 201, correct acreage and tree count, HTTP 200 on cleanup | **PASSED** |
| **TC-07** | Green Belts | Register roadside corridor, check dimension math, delete | HTTP 201, area computed as $L \times W$, HTTP 200 on deletion | **PASSED** |
| **TC-08** | Environmental | Log AQI & water metrics, fetch multi-zone analytics | HTTP 201, calculated eco score within $[10, 99]$, 200 on analytics | **PASSED** |
| **TC-09** | Maintenance | Schedule work order, perform quick 1-click status patch | HTTP 201, PATCH updates status to 'Completed' with today's date | **PASSED** |
| **TC-10** | Reports & CSV | Compile summary audit & stream raw CSV file download | HTTP 201 report created; HTTP 200 with `text/csv` header | **PASSED** |

**Execution Result:**
```text
----------------------------------------------------------------------
Ran 10 tests in 0.803s
OK
```

---

## 6. Challenges Encountered & Engineering Solutions

1. **Database Multi-RDBMS Compatibility:**
   - *Challenge:* Ensuring that the application works seamlessly on a standard student laptop with zero prerequisite software, while simultaneously providing enterprise-grade SQL compatibility for production MySQL/PostgreSQL deployment.
   - *Solution:* Implemented a database abstraction layer (`backend/database.py`) using standard SQL datatypes, dynamic auto-initialization from `schema.sql` and `seed_data.sql`, and row-factory dictionaries.
2. **Dynamic Mathematical Imputation:**
   - *Challenge:* Missing or partial biometric values (e.g. unknown tree planting date or height) led to null carbon values in naive calculations.
   - *Solution:* Engineered fallback interpolation logic in Python calculating estimated carbon from age and height where available, and falling back gracefully to the international arboricultural constant of $22.0\text{ kg/year}$.
3. **Canvas Distortion in Responsive Layouts:**
   - *Challenge:* Chart.js `<canvas>` elements distorted or overflowed when viewport widths transitioned between mobile and multi-column desktop displays.
   - *Solution:* Wrapped each chart in a parent container with relative positioning and fixed height constraints, configured `maintainAspectRatio: false`, and utilized Bootstrap responsive grid breakpoints (`col-xl`, `col-lg`, `col-md`).
4. **Relational Deletion Integrity:**
   - *Challenge:* Deleting a park record with assigned trees could cause orphaned references or foreign key violation crashes.
   - *Solution:* Added `FOREIGN KEY (park_id) REFERENCES parks(id) ON DELETE SET NULL` constraints so tree records remain intact as unassigned/roadside greenery rather than crashing the system.

---

## 7. Future Enhancements

1. **GIS & Geospatial Satellite Mapping:** Incorporate Leaflet.js or Mapbox GL to visualize geospatial tree coordinates, park boundary polygons, and NDVI (Normalized Difference Vegetation Index) satellite imagery overlays.
2. **IoT Sensor Ingestion Pipeline:** Connect automated MQTT sensor endpoints for continuous real-time logging of soil moisture, ambient humidity, and solar radiation in high-density Miyawaki reserves.
3. **Computer Vision Disease Classification:** Develop a companion deep-learning classifier (MobileNet / YOLO) enabling field arborists to upload photographs of tree leaves or bark to identify borer infestations and fungal blights.
4. **Offline-First Field Progressive Web App (PWA):** Implement service workers and IndexedDB storage so field workers can catalog trees in rural parks with zero cellular reception and synchronize upon reconnection.

---

### Conclusion
The **Digital Urban Greenery Management System** demonstrates a full-stack, modular, and scientifically grounded solution to municipal urban forestry management. By unifying physical asset tracking with ecological carbon estimation, operational work orders, and dynamic data visualizations, the system empowers city planners to make informed, data-driven decisions that enhance urban sustainability and climate resilience.

# 🌿 Digital Urban Greenery Management System (MERN Stack)

> A modern, full-stack web application designed for municipal corporations, urban forestry departments, and environmental planning authorities to monitor urban parks, manage tree census inventories, oversee urban forest reserves, track green belts, and analyze real-time environmental performance indicators.

---

## 📋 Table of Contents
1. [Project Overview](#-project-overview)
2. [Technology Stack](#-technology-stack)
3. [Folder Structure](#-folder-structure)
4. [Database Architecture & Schemas](#-database-architecture--schemas)
5. [REST API Documentation](#-rest-api-documentation)
6. [Installation & Setup Guide](#-installation--setup-guide)
7. [Running the Application](#-running-the-application)
8. [Sample Login Credentials](#-sample-login-credentials)
9. [Module-by-Module Explanation](#-module-by-module-explanation)
10. [Testing & Verification Guide](#-testing--verification-guide)
11. [Completed Features Matrix](#-completed-features-matrix)
12. [Challenges Faced & Solutions Implemented](#-challenges-faced--solutions-implemented)
13. [Future Enhancements](#-future-enhancements)

---

## 🏙️ Project Overview

Rapid urban expansion has led to shrinking green cover, rising particulate pollution, and urban heat island effects. The **Digital Urban Greenery Management System** provides a centralized municipal digital platform for:
- **Comprehensive Park Management**: Cataloging public parks, botanical gardens, and community greenspaces with areas, facilities, and assigned officers.
- **Tree Census & Biometric Inventory**: Tagging trees with RFID/codes, tracking botanical species, growth dimensions, carbon absorption, and vitality health statuses.
- **Urban Forest & Green Belt Surveillance**: Monitoring high-density Miyawaki forests, biodiversity indices, and arterial highway green buffer strips.
- **Environmental Telemetry**: Recording and analyzing AQI (Air Quality Index), PM2.5, PM10, municipal water consumption, and green coverage correlation.
- **Horticultural Maintenance Hub**: Scheduling pruning, drip irrigation, pest management, and sapling replacements with status workflows.
- **Live Executive Audits & Reporting**: Generating printable and downloadable audit reports with instant database metric calculation.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, React Router v6, Chart.js 4, React-Chartjs-2, Lucide React Icons |
| **Styling** | Modern Nature-Inspired Custom CSS, CSS Variables, Responsive Grid, Glassmorphic Modals |
| **Backend** | Node.js (v24), Express.js 4, RESTful Architecture, JWT Authentication, Bcrypt.js |
| **Database** | MongoDB with Mongoose ODM (Plus Auto-Activating Zero-Config In-Memory Storage Engine) |
| **Academic SQL** | Relational Schemas included for MySQL, PostgreSQL, and SQLite evaluation |

---

## 📂 Folder Structure

```
digital-urban-greenery/
├── package.json                   # Root package scripts
├── start_backend.bat              # 1-Click Windows Backend Launcher
├── start_frontend.bat             # 1-Click Windows Frontend Launcher
├── seed_database.bat              # 1-Click Database Seeder
├── database/                      # Schemas & SQL Scripts
│   ├── mongodb_schema.json        # MongoDB Document JSON Schema
│   ├── schema.sql                 # Generic Relational Schema
│   ├── schema_mysql.sql           # MySQL / MariaDB Schema (InnoDB)
│   ├── schema_postgresql.sql      # PostgreSQL DDL
│   └── seed_data.sql              # Relational SQL Seed Records
├── server/                        # Express Backend
│   ├── .env                       # Environment Variables (Port, Mongo URI, JWT Secret)
│   ├── .env.example
│   ├── package.json
│   ├── server.js                  # Main Server Entry Point
│   ├── config/
│   │   └── db.js                  # Smart MongoDB Connector with Zero-Config Fallback
│   ├── models/                    # Mongoose Data Models
│   │   ├── User.js
│   │   ├── Park.js
│   │   ├── Tree.js
│   │   ├── UrbanForest.js
│   │   ├── GreenBelt.js
│   │   ├── EnvironmentalIndicator.js
│   │   ├── Maintenance.js
│   │   └── Report.js
│   ├── controllers/               # Business Logic & CRUD Controllers
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── parkController.js
│   │   ├── treeController.js
│   │   ├── urbanForestController.js
│   │   ├── greenBeltController.js
│   │   ├── environmentalController.js
│   │   ├── maintenanceController.js
│   │   └── reportController.js
│   ├── routes/                    # RESTful Endpoints Routing
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── parkRoutes.js
│   │   ├── treeRoutes.js
│   │   ├── urbanForestRoutes.js
│   │   ├── greenBeltRoutes.js
│   │   ├── environmentalRoutes.js
│   │   ├── maintenanceRoutes.js
│   │   └── reportRoutes.js
│   ├── middleware/
│   │   ├── auth.js                # JWT Protect & Role-Based Access Control
│   │   └── errorHandler.js        # Global JSON Error Handler
│   ├── data/
│   │   ├── seedData.js            # Comprehensive Sample Dataset
│   │   └── embeddedStore.js       # In-Memory Database Engine
│   └── scripts/
│       └── seed.js                # Standalone MongoDB Seeder Script
└── client/                        # Vite + React Frontend
    ├── index.html                 # HTML5 Entry Point
    ├── package.json
    ├── vite.config.js             # Vite Config & API Proxy
    ├── src/
    │   ├── main.jsx               # React Root
    │   ├── App.jsx                # Router & Protected Layout
    │   ├── index.css              # Custom Greenery Design System
    │   ├── context/
    │   │   └── AuthContext.jsx    # Authentication & User State
    │   ├── services/
    │   │   └── api.js             # Axios Client & Interceptors
    │   ├── components/
    │   │   ├── Sidebar.jsx        # Responsive Collapsible Sidebar
    │   │   ├── Navbar.jsx         # Header & Status Badges
    │   │   ├── StatCard.jsx       # Reusable KPI Metrics Card
    │   │   ├── Modal.jsx          # Accessible Popup Modal
    │   │   ├── ConfirmModal.jsx   # Deletion Confirmation Prompt
    │   │   └── Toast.jsx          # Alert Banner Toasts
    │   └── pages/
    │       ├── Login.jsx          # Split-screen Auth with 1-Click Demo Buttons
    │       ├── Register.jsx       # New Officer Account Creation
    │       ├── Dashboard.jsx      # KPI Cards, 3 Interactive Charts, Activities
    │       ├── Parks.jsx          # Park Directory, Modals, Full CRUD
    │       ├── Trees.jsx          # Tree Census, Health Filtering, Carbon Calcs
    │       ├── UrbanForests.jsx   # Woodland Reserves & Miyawaki Tracking
    │       ├── GreenBelts.jsx     # Buffer Strips & Roadside Screens
    │       ├── Environmental.jsx  # AQI Telemetry, PM2.5, Water, Score Gauges
    │       ├── Maintenance.jsx    # Work Order Scheduler & Completion Toggles
    │       └── Reports.jsx        # Live Audit Generator, PDF/Print View
```

---

## 🗄️ Database Architecture & Schemas

### MongoDB Mongoose Models & Schemas

1. **`User` Collection**:
   - `name`: String (required)
   - `email`: String (unique, required, lowercase)
   - `password`: String (bcrypt hashed, min 6 chars)
   - `role`: Enum `['Admin', 'Forest Officer', 'Urban Planner', 'Field Inspector']`
   - `department`: String
   - `createdAt`: Date

2. **`Park` Collection**:
   - `name`: String (required)
   - `location`: String (required)
   - `wardNo`: String
   - `areaSqM`: Number (required, min 0)
   - `parkType`: Enum `['Public Park', 'Botanical Garden', 'Children Park', 'Ecological Park', 'Neighborhood Park', 'Heritage Garden']`
   - `establishedYear`: Number
   - `contactOfficer`: String
   - `contactPhone`: String
   - `facilities`: Array of Strings
   - `status`: Enum `['Active', 'Under Renovation', 'Planned', 'Temporarily Closed']`
   - `maintenanceStatus`: Enum `['Excellent', 'Good', 'Fair', 'Needs Maintenance']`
   - `treeCount`: Number

3. **`Tree` Collection**:
   - `treeCode`: String (unique RFID code, e.g., `TR-PARK-001`)
   - `species`: String (common name, e.g., `Neem`, `Banyan`, `Gulmohar`)
   - `scientificName`: String (e.g., `Azadirachta indica`)
   - `location`: String (specific coordinates/quadrant)
   - `park`: ObjectId (Reference to `Park`)
   - `parkName`: String
   - `ageYears`: Number
   - `heightMeters`: Number
   - `canopyDiameterMeters`: Number
   - `healthStatus`: Enum `['Healthy', 'Needs Care', 'Diseased', 'Critical']`
   - `maintenanceStatus`: Enum `['Regular', 'Scheduled', 'Urgent', 'Under Treatment']`
   - `plantedDate`: Date
   - `carbonAbsorptionKgPerYear`: Number
   - `notes`: String

4. **`UrbanForest` Collection**:
   - `forestName`: String
   - `location`: String
   - `areaHectares`: Number
   - `treeCount`: Number
   - `canopyCoverPercentage`: Number (0-100)
   - `biodiversityIndex`: Number (0.0 - 5.0)
   - `establishedYear`: Number
   - `supervisor`: String
   - `status`: Enum `['Protected Reserve', 'Developing Woodland', 'Restoration Area', 'Miyawaki Forest']`
   - `maintenanceStatus`: String
   - `dominantFlora`: Array of Strings

5. **`GreenBelt` Collection**:
   - `beltName`: String
   - `location`: String
   - `lengthKm`: Number
   - `widthMeters`: Number
   - `areaSqM`: Number (computed as `lengthKm * 1000 * widthMeters`)
   - `vegetationType`: Enum `['Dense Tree Line', 'Shrub & Hedge Buffer', 'Mixed Canopy', 'Grass & Perennial Strip', 'Acoustic Barrier']`
   - `status`: Enum `['Optimal', 'Under Maintenance', 'Encroachment Risk', 'Expansion Phase']`
   - `maintenanceInfo`: String
   - `soilType`: String
   - `irrigationType`: Enum `['Drip Irrigation', 'Sprinkler', 'Treated Water Tanker', 'Rain-fed']`

6. **`EnvironmentalIndicator` Collection**:
   - `recordDate`: Date
   - `zoneLocation`: String
   - `aqi`: Number (0-500)
   - `pm25`: Number (µg/m³)
   - `pm10`: Number (µg/m³)
   - `greenCoveragePercentage`: Number
   - `carbonAbsorptionTonnesYear`: Number
   - `treeSurvivalRate`: Number (0-100%)
   - `waterUsageKLMonth`: Number
   - `environmentalScore`: Number (composite index 0-100)
   - `recordedBy`: String
   - `remarks`: String

7. **`Maintenance` Collection**:
   - `targetType`: Enum `['Park', 'Tree', 'Urban Forest', 'Green Belt', 'General Facility']`
   - `targetName`: String
   - `activityType`: Enum `['Pruning & Trimming', 'Irrigation & Watering', 'Pest Control', 'Fertilizer Application', 'Tree Planting', 'Health Inspection', 'Soil Aeration', 'Trash Cleanup']`
   - `scheduledDate`: Date
   - `completedDate`: Date
   - `responsibleTeam`: String
   - `priority`: Enum `['Low', 'Medium', 'High', 'Urgent']`
   - `cost`: Number
   - `status`: Enum `['Scheduled', 'In Progress', 'Completed', 'Cancelled']`
   - `remarks`: String

8. **`Report` Collection**:
   - `reportTitle`: String
   - `reportType`: String
   - `generatedBy`: String
   - `filterParams`: Object
   - `metrics`: Object (totalParks, totalTrees, healthyTreesCount, totalForestHectares, totalGreenBeltKm, avgAqi, totalCarbonAbsorptionTonnes)
   - `summaryNotes`: String

---

## 📡 REST API Documentation

### Base URL: `http://localhost:5000/api`

| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **System** | `GET` | `/` | API Information, Active Storage Engine & Endpoints |
| **System** | `GET` | `/health` | Server uptime and database connectivity health status |
| **Auth** | `POST` | `/auth/register` | Register new municipal user account |
| **Auth** | `POST` | `/auth/login` | Authenticate user & return JWT Bearer token |
| **Auth** | `GET` | `/auth/me` | Fetch currently logged in user profile (Protected) |
| **Dashboard** | `GET` | `/dashboard/stats` | Aggregated statistics, chart datasets, and recent activities |
| **Parks** | `GET` | `/parks` | Get all parks with optional `?search=`, `?type=`, `?status=` |
| **Parks** | `POST` | `/parks` | Create a new park record |
| **Parks** | `GET` | `/parks/:id` | Get single park details and all trees inside this park |
| **Parks** | `PUT` | `/parks/:id` | Update park details |
| **Parks** | `DELETE`| `/parks/:id` | Delete park record |
| **Trees** | `GET` | `/trees` | Get tree census with `?search=`, `?healthStatus=`, `?parkId=` |
| **Trees** | `POST` | `/trees` | Register new census tree (auto-increments park tree count) |
| **Trees** | `GET` | `/trees/:id` | Get single tree passport details |
| **Trees** | `PUT` | `/trees/:id` | Update tree biometric/health data |
| **Trees** | `DELETE`| `/trees/:id` | Remove tree from census (auto-decrements park tree count) |
| **Forests** | `GET` | `/urban-forests` | Get all urban forest reserves |
| **Forests** | `POST` | `/urban-forests` | Register a new urban forest reserve |
| **Forests** | `GET` | `/urban-forests/:id`| Get single urban forest reserve |
| **Forests** | `PUT` | `/urban-forests/:id`| Update urban forest record |
| **Forests** | `DELETE`| `/urban-forests/:id`| Delete urban forest record |
| **Green Belts** | `GET` | `/green-belts` | Get all green belts with `?vegetationType=`, `?status=` |
| **Green Belts** | `POST` | `/green-belts` | Register new green belt |
| **Green Belts** | `GET` | `/green-belts/:id` | Get single green belt details |
| **Green Belts** | `PUT` | `/green-belts/:id` | Update green belt record |
| **Green Belts** | `DELETE`| `/green-belts/:id` | Delete green belt record |
| **Environmental**| `GET` | `/environmental-indicators` | Get historical environmental readings |
| **Environmental**| `GET` | `/environmental-indicators/latest` | Get latest telemetry reading |
| **Environmental**| `POST` | `/environmental-indicators` | Log new environmental observation (computes eco score) |
| **Environmental**| `PUT` | `/environmental-indicators/:id` | Update environmental record |
| **Environmental**| `DELETE`| `/environmental-indicators/:id` | Delete environmental record |
| **Maintenance**| `GET` | `/maintenance` | Get maintenance tasks with `?status=`, `?targetType=` |
| **Maintenance**| `POST` | `/maintenance` | Schedule new maintenance work order |
| **Maintenance**| `GET` | `/maintenance/:id` | Get single maintenance task details |
| **Maintenance**| `PUT` | `/maintenance/:id` | Update maintenance task / mark as completed |
| **Maintenance**| `DELETE`| `/maintenance/:id` | Delete maintenance task |
| **Reports** | `GET` | `/reports` | Get archive of all generated reports |
| **Reports** | `POST` | `/reports/generate` | Generate live audit snapshot from database |
| **Reports** | `GET` | `/reports/:id` | Get single generated report |
| **Reports** | `DELETE`| `/reports/:id` | Delete report snapshot |

---

## ⚡ Installation & Setup Guide

### Prerequisites
- **Node.js** (v18.0.0 or higher - recommended v20+ or v24)
- **npm** (v9+ or v11+)
- *(Optional)* **MongoDB Community Server** running locally on port 27017 or a MongoDB Atlas connection string.
  > **Note**: If MongoDB is not installed or not running, the application **automatically activates its built-in Zero-Config In-Memory Storage Engine**, allowing 100% of the features, authentication, and CRUD operations to work without any configuration!

### Step 1: Clone or Navigate to Directory
```bash
cd C:\Users\moham\.gemini\antigravity\scratch\digital-urban-greenery
```

### Step 2: Install Backend Dependencies
```bash
cd server
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd ../client
npm install
```

### Step 4: Configure Environment Files
- Backend `.env` (`server/.env`):
  ```ini
  PORT=5000
  MONGODB_URI=mongodb://127.0.0.1:27017/urban_greenery
  JWT_SECRET=super_secret_jwt_token_for_urban_greenery_2026
  NODE_ENV=development
  ```
- Frontend `.env` (`client/.env`):
  ```ini
  VITE_API_URL=http://localhost:5000/api
  ```

---

## 🚀 Running the Application

### Option A: Using Windows 1-Click Launchers
Simply double-click the included batch scripts:
1. Run `start_backend.bat` (Starts Node/Express server on `http://localhost:5000`)
2. Run `start_frontend.bat` (Starts Vite/React development server on `http://localhost:3000`)

### Option B: Using Terminal Commands
**Terminal 1 (Backend):**
```bash
cd server
npm start
```
*Output:*
```
🌿 [MongoDB Connected] OR 💡 [Zero-Config Fallback Active]
🚀 Server running in development mode on http://localhost:5000
📡 Ready to receive REST API requests!
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```
*Output:*
```
  VITE v5.2.8  ready in 350 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

Open your browser and navigate to: **`http://localhost:3000`**

---

## 🔑 Sample Login Credentials

For quick viva demonstration and evaluation, the login page includes **1-Click Auto-Fill Demo Buttons**:

| Role | Email Address | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin Officer** | `admin@greencity.org` | `admin123` | Full administrative access, audit generation, deletions |
| **Forest Officer** | `officer@greencity.org` | `officer123` | Park, tree inventory & maintenance management |
| **Field Inspector** | `inspector@greencity.org` | `inspector123` | Field telemetry observation & tree health logging |

You can also click **"Register Here"** to create a new custom account anytime.

---

## 🔍 Module-by-Module Explanation

### Module 1: Authentication & Authorization
- Secure JWT-based session handling with bcrypt password encryption.
- Role-based badges (Admin, Forest Officer, Urban Planner, Field Inspector).
- Token storage in `localStorage` with automatic Authorization header injection via Axios request interceptors.

### Module 2: Executive Dashboard
- **6 KPI Summary Cards**: Total Parks, Total Trees, Forest Area (Ha), Green Belts (Km), Annual Carbon Absorption (Tonnes), and Air Quality Index (AQI).
- **Interactive Visualizations**:
  - *Bar Chart*: Dominant tree species distribution in the municipal census.
  - *Doughnut Chart*: Tree vitality health breakdown (Healthy, Needs Care, Diseased, Critical).
  - *Multi-Axis Line Chart*: Correlation between expanding green cover % and AQI pollution levels over time.
- **Recent Activities Stream**: Live work order progress feed.

### Module 3: Park Management
- Catalogs municipal parks, botanical reserves, children's play areas, and heritage gardens.
- Records area in square meters, established year, supervisory officer contact phone, and comma-separated facilities.
- Modal forms with instant validation for Adding and Editing parks.
- Detailed modal viewer showing park dimensions, officer contacts, and facility badges.

### Module 4: Tree Inventory & Census
- RFID/Code-tagged digital census (e.g. `TR-PARK-001`).
- Biometric tracking: Common species, botanical scientific name, age (years), height (meters), canopy diameter (meters).
- Automatic annual carbon sequestration estimation (in kg CO₂/year).
- Dynamic sync: Adding a tree to a park automatically increments that park's tree count in the database!

### Module 5: Urban Forest Management
- Manages high-density woodland reserves and Miyawaki afforestation projects.
- Monitors reserve acreage (hectares), estimated trees, canopy coverage percentage, and biodiversity index (0.0 to 5.0).
- Tracks dominant flora (Teak, Neem, Sal, Bamboo, Dhaw).

### Module 6: Green Belt Management
- Records linear buffer strips along arterial roads, highway bypasses, and industrial borders.
- Tracks length (km), width (meters), calculated square meters, soil classification, and irrigation types (Drip, Sprinkler, Treated Water Tanker).

### Module 7: Environmental Performance
- Ingests telemetry logs from municipal weather & air stations.
- Records AQI, PM2.5, PM10, green coverage %, tree sapling survival rate %, and water usage in kilo-liters.
- Automated composite **City Eco Health Score (0-100)** calculation balancing foliage, survival rates, and inverse pollution.

### Module 8: Horticultural Maintenance Hub
- Scheduler for pruning, irrigation, pest control, fertilization, soil aeration, and sapling replacements.
- Tracks assigned team, budget/cost (₹), priority flags, and execution status.
- Includes a 1-click **"Mark as Completed"** action that automatically sets the completion timestamp.

### Module 9: Reports & Analytics
- Live snapshot engine that queries current database collections and generates an official audit report.
- Printable/exportable PDF layout complete with summary KPI cards, narrative analysis, and digital verification seal.
- Historical archive of generated audit snapshots with deletion and re-viewing options.

---

## 🧪 Testing & Verification Guide

1. **Verify Database Auto-Seed**:
   - Start the backend. Observe that the console logs successful connection or embedded store initialization with realistic sample data.
2. **Verify Login**:
   - Navigate to `http://localhost:3000/login`.
   - Click the "Admin Officer" pill to auto-fill `admin@greencity.org` / `admin123`.
   - Click "Sign In" and verify smooth redirection to the Dashboard.
3. **Verify Dashboard Charts**:
   - Confirm that the 6 KPI cards show accurate numbers (e.g., 5 Parks, 8+ Census Trees, 245.7 Ha Forest).
   - Check the Tree Species Bar Chart and Tree Health Doughnut Chart for responsive hover tooltips.
4. **Test CRUD in Parks**:
   - Go to `/parks` -> Click "+ Add New Park" -> Fill in name "Shalimar Ecological Garden" -> Submit -> Verify it appears in the table.
   - Click "Edit" icon -> Change status to "Under Renovation" -> Submit -> Verify badge updates.
   - Click "Delete" icon -> Confirm in modal -> Verify deletion.
5. **Test CRUD in Trees**:
   - Go to `/trees` -> Click "+ Register New Tree" -> Select park -> Submit -> Verify record is added and park count increments.
6. **Test Search & Filters**:
   - Type "Neem" in the Tree Inventory search box -> Verify instant filtering.
   - Filter by "Needs Care" -> Verify only trees requiring attention are displayed.
7. **Test Maintenance Completion**:
   - Go to `/maintenance` -> Find a "Scheduled" task -> Click the green Checkmark icon -> Verify status immediately changes to "Completed".
8. **Test Report Generation & Print**:
   - Go to `/reports` -> Click "+ Generate New Report" -> Enter a title -> Click "Generate Live Audit" -> Observe instant calculation.
   - Click "Print / Export PDF" -> Verify clean browser print dialog opens.

---

## 📊 Completed Features Matrix

| Requirement / Module | Status | Implementation Details |
| :--- | :---: | :--- |
| **MERN Stack Architecture** | ✅ Completed | React 18 frontend + Express.js backend + MongoDB Mongoose |
| **User Authentication** | ✅ Completed | JWT, bcrypt password hashing, 1-click sample login buttons |
| **Executive Dashboard** | ✅ Completed | 6 StatCards + Species Bar Chart + Health Doughnut + AQI Line Chart |
| **Park Management (CRUD)** | ✅ Completed | Full Create, Read, Update, Delete with type & status filtering |
| **Tree Inventory (CRUD)** | ✅ Completed | Biometrics, RFID codes, species search, auto park tree count sync |
| **Urban Forest Management** | ✅ Completed | Hectares, tree count, canopy %, biodiversity score 0-5.0 |
| **Green Belt Management** | ✅ Completed | Length/width/area calculation, vegetation type, irrigation type |
| **Environmental Performance** | ✅ Completed | AQI, PM2.5, PM10, green coverage %, carbon capture, eco score |
| **Maintenance Management** | ✅ Completed | Activity scheduler, cost tracking, 1-click "Mark Completed" |
| **Reports & Analytics** | ✅ Completed | Live dynamic metric calculation, audit archive, print/PDF view |
| **Global Search & Filter** | ✅ Completed | Real-time text search and category select dropdowns across all lists |
| **Responsive UI Design** | ✅ Completed | Desktop & mobile friendly with collapsible sliding drawer sidebar |
| **Zero-Config Database Fallback**| ✅ Completed | Never crashes if MongoDB daemon is absent; runs seamlessly anywhere |
| **Relational SQL Scripts** | ✅ Completed | SQL DDL scripts for MySQL, PostgreSQL, SQLite included in `/database` |

---

## 💡 Challenges Faced & Solutions Implemented

1. **Challenge: Database Connectivity in Offline / Student Presentation Environments**
   - *Problem*: Examiners and students often test web applications on machines where MongoDB daemon (`mongod`) is not pre-installed or running, leading to immediate unhandled connection crashes.
   - *Solution*: Engineered a resilient dual-mode database connector in `server/config/db.js`. It attempts to connect to MongoDB with a 2.5s timeout. If unavailable, it seamlessly activates a high-performance in-memory collection engine pre-populated with identical seed records. All CRUD APIs, search filters, and JWT authentication remain 100% operational.

2. **Challenge: Cross-Collection Synchronization**
   - *Problem*: Adding or removing trees manually could lead to discrepancies with park-level tree counts.
   - *Solution*: Implemented relational hooks in `treeController.js`. When a new tree is registered and assigned to a park, the corresponding park's `treeCount` is atomically incremented. Deleting a tree automatically decrements the count.

3. **Challenge: Dynamic Multi-Factor Environmental Scoring**
   - *Problem*: Presenting single indicators (like raw AQI) does not give municipal authorities a holistic view of urban green performance.
   - *Solution*: Implemented a composite environmental health algorithm:
     $$\text{Score} = (\text{Green Coverage} \times 0.35) + (\text{Tree Survival Rate} \times 0.35) + \left(\max\left(0, 100 - \frac{\text{AQI}}{3}\right) \times 0.30\right)$$
     This bounds the municipal score neatly between 0 and 100 and rewards high green cover while penalizing high particulate pollution.

4. **Challenge: Responsive Data Table & Chart Layouts**
   - *Problem*: Data-dense tables and canvas-based charts often overflow on tablet and mobile viewports.
   - *Solution*: Wrapped all tables in responsive overflow containers with sticky action columns, and set `maintainAspectRatio: false` with fixed CSS container heights on all Chart.js components. Added a collapsible sliding sidebar drawer with a backdrop blur overlay.

---

## 🚀 Suggestions for Future Enhancement

1. **IoT Sensor & Drone Lidar Integration**: Direct ingestion of aerial drone multispectral imagery to automatically calculate canopy leaf area index (LAI).
2. **GIS & Interactive Leaflet/Mapbox Mapping**: Displaying GPS coordinate markers for every tagged tree and interactive polygon boundary maps for parks and green belts.
3. **Citizen Mobile Portal**: A public mobile app allowing residents to report fallen branches, request tree adoption, or report tree felling violations with geo-tagged photos.
4. **Machine Learning Disease Diagnosis**: Integrating an image classification model (e.g. MobileNet/TensorFlow.js) to diagnose tree leaf diseases from field photos taken by inspectors.
5. **Municipal QR Code Physical Tagging**: Generating printable QR code plates for park visitors to scan and learn the botanical heritage of centennial trees.

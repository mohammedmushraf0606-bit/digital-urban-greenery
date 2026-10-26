const bcrypt = require('bcryptjs');

const initialUsers = [
  {
    _id: '661000000000000000000001',
    name: 'Dr. Aarav Sharma',
    email: 'admin@greencity.org',
    password: 'admin123', // Will be hashed in seed / fallback
    role: 'Admin',
    department: 'Urban Forestry & Environmental Planning',
    createdAt: new Date('2026-01-10T10:00:00Z')
  },
  {
    _id: '661000000000000000000002',
    name: 'Priya Nambiar',
    email: 'officer@greencity.org',
    password: 'officer123',
    role: 'Forest Officer',
    department: 'Municipal Parks & Horticulture Division',
    createdAt: new Date('2026-01-15T11:30:00Z')
  },
  {
    _id: '661000000000000000000003',
    name: 'Vikramaditya Roy',
    email: 'inspector@greencity.org',
    password: 'inspector123',
    role: 'Field Inspector',
    department: 'Green Belt Surveillance & Census',
    createdAt: new Date('2026-02-01T09:00:00Z')
  }
];

const initialParks = [
  {
    _id: '662000000000000000000001',
    name: 'Central Eco Botanical Park',
    location: 'Sector 14, Civil Lines, North Zone',
    wardNo: 'Ward 12',
    areaSqM: 45000,
    parkType: 'Botanical Garden',
    establishedYear: 2012,
    contactOfficer: 'Dr. Aarav Sharma',
    contactPhone: '+91 98112 34567',
    facilities: ['Medicinal Herb Garden', 'Walking Trail', 'Solar Lighting', 'Drip Sprinklers', 'Butterfly House'],
    status: 'Active',
    maintenanceStatus: 'Excellent',
    treeCount: 380,
    imageUrl: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-01')
  },
  {
    _id: '662000000000000000000002',
    name: 'Riverside Community Green Haven',
    location: 'Yamuna Promenade, East Ward',
    wardNo: 'Ward 05',
    areaSqM: 28500,
    parkType: 'Public Park',
    establishedYear: 2017,
    contactOfficer: 'Priya Nambiar',
    contactPhone: '+91 98223 45678',
    facilities: ['Jogging Track', 'Children Play Zone', 'Rainwater Harvesting Pond', 'Open Gym'],
    status: 'Active',
    maintenanceStatus: 'Good',
    treeCount: 245,
    imageUrl: 'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-02')
  },
  {
    _id: '662000000000000000000003',
    name: 'Mayur Biodiversity Nature Park',
    location: 'Southern Ridge Boundary, South Sector',
    wardNo: 'Ward 24',
    areaSqM: 82000,
    parkType: 'Ecological Park',
    establishedYear: 2015,
    contactOfficer: 'Vikramaditya Roy',
    contactPhone: '+91 98334 56789',
    facilities: ['Bird Watching Tower', 'Native Tree Arboretum', 'Composting Unit', 'Cycling Trail'],
    status: 'Active',
    maintenanceStatus: 'Excellent',
    treeCount: 620,
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-05')
  },
  {
    _id: '662000000000000000000004',
    name: 'Indira Smriti Neighborhood Park',
    location: 'Block C, Housing Colony, West Zone',
    wardNo: 'Ward 08',
    areaSqM: 12400,
    parkType: 'Neighborhood Park',
    establishedYear: 2008,
    contactOfficer: 'Priya Nambiar',
    contactPhone: '+91 98445 67890',
    facilities: ['Senior Citizen Gazebo', 'Children Swing Area', 'Flower Beds'],
    status: 'Under Renovation',
    maintenanceStatus: 'Needs Maintenance',
    treeCount: 95,
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-08')
  },
  {
    _id: '662000000000000000000005',
    name: 'Shanti Heritage Woodland Garden',
    location: 'Old Fort Enclave, Heritage District',
    wardNo: 'Ward 02',
    areaSqM: 34000,
    parkType: 'Heritage Garden',
    establishedYear: 1998,
    contactOfficer: 'Dr. Aarav Sharma',
    contactPhone: '+91 98556 78901',
    facilities: ['Centennial Banyan Grove', 'Water Fountain', 'Botanical Signboards'],
    status: 'Active',
    maintenanceStatus: 'Good',
    treeCount: 310,
    imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-10')
  }
];

const initialTrees = [
  {
    _id: '663000000000000000000001',
    treeCode: 'TR-PARK-001',
    species: 'Neem',
    scientificName: 'Azadirachta indica',
    location: 'Central Lawn East, Near Fountain',
    park: '662000000000000000000001',
    parkName: 'Central Eco Botanical Park',
    ageYears: 18,
    heightMeters: 14.5,
    canopyDiameterMeters: 9.2,
    healthStatus: 'Healthy',
    maintenanceStatus: 'Regular',
    plantedDate: new Date('2008-07-15'),
    carbonAbsorptionKgPerYear: 28.5,
    notes: 'Exhibits robust medicinal foliage and dense canopy.'
  },
  {
    _id: '663000000000000000000002',
    treeCode: 'TR-PARK-002',
    species: 'Banyan',
    scientificName: 'Ficus benghalensis',
    location: 'North Quadrant Heritage Circle',
    park: '662000000000000000000005',
    parkName: 'Shanti Heritage Woodland Garden',
    ageYears: 42,
    heightMeters: 22.0,
    canopyDiameterMeters: 26.0,
    healthStatus: 'Healthy',
    maintenanceStatus: 'Regular',
    plantedDate: new Date('1984-08-20'),
    carbonAbsorptionKgPerYear: 65.0,
    notes: 'Protected keystone heritage tree with 12 aerial prop roots.'
  },
  {
    _id: '663000000000000000000003',
    treeCode: 'TR-PARK-003',
    species: 'Gulmohar (Royal Poinciana)',
    scientificName: 'Delonix regia',
    location: 'Jogging Track Border, North End',
    park: '662000000000000000000002',
    parkName: 'Riverside Community Green Haven',
    ageYears: 9,
    heightMeters: 8.4,
    canopyDiameterMeters: 6.8,
    healthStatus: 'Needs Care',
    maintenanceStatus: 'Scheduled',
    plantedDate: new Date('2017-09-10'),
    carbonAbsorptionKgPerYear: 18.2,
    notes: 'Mild termite traces on lower bark; anti-pest application scheduled.'
  },
  {
    _id: '663000000000000000000004',
    treeCode: 'TR-PARK-004',
    species: 'Peepal',
    scientificName: 'Ficus religiosa',
    location: 'Main Entrance Avenue',
    park: '662000000000000000000001',
    parkName: 'Central Eco Botanical Park',
    ageYears: 24,
    heightMeters: 17.8,
    canopyDiameterMeters: 14.0,
    healthStatus: 'Healthy',
    maintenanceStatus: 'Regular',
    plantedDate: new Date('2002-06-05'),
    carbonAbsorptionKgPerYear: 45.0,
    notes: 'Continuous oxygen release, highly healthy leaves.'
  },
  {
    _id: '663000000000000000000005',
    treeCode: 'TR-PARK-005',
    species: 'Arjun',
    scientificName: 'Terminalia arjuna',
    location: 'Canal Bank Walkway',
    park: '662000000000000000000003',
    parkName: 'Mayur Biodiversity Nature Park',
    ageYears: 12,
    heightMeters: 13.0,
    canopyDiameterMeters: 8.5,
    healthStatus: 'Healthy',
    maintenanceStatus: 'Regular',
    plantedDate: new Date('2014-04-12'),
    carbonAbsorptionKgPerYear: 32.0,
    notes: 'Well hydrated near wetlands; bark intact.'
  },
  {
    _id: '663000000000000000000006',
    treeCode: 'TR-PARK-006',
    species: 'Amaltas (Golden Shower)',
    scientificName: 'Cassia fistula',
    location: 'Perimeter Fence West',
    park: '662000000000000000000004',
    parkName: 'Indira Smriti Neighborhood Park',
    ageYears: 6,
    heightMeters: 5.8,
    canopyDiameterMeters: 4.2,
    healthStatus: 'Diseased',
    maintenanceStatus: 'Urgent',
    plantedDate: new Date('2020-03-15'),
    carbonAbsorptionKgPerYear: 12.0,
    notes: 'Fungal leaf spot detected on upper branches.'
  },
  {
    _id: '663000000000000000000007',
    treeCode: 'TR-PARK-007',
    species: 'Jacaranda',
    scientificName: 'Jacaranda mimosifolia',
    location: 'Flower Pavilion Walkway',
    park: '662000000000000000000001',
    parkName: 'Central Eco Botanical Park',
    ageYears: 8,
    heightMeters: 9.0,
    canopyDiameterMeters: 5.5,
    healthStatus: 'Healthy',
    maintenanceStatus: 'Regular',
    plantedDate: new Date('2018-02-18'),
    carbonAbsorptionKgPerYear: 20.0,
    notes: 'Vibrant violet blossoms during spring.'
  },
  {
    _id: '663000000000000000000008',
    treeCode: 'TR-PARK-008',
    species: 'Rain Tree',
    scientificName: 'Samanea saman',
    location: 'Meadow Shading Circle',
    park: '662000000000000000000003',
    parkName: 'Mayur Biodiversity Nature Park',
    ageYears: 16,
    heightMeters: 18.2,
    canopyDiameterMeters: 22.0,
    healthStatus: 'Healthy',
    maintenanceStatus: 'Regular',
    plantedDate: new Date('2010-11-20'),
    carbonAbsorptionKgPerYear: 52.0,
    notes: 'Huge umbrella canopy cooling picnic area.'
  }
];

const initialUrbanForests = [
  {
    _id: '664000000000000000000001',
    forestName: 'Aravalli Northern Ridge Forest Reserve',
    location: 'North-West Highland Corridor, Ridge Zone',
    areaHectares: 142.5,
    treeCount: 46800,
    canopyCoverPercentage: 74,
    biodiversityIndex: 4.2,
    establishedYear: 1996,
    supervisor: 'Dr. Aarav Sharma',
    status: 'Protected Reserve',
    maintenanceStatus: 'Well Managed',
    dominantFlora: ['Dhaw', 'Ronjh', 'Neem', 'Kikar', 'Ber', 'Babool'],
    createdAt: new Date('2026-01-01')
  },
  {
    _id: '664000000000000000000002',
    forestName: 'City Miyawaki Dense Urban Forest',
    location: 'Eco-Tech Park Junction, Sector 62',
    areaHectares: 18.2,
    treeCount: 22000,
    canopyCoverPercentage: 88,
    biodiversityIndex: 3.8,
    establishedYear: 2021,
    supervisor: 'Priya Nambiar',
    status: 'Miyawaki Forest',
    maintenanceStatus: 'Well Managed',
    dominantFlora: ['Neem', 'Jamun', 'Peepal', 'Kaner', 'Gular'],
    createdAt: new Date('2026-01-04')
  },
  {
    _id: '664000000000000000000003',
    forestName: 'Southern Riverine Agroforestry Corridor',
    location: 'Floodplain Buffer, Southern Basin',
    areaHectares: 85.0,
    treeCount: 29500,
    canopyCoverPercentage: 62,
    biodiversityIndex: 3.6,
    establishedYear: 2018,
    supervisor: 'Vikramaditya Roy',
    status: 'Restoration Area',
    maintenanceStatus: 'Moderate',
    dominantFlora: ['Bamboo', 'Arjun', 'Sissoo (Shisham)', 'Subabul'],
    createdAt: new Date('2026-01-08')
  }
];

const initialGreenBelts = [
  {
    _id: '665000000000000000000001',
    beltName: 'Outer Ring Expressway Green Buffer',
    location: 'National Highway 48 Ring Corridor',
    lengthKm: 14.5,
    widthMeters: 30,
    areaSqM: 435000,
    vegetationType: 'Dense Tree Line',
    status: 'Optimal',
    maintenanceInfo: 'Automated solar drip line, weekly dust washing and trimming',
    soilType: 'Alluvial Loam',
    irrigationType: 'Drip Irrigation',
    createdAt: new Date('2026-01-02')
  },
  {
    _id: '665000000000000000000002',
    beltName: 'Industrial Eco-Shield Perimeter Belt',
    location: 'Okhla - Phase 3 Industrial Border',
    lengthKm: 8.2,
    widthMeters: 25,
    areaSqM: 205000,
    vegetationType: 'Acoustic Barrier',
    status: 'Optimal',
    maintenanceInfo: 'Heavy-foliage dust-absorbing multi-tiered evergreen planting',
    soilType: 'Clay Loam',
    irrigationType: 'Treated Water Tanker',
    createdAt: new Date('2026-01-06')
  },
  {
    _id: '665000000000000000000003',
    beltName: 'Metro Transit Viaduct Green Strip',
    location: 'Blue Line Corridor, Pillars 120-290',
    lengthKm: 6.8,
    widthMeters: 12,
    areaSqM: 81600,
    vegetationType: 'Shrub & Hedge Buffer',
    status: 'Under Maintenance',
    maintenanceInfo: 'Vertical garden mesh repair and drought-resistant succulents',
    soilType: 'Engineered Soil Mix',
    irrigationType: 'Drip Irrigation',
    createdAt: new Date('2026-01-09')
  }
];

const initialEnvironmentalIndicators = [
  {
    _id: '666000000000000000000001',
    recordDate: new Date('2026-05-01'),
    zoneLocation: 'Metropolitan Core (Central & East)',
    aqi: 142,
    pm25: 58.2,
    pm10: 110.5,
    greenCoveragePercentage: 22.4,
    carbonAbsorptionTonnesYear: 1280,
    treeSurvivalRate: 88,
    waterUsageKLMonth: 4200,
    environmentalScore: 68,
    recordedBy: 'Station 01 - City Centre Real-time Sensor',
    remarks: 'Summer pre-monsoon baseline reading'
  },
  {
    _id: '666000000000000000000002',
    recordDate: new Date('2026-06-01'),
    zoneLocation: 'North Ridge & University Enclave',
    aqi: 118,
    pm25: 44.0,
    pm10: 92.0,
    greenCoveragePercentage: 28.6,
    carbonAbsorptionTonnesYear: 1420,
    treeSurvivalRate: 91,
    waterUsageKLMonth: 3950,
    environmentalScore: 76,
    recordedBy: 'Station 04 - Ridge Eco Observatory',
    remarks: 'Positive impact observed from Miyawaki afforestation'
  },
  {
    _id: '666000000000000000000003',
    recordDate: new Date('2026-07-01'),
    zoneLocation: 'Riverfront & Wetland Ecology Zone',
    aqi: 88,
    pm25: 29.5,
    pm10: 64.0,
    greenCoveragePercentage: 34.2,
    carbonAbsorptionTonnesYear: 1650,
    treeSurvivalRate: 94,
    waterUsageKLMonth: 2800,
    environmentalScore: 84,
    recordedBy: 'Station 02 - Yamuna Basin Environmental Lab',
    remarks: 'Monsoon rejuvenation; AQI in Satisfactory bracket'
  },
  {
    _id: '666000000000000000000004',
    recordDate: new Date('2026-08-01'),
    zoneLocation: 'South Eco Corridor & Bio Reserve',
    aqi: 72,
    pm25: 22.0,
    pm10: 48.0,
    greenCoveragePercentage: 36.5,
    carbonAbsorptionTonnesYear: 1780,
    treeSurvivalRate: 95,
    waterUsageKLMonth: 2400,
    environmentalScore: 89,
    recordedBy: 'Station 03 - Bio Reserve Automated Mast',
    remarks: 'Peak ecological vitality; highest canopy density of the season'
  },
  {
    _id: '666000000000000000000005',
    recordDate: new Date('2026-09-01'),
    zoneLocation: 'Industrial & Highway Green Shield',
    aqi: 135,
    pm25: 52.4,
    pm10: 104.0,
    greenCoveragePercentage: 25.0,
    carbonAbsorptionTonnesYear: 1390,
    treeSurvivalRate: 89,
    waterUsageKLMonth: 3600,
    environmentalScore: 71,
    recordedBy: 'Station 05 - Outer Belt Sensor Hub',
    remarks: 'Buffer foliage trapping an estimated 38% vehicular particulate matter'
  },
  {
    _id: '666000000000000000000006',
    recordDate: new Date('2026-10-01'),
    zoneLocation: 'City-Wide Composite Average',
    aqi: 98,
    pm25: 36.8,
    pm10: 78.5,
    greenCoveragePercentage: 29.3,
    carbonAbsorptionTonnesYear: 1524,
    treeSurvivalRate: 92,
    waterUsageKLMonth: 3390,
    environmentalScore: 81,
    recordedBy: 'Central Smart City Integrated Command Center',
    remarks: 'Latest aggregate reading across all 5 municipal sectors'
  }
];

const initialMaintenances = [
  {
    _id: '667000000000000000000001',
    targetType: 'Park',
    targetName: 'Central Eco Botanical Park',
    activityType: 'Irrigation & Watering',
    scheduledDate: new Date('2026-10-27T08:00:00Z'),
    completedDate: null,
    responsibleTeam: 'Horticulture Team Alpha',
    priority: 'Medium',
    cost: 4500,
    status: 'In Progress',
    remarks: 'Deep root hydration using treated STP water across all 4 zones.'
  },
  {
    _id: '667000000000000000000002',
    targetType: 'Tree',
    targetName: 'Amaltas (TR-PARK-006)',
    activityType: 'Pest Control',
    scheduledDate: new Date('2026-10-28T09:30:00Z'),
    completedDate: null,
    responsibleTeam: 'Bio-Safety & Entomology Cell',
    priority: 'Urgent',
    cost: 2800,
    status: 'Scheduled',
    remarks: 'Organic neem oil spray and antifungal trunk coat to cure fungal spot.'
  },
  {
    _id: '667000000000000000000003',
    targetType: 'Urban Forest',
    targetName: 'City Miyawaki Dense Urban Forest',
    activityType: 'Soil Aeration',
    scheduledDate: new Date('2026-10-24T07:00:00Z'),
    completedDate: new Date('2026-10-24T14:00:00Z'),
    responsibleTeam: 'Green Taskforce Squad 3',
    priority: 'High',
    cost: 8500,
    status: 'Completed',
    remarks: 'Applied vermicompost and loosened topsoil across 2 hectares.'
  },
  {
    _id: '667000000000000000000004',
    targetType: 'Green Belt',
    targetName: 'Outer Ring Expressway Green Buffer',
    activityType: 'Pruning & Trimming',
    scheduledDate: new Date('2026-10-22T06:00:00Z'),
    completedDate: new Date('2026-10-22T12:30:00Z'),
    responsibleTeam: 'Highway Highway Landscaping Unit',
    priority: 'Medium',
    cost: 12000,
    status: 'Completed',
    remarks: 'Clearance of sightlines for road traffic signage along 14.5 km.'
  },
  {
    _id: '667000000000000000000005',
    targetType: 'Park',
    targetName: 'Indira Smriti Neighborhood Park',
    activityType: 'Tree Planting',
    scheduledDate: new Date('2026-11-02T10:00:00Z'),
    completedDate: null,
    responsibleTeam: 'Community Green Volunteers & Forest Dept',
    priority: 'Low',
    cost: 15000,
    status: 'Scheduled',
    remarks: 'Plan to plant 50 saplings of native flowering and shade trees.'
  }
];

const initialReports = [
  {
    _id: '668000000000000000000001',
    reportTitle: 'Q3 Comprehensive Urban Canopy & Biodiversity Status',
    reportType: 'Comprehensive Executive Summary',
    generatedBy: 'Dr. Aarav Sharma',
    filterParams: {
      category: 'All',
      location: 'City-Wide',
      status: 'Active',
      startDate: new Date('2026-07-01'),
      endDate: new Date('2026-09-30')
    },
    metrics: {
      totalParks: 5,
      totalTrees: 1650,
      healthyTreesCount: 1495,
      totalForestHectares: 245.7,
      totalGreenBeltKm: 29.5,
      avgAqi: 98,
      totalCarbonAbsorptionTonnes: 1524,
      pendingMaintenanceCount: 3
    },
    summaryNotes: 'Urban canopy expanded by 3.8% over the quarter. Tree mortality remains below 8%. Recommended accelerating drip line repairs in West zone.',
    createdAt: new Date('2026-10-05T15:30:00Z')
  }
];

module.exports = {
  initialUsers,
  initialParks,
  initialTrees,
  initialUrbanForests,
  initialGreenBelts,
  initialEnvironmentalIndicators,
  initialMaintenances,
  initialReports
};

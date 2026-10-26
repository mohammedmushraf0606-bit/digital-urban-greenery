const { getModel } = require('../config/db');

// @desc    Get complete aggregate dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Public or Protected
const getDashboardStats = async (req, res, next) => {
  try {
    const Park = getModel('Park');
    const Tree = getModel('Tree');
    const UrbanForest = getModel('UrbanForest');
    const GreenBelt = getModel('GreenBelt');
    const EnvironmentalIndicator = getModel('EnvironmentalIndicator');
    const Maintenance = getModel('Maintenance');

    const [
      parks,
      trees,
      forests,
      belts,
      indicators,
      maintenances
    ] = await Promise.all([
      Park.find(),
      Tree.find(),
      UrbanForest.find(),
      GreenBelt.find(),
      EnvironmentalIndicator.find(),
      Maintenance.find()
    ]);

    // Summary calculations
    const totalParks = parks.length;
    const totalTrees = trees.length;
    
    // Total forest area
    const totalForestHectares = forests.reduce((acc, f) => acc + (Number(f.areaHectares) || 0), 0);
    const totalForestTrees = forests.reduce((acc, f) => acc + (Number(f.treeCount) || 0), 0);

    // Total green belt km
    const totalGreenBeltKm = belts.reduce((acc, b) => acc + (Number(b.lengthKm) || 0), 0);
    const totalGreenBeltSqM = belts.reduce((acc, b) => acc + (Number(b.areaSqM) || 0), 0);

    // Tree Health Breakdown
    const healthBreakdown = {
      Healthy: 0,
      'Needs Care': 0,
      Diseased: 0,
      Critical: 0
    };
    trees.forEach(t => {
      const status = t.healthStatus || 'Healthy';
      if (healthBreakdown[status] !== undefined) {
        healthBreakdown[status]++;
      } else {
        healthBreakdown[status] = 1;
      }
    });

    // Species Breakdown (Top 6)
    const speciesMap = {};
    trees.forEach(t => {
      const sp = t.species || 'Unknown';
      speciesMap[sp] = (speciesMap[sp] || 0) + 1;
    });
    const speciesBreakdown = Object.entries(speciesMap)
      .map(([species, count]) => ({ species, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);

    // Environmental calculations
    const latestEnv = indicators.length > 0 ? indicators[indicators.length - 1] : null;
    const avgAqi = indicators.length > 0 
      ? Math.round(indicators.reduce((acc, i) => acc + (Number(i.aqi) || 0), 0) / indicators.length) 
      : 85;
    const avgGreenCoverage = indicators.length > 0
      ? Number((indicators.reduce((acc, i) => acc + (Number(i.greenCoveragePercentage) || 0), 0) / indicators.length).toFixed(1))
      : 28.5;
    
    // Carbon absorption calculation
    // From individual trees in census + forests
    const treeCarbonKg = trees.reduce((acc, t) => acc + (Number(t.carbonAbsorptionKgPerYear) || 22), 0);
    const forestCarbonTonnes = totalForestTrees * 0.022; // ~22kg per mature tree
    const totalEstCarbonAbsorptionTonnes = Math.round((treeCarbonKg / 1000) + forestCarbonTonnes + (latestEnv ? Number(latestEnv.carbonAbsorptionTonnesYear) || 0 : 1200));

    // Environmental timeline for line chart
    const environmentalTimeline = indicators
      .map(i => ({
        date: new Date(i.recordDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        aqi: i.aqi,
        greenCoverage: i.greenCoveragePercentage,
        environmentalScore: i.environmentalScore,
        carbonAbsorption: i.carbonAbsorptionTonnesYear
      }))
      .slice(-6);

    // Maintenance summary
    const pendingMaintenanceCount = maintenances.filter(m => m.status === 'Scheduled' || m.status === 'In Progress').length;
    const completedMaintenanceCount = maintenances.filter(m => m.status === 'Completed').length;
    const recentActivities = maintenances.slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalParks,
          totalTrees,
          totalForestHectares: Number(totalForestHectares.toFixed(1)),
          totalForestTrees,
          totalGreenBeltKm: Number(totalGreenBeltKm.toFixed(1)),
          totalGreenBeltSqM,
          totalEstCarbonAbsorptionTonnes,
          avgAqi,
          avgGreenCoverage,
          pendingMaintenanceCount,
          completedMaintenanceCount,
          environmentalScore: latestEnv ? latestEnv.environmentalScore : 82
        },
        charts: {
          speciesBreakdown,
          healthBreakdown,
          environmentalTimeline
        },
        recentActivities,
        latestEnvironmental: latestEnv
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats
};

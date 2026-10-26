const { getModel } = require('../config/db');

// @desc    Get all saved reports
// @route   GET /api/reports
// @access  Public
const getReports = async (req, res, next) => {
  try {
    const Report = getModel('Report');
    const reports = await Report.find();
    reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Generate a new live executive report snapshot
// @route   POST /api/reports/generate
// @access  Private / Public
const generateReport = async (req, res, next) => {
  try {
    const { reportTitle, reportType, generatedBy, filterParams, summaryNotes } = req.body;

    const Park = getModel('Park');
    const Tree = getModel('Tree');
    const UrbanForest = getModel('UrbanForest');
    const GreenBelt = getModel('GreenBelt');
    const EnvironmentalIndicator = getModel('EnvironmentalIndicator');
    const Maintenance = getModel('Maintenance');
    const Report = getModel('Report');

    const [parks, trees, forests, belts, indicators, maintenances] = await Promise.all([
      Park.find(),
      Tree.find(),
      UrbanForest.find(),
      GreenBelt.find(),
      EnvironmentalIndicator.find(),
      Maintenance.find()
    ]);

    const totalParks = parks.length;
    const totalTrees = trees.length;
    const healthyTreesCount = trees.filter(t => t.healthStatus === 'Healthy').length;
    const totalForestHectares = Number(forests.reduce((a, f) => a + (Number(f.areaHectares) || 0), 0).toFixed(1));
    const totalGreenBeltKm = Number(belts.reduce((a, b) => a + (Number(b.lengthKm) || 0), 0).toFixed(1));
    const avgAqi = indicators.length > 0 
      ? Math.round(indicators.reduce((a, i) => a + (Number(i.aqi) || 0), 0) / indicators.length) 
      : 95;
    const totalCarbonAbsorptionTonnes = Math.round(
      (trees.reduce((a, t) => a + (Number(t.carbonAbsorptionKgPerYear) || 22), 0) / 1000) +
      (forests.reduce((a, f) => a + (Number(f.treeCount) || 0), 0) * 0.022) +
      1200
    );
    const pendingMaintenanceCount = maintenances.filter(m => m.status === 'Scheduled' || m.status === 'In Progress').length;

    const title = reportTitle || `Urban Greenery Audit Snapshot - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

    const report = await Report.create({
      reportTitle: title,
      reportType: reportType || 'Comprehensive Executive Summary',
      generatedBy: generatedBy || (req.user ? req.user.name : 'Urban Greenery Chief Inspector'),
      filterParams: filterParams || {
        category: 'All',
        location: 'All Zones',
        status: 'Active'
      },
      metrics: {
        totalParks,
        totalTrees,
        healthyTreesCount,
        totalForestHectares,
        totalGreenBeltKm,
        avgAqi,
        totalCarbonAbsorptionTonnes,
        pendingMaintenanceCount
      },
      summaryNotes: summaryNotes || `Comprehensive automated audit recorded ${totalParks} parks, ${totalTrees} inventoried census trees, ${totalForestHectares} Ha reserved urban forest, and ${totalGreenBeltKm} Km green belts with an overall healthy tree index of ${((healthyTreesCount / (totalTrees || 1)) * 100).toFixed(1)}%.`
    });

    res.status(201).json({
      success: true,
      data: report,
      message: 'Report generated successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single report by ID
// @route   GET /api/reports/:id
// @access  Public
const getReportById = async (req, res, next) => {
  try {
    const Report = getModel('Report');
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Private / Public
const deleteReport = async (req, res, next) => {
  try {
    const Report = getModel('Report');
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    await Report.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully',
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getReports,
  generateReport,
  getReportById,
  deleteReport
};

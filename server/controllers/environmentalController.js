const { getModel } = require('../config/db');

// @desc    Get all environmental indicators
// @route   GET /api/environmental-indicators
// @access  Public
const getIndicators = async (req, res, next) => {
  try {
    const EnvironmentalIndicator = getModel('EnvironmentalIndicator');
    const { zone } = req.query;

    let filter = {};
    if (zone && zone !== 'All') {
      filter.zoneLocation = { $regex: zone, $options: 'i' };
    }

    const records = await EnvironmentalIndicator.find(filter);
    // Sort descending by date
    records.sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate));

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get latest environmental reading
// @route   GET /api/environmental-indicators/latest
// @access  Public
const getLatestIndicator = async (req, res, next) => {
  try {
    const EnvironmentalIndicator = getModel('EnvironmentalIndicator');
    const records = await EnvironmentalIndicator.find();
    records.sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate));

    const latest = records.length > 0 ? records[0] : null;

    res.status(200).json({
      success: true,
      data: latest
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new environmental indicator reading
// @route   POST /api/environmental-indicators
// @access  Private / Public
const createIndicator = async (req, res, next) => {
  try {
    const {
      recordDate,
      zoneLocation,
      aqi,
      pm25,
      pm10,
      greenCoveragePercentage,
      carbonAbsorptionTonnesYear,
      treeSurvivalRate,
      waterUsageKLMonth,
      recordedBy,
      remarks
    } = req.body;

    if (!zoneLocation || aqi === undefined || greenCoveragePercentage === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Zone location, AQI, and Green coverage percentage are required'
      });
    }

    const aqiVal = Number(aqi);
    const greenVal = Number(greenCoveragePercentage);
    const survivalVal = Number(treeSurvivalRate) || 85;

    // Environmental score composite calculation
    const aqiScore = Math.max(0, 100 - (aqiVal / 3));
    const compositeScore = Math.min(100, Math.round((greenVal * 0.35) + (survivalVal * 0.35) + (aqiScore * 0.30)));

    const EnvironmentalIndicator = getModel('EnvironmentalIndicator');
    const record = await EnvironmentalIndicator.create({
      recordDate: recordDate ? new Date(recordDate) : new Date(),
      zoneLocation,
      aqi: aqiVal,
      pm25: Number(pm25) || 35.0,
      pm10: Number(pm10) || 65.0,
      greenCoveragePercentage: greenVal,
      carbonAbsorptionTonnesYear: Number(carbonAbsorptionTonnesYear) || 1200,
      treeSurvivalRate: survivalVal,
      waterUsageKLMonth: Number(waterUsageKLMonth) || 3000,
      environmentalScore: compositeScore,
      recordedBy: recordedBy || (req.user ? req.user.name : 'Environmental Quality Sensor'),
      remarks: remarks || 'Manual field logging'
    });

    res.status(201).json({
      success: true,
      data: record,
      message: 'Environmental observation logged successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update environmental indicator
// @route   PUT /api/environmental-indicators/:id
// @access  Private / Public
const updateIndicator = async (req, res, next) => {
  try {
    const EnvironmentalIndicator = getModel('EnvironmentalIndicator');
    const record = await EnvironmentalIndicator.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Environmental record not found'
      });
    }

    const updateData = { ...req.body };
    if (updateData.aqi) updateData.aqi = Number(updateData.aqi);
    if (updateData.greenCoveragePercentage) updateData.greenCoveragePercentage = Number(updateData.greenCoveragePercentage);
    if (updateData.treeSurvivalRate) updateData.treeSurvivalRate = Number(updateData.treeSurvivalRate);
    if (updateData.carbonAbsorptionTonnesYear) updateData.carbonAbsorptionTonnesYear = Number(updateData.carbonAbsorptionTonnesYear);
    if (updateData.waterUsageKLMonth) updateData.waterUsageKLMonth = Number(updateData.waterUsageKLMonth);

    // Recalculate score if factors changed
    if (updateData.aqi || updateData.greenCoveragePercentage || updateData.treeSurvivalRate) {
      const a = updateData.aqi !== undefined ? updateData.aqi : record.aqi;
      const g = updateData.greenCoveragePercentage !== undefined ? updateData.greenCoveragePercentage : record.greenCoveragePercentage;
      const s = updateData.treeSurvivalRate !== undefined ? updateData.treeSurvivalRate : record.treeSurvivalRate;
      const aqiScore = Math.max(0, 100 - (a / 3));
      updateData.environmentalScore = Math.min(100, Math.round((g * 0.35) + (s * 0.35) + (aqiScore * 0.30)));
    }

    const updated = await EnvironmentalIndicator.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    res.status(200).json({
      success: true,
      data: updated,
      message: 'Environmental record updated successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete environmental indicator
// @route   DELETE /api/environmental-indicators/:id
// @access  Private / Public
const deleteIndicator = async (req, res, next) => {
  try {
    const EnvironmentalIndicator = getModel('EnvironmentalIndicator');
    const record = await EnvironmentalIndicator.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Environmental record not found'
      });
    }

    await EnvironmentalIndicator.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Environmental record deleted successfully',
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getIndicators,
  getLatestIndicator,
  createIndicator,
  updateIndicator,
  deleteIndicator
};

const { getModel } = require('../config/db');

// @desc    Get all green belts
// @route   GET /api/green-belts
// @access  Public
const getGreenBelts = async (req, res, next) => {
  try {
    const GreenBelt = getModel('GreenBelt');
    const { search, status, vegetationType } = req.query;

    let filter = {};

    if (search) {
      filter.$or = [
        { beltName: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { soilType: { $regex: search, $options: 'i' } }
      ];
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (vegetationType && vegetationType !== 'All') {
      filter.vegetationType = vegetationType;
    }

    const belts = await GreenBelt.find(filter);
    res.status(200).json({
      success: true,
      count: belts.length,
      data: belts
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single green belt by ID
// @route   GET /api/green-belts/:id
// @access  Public
const getGreenBeltById = async (req, res, next) => {
  try {
    const GreenBelt = getModel('GreenBelt');
    const belt = await GreenBelt.findById(req.params.id);

    if (!belt) {
      return res.status(404).json({
        success: false,
        message: 'Green belt record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: belt
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new green belt
// @route   POST /api/green-belts
// @access  Private / Public
const createGreenBelt = async (req, res, next) => {
  try {
    const {
      beltName,
      location,
      lengthKm,
      widthMeters,
      vegetationType,
      status,
      maintenanceInfo,
      soilType,
      irrigationType
    } = req.body;

    if (!beltName || !location || !lengthKm || !widthMeters) {
      return res.status(400).json({
        success: false,
        message: 'Belt name, location, length (km), and width (m) are required'
      });
    }

    const length = Number(lengthKm);
    const width = Number(widthMeters);
    const areaSqM = (length * 1000) * width;

    const GreenBelt = getModel('GreenBelt');
    const belt = await GreenBelt.create({
      beltName,
      location,
      lengthKm: length,
      widthMeters: width,
      areaSqM,
      vegetationType: vegetationType || 'Mixed Canopy',
      status: status || 'Optimal',
      maintenanceInfo: maintenanceInfo || 'Regular drip watering and foliage cleaning',
      soilType: soilType || 'Loamy Soil',
      irrigationType: irrigationType || 'Drip Irrigation'
    });

    res.status(201).json({
      success: true,
      data: belt,
      message: 'Green belt record created successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update green belt
// @route   PUT /api/green-belts/:id
// @access  Private / Public
const updateGreenBelt = async (req, res, next) => {
  try {
    const GreenBelt = getModel('GreenBelt');
    let belt = await GreenBelt.findById(req.params.id);

    if (!belt) {
      return res.status(404).json({
        success: false,
        message: 'Green belt record not found'
      });
    }

    const updateData = { ...req.body };
    if (updateData.lengthKm) updateData.lengthKm = Number(updateData.lengthKm);
    if (updateData.widthMeters) updateData.widthMeters = Number(updateData.widthMeters);
    
    if (updateData.lengthKm || updateData.widthMeters) {
      const l = updateData.lengthKm || belt.lengthKm;
      const w = updateData.widthMeters || belt.widthMeters;
      updateData.areaSqM = (l * 1000) * w;
    }

    const updated = await GreenBelt.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    res.status(200).json({
      success: true,
      data: updated,
      message: 'Green belt record updated successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete green belt
// @route   DELETE /api/green-belts/:id
// @access  Private / Public
const deleteGreenBelt = async (req, res, next) => {
  try {
    const GreenBelt = getModel('GreenBelt');
    const belt = await GreenBelt.findById(req.params.id);

    if (!belt) {
      return res.status(404).json({
        success: false,
        message: 'Green belt record not found'
      });
    }

    await GreenBelt.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Green belt record deleted successfully',
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getGreenBelts,
  getGreenBeltById,
  createGreenBelt,
  updateGreenBelt,
  deleteGreenBelt
};

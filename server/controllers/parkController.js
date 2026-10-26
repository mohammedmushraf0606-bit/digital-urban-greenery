const { getModel } = require('../config/db');

// @desc    Get all parks with optional search and filter
// @route   GET /api/parks
// @access  Public
const getParks = async (req, res, next) => {
  try {
    const Park = getModel('Park');
    const { search, type, status } = req.query;

    let filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { wardNo: { $regex: search, $options: 'i' } }
      ];
    }

    if (type && type !== 'All') {
      filter.parkType = type;
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    const parks = await Park.find(filter);
    res.status(200).json({
      success: true,
      count: parks.length,
      data: parks
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single park by ID
// @route   GET /api/parks/:id
// @access  Public
const getParkById = async (req, res, next) => {
  try {
    const Park = getModel('Park');
    const Tree = getModel('Tree');

    const park = await Park.findById(req.params.id);
    if (!park) {
      return res.status(404).json({
        success: false,
        message: 'Park not found'
      });
    }

    // Also fetch trees residing in this park
    const trees = await Tree.find({ park: req.params.id });

    res.status(200).json({
      success: true,
      data: {
        ...park,
        trees
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new park
// @route   POST /api/parks
// @access  Private / Public
const createPark = async (req, res, next) => {
  try {
    const { name, location, areaSqM, parkType, wardNo, establishedYear, contactOfficer, contactPhone, facilities, status, maintenanceStatus, imageUrl } = req.body;

    if (!name || !location || !areaSqM) {
      return res.status(400).json({
        success: false,
        message: 'Park name, location, and area are required'
      });
    }

    const Park = getModel('Park');
    const park = await Park.create({
      name,
      location,
      wardNo: wardNo || 'Ward 01',
      areaSqM: Number(areaSqM),
      parkType: parkType || 'Public Park',
      establishedYear: establishedYear ? Number(establishedYear) : new Date().getFullYear(),
      contactOfficer: contactOfficer || (req.user ? req.user.name : 'Greenery Officer'),
      contactPhone: contactPhone || '+91 98765 43210',
      facilities: Array.isArray(facilities) ? facilities : (facilities ? facilities.split(',').map(f => f.trim()) : ['Walking Track', 'Benches']),
      status: status || 'Active',
      maintenanceStatus: maintenanceStatus || 'Good',
      treeCount: 0,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=600&auto=format&fit=crop&q=80'
    });

    res.status(201).json({
      success: true,
      data: park,
      message: 'Park created successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update an existing park
// @route   PUT /api/parks/:id
// @access  Private / Public
const updatePark = async (req, res, next) => {
  try {
    const Park = getModel('Park');
    let park = await Park.findById(req.params.id);

    if (!park) {
      return res.status(404).json({
        success: false,
        message: 'Park not found'
      });
    }

    const updateData = { ...req.body };
    if (updateData.areaSqM) updateData.areaSqM = Number(updateData.areaSqM);
    if (updateData.establishedYear) updateData.establishedYear = Number(updateData.establishedYear);
    if (typeof updateData.facilities === 'string') {
      updateData.facilities = updateData.facilities.split(',').map(f => f.trim());
    }

    const updatedPark = await Park.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    res.status(200).json({
      success: true,
      data: updatedPark,
      message: 'Park updated successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a park
// @route   DELETE /api/parks/:id
// @access  Private / Public
const deletePark = async (req, res, next) => {
  try {
    const Park = getModel('Park');
    const park = await Park.findById(req.params.id);

    if (!park) {
      return res.status(404).json({
        success: false,
        message: 'Park not found'
      });
    }

    await Park.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Park deleted successfully',
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getParks,
  getParkById,
  createPark,
  updatePark,
  deletePark
};

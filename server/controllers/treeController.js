const { getModel } = require('../config/db');

// @desc    Get all trees with search and filters
// @route   GET /api/trees
// @access  Public
const getTrees = async (req, res, next) => {
  try {
    const Tree = getModel('Tree');
    const { search, healthStatus, parkId, species } = req.query;

    let filter = {};

    if (search) {
      filter.$or = [
        { treeCode: { $regex: search, $options: 'i' } },
        { species: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { scientificName: { $regex: search, $options: 'i' } }
      ];
    }

    if (healthStatus && healthStatus !== 'All') {
      filter.healthStatus = healthStatus;
    }

    if (parkId && parkId !== 'All') {
      filter.park = parkId;
    }

    if (species && species !== 'All') {
      filter.species = species;
    }

    const trees = await Tree.find(filter);
    res.status(200).json({
      success: true,
      count: trees.length,
      data: trees
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single tree by ID
// @route   GET /api/trees/:id
// @access  Public
const getTreeById = async (req, res, next) => {
  try {
    const Tree = getModel('Tree');
    const tree = await Tree.findById(req.params.id);

    if (!tree) {
      return res.status(404).json({
        success: false,
        message: 'Tree record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: tree
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new tree record
// @route   POST /api/trees
// @access  Private / Public
const createTree = async (req, res, next) => {
  try {
    const {
      treeCode,
      species,
      scientificName,
      location,
      park,
      parkName,
      ageYears,
      heightMeters,
      canopyDiameterMeters,
      healthStatus,
      maintenanceStatus,
      plantedDate,
      carbonAbsorptionKgPerYear,
      notes
    } = req.body;

    if (!species || !location) {
      return res.status(400).json({
        success: false,
        message: 'Species and location are required'
      });
    }

    const Tree = getModel('Tree');
    const Park = getModel('Park');

    // Auto generate code if not provided
    const code = treeCode || `TR-${Math.floor(1000 + Math.random() * 9000)}`;

    let targetParkName = parkName || 'General Urban Zone';
    if (park) {
      const foundPark = await Park.findById(park);
      if (foundPark) {
        targetParkName = foundPark.name;
        // increment park tree count
        await Park.findByIdAndUpdate(park, {
          treeCount: (foundPark.treeCount || 0) + 1
        });
      }
    }

    const tree = await Tree.create({
      treeCode: code.toUpperCase(),
      species,
      scientificName: scientificName || 'Plantae sp.',
      location,
      park: park || null,
      parkName: targetParkName,
      ageYears: Number(ageYears) || 1,
      heightMeters: Number(heightMeters) || 2.0,
      canopyDiameterMeters: Number(canopyDiameterMeters) || 1.5,
      healthStatus: healthStatus || 'Healthy',
      maintenanceStatus: maintenanceStatus || 'Regular',
      plantedDate: plantedDate ? new Date(plantedDate) : new Date(),
      carbonAbsorptionKgPerYear: Number(carbonAbsorptionKgPerYear) || 22.0,
      notes: notes || ''
    });

    res.status(201).json({
      success: true,
      data: tree,
      message: 'Tree recorded successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update tree record
// @route   PUT /api/trees/:id
// @access  Private / Public
const updateTree = async (req, res, next) => {
  try {
    const Tree = getModel('Tree');
    let tree = await Tree.findById(req.params.id);

    if (!tree) {
      return res.status(404).json({
        success: false,
        message: 'Tree record not found'
      });
    }

    const updateData = { ...req.body };
    if (updateData.ageYears) updateData.ageYears = Number(updateData.ageYears);
    if (updateData.heightMeters) updateData.heightMeters = Number(updateData.heightMeters);
    if (updateData.canopyDiameterMeters) updateData.canopyDiameterMeters = Number(updateData.canopyDiameterMeters);
    if (updateData.carbonAbsorptionKgPerYear) updateData.carbonAbsorptionKgPerYear = Number(updateData.carbonAbsorptionKgPerYear);

    const updatedTree = await Tree.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    res.status(200).json({
      success: true,
      data: updatedTree,
      message: 'Tree updated successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete tree record
// @route   DELETE /api/trees/:id
// @access  Private / Public
const deleteTree = async (req, res, next) => {
  try {
    const Tree = getModel('Tree');
    const Park = getModel('Park');

    const tree = await Tree.findById(req.params.id);
    if (!tree) {
      return res.status(404).json({
        success: false,
        message: 'Tree record not found'
      });
    }

    if (tree.park) {
      const foundPark = await Park.findById(tree.park);
      if (foundPark && foundPark.treeCount > 0) {
        await Park.findByIdAndUpdate(tree.park, {
          treeCount: foundPark.treeCount - 1
        });
      }
    }

    await Tree.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Tree record deleted successfully',
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTrees,
  getTreeById,
  createTree,
  updateTree,
  deleteTree
};

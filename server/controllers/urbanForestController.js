const { getModel } = require('../config/db');

// @desc    Get all urban forests
// @route   GET /api/urban-forests
// @access  Public
const getUrbanForests = async (req, res, next) => {
  try {
    const UrbanForest = getModel('UrbanForest');
    const { search, status } = req.query;

    let filter = {};

    if (search) {
      filter.$or = [
        { forestName: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { supervisor: { $regex: search, $options: 'i' } }
      ];
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    const forests = await UrbanForest.find(filter);
    res.status(200).json({
      success: true,
      count: forests.length,
      data: forests
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get urban forest by ID
// @route   GET /api/urban-forests/:id
// @access  Public
const getUrbanForestById = async (req, res, next) => {
  try {
    const UrbanForest = getModel('UrbanForest');
    const forest = await UrbanForest.findById(req.params.id);

    if (!forest) {
      return res.status(404).json({
        success: false,
        message: 'Urban forest record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: forest
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new urban forest
// @route   POST /api/urban-forests
// @access  Private / Public
const createUrbanForest = async (req, res, next) => {
  try {
    const {
      forestName,
      location,
      areaHectares,
      treeCount,
      canopyCoverPercentage,
      biodiversityIndex,
      establishedYear,
      supervisor,
      status,
      maintenanceStatus,
      dominantFlora
    } = req.body;

    if (!forestName || !location || !areaHectares) {
      return res.status(400).json({
        success: false,
        message: 'Forest name, location, and area in hectares are required'
      });
    }

    const UrbanForest = getModel('UrbanForest');
    const forest = await UrbanForest.create({
      forestName,
      location,
      areaHectares: Number(areaHectares),
      treeCount: Number(treeCount) || 0,
      canopyCoverPercentage: Number(canopyCoverPercentage) || 65,
      biodiversityIndex: Number(biodiversityIndex) || 3.5,
      establishedYear: Number(establishedYear) || 2020,
      supervisor: supervisor || (req.user ? req.user.name : 'District Forestry Officer'),
      status: status || 'Protected Reserve',
      maintenanceStatus: maintenanceStatus || 'Well Managed',
      dominantFlora: Array.isArray(dominantFlora) ? dominantFlora : (dominantFlora ? dominantFlora.split(',').map(f => f.trim()) : ['Teak', 'Neem', 'Bamboo'])
    });

    res.status(201).json({
      success: true,
      data: forest,
      message: 'Urban forest record created successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update urban forest
// @route   PUT /api/urban-forests/:id
// @access  Private / Public
const updateUrbanForest = async (req, res, next) => {
  try {
    const UrbanForest = getModel('UrbanForest');
    let forest = await UrbanForest.findById(req.params.id);

    if (!forest) {
      return res.status(404).json({
        success: false,
        message: 'Urban forest record not found'
      });
    }

    const updateData = { ...req.body };
    if (updateData.areaHectares) updateData.areaHectares = Number(updateData.areaHectares);
    if (updateData.treeCount) updateData.treeCount = Number(updateData.treeCount);
    if (updateData.canopyCoverPercentage) updateData.canopyCoverPercentage = Number(updateData.canopyCoverPercentage);
    if (updateData.biodiversityIndex) updateData.biodiversityIndex = Number(updateData.biodiversityIndex);
    if (typeof updateData.dominantFlora === 'string') {
      updateData.dominantFlora = updateData.dominantFlora.split(',').map(f => f.trim());
    }

    const updated = await UrbanForest.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    res.status(200).json({
      success: true,
      data: updated,
      message: 'Urban forest record updated successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete urban forest
// @route   DELETE /api/urban-forests/:id
// @access  Private / Public
const deleteUrbanForest = async (req, res, next) => {
  try {
    const UrbanForest = getModel('UrbanForest');
    const forest = await UrbanForest.findById(req.params.id);

    if (!forest) {
      return res.status(404).json({
        success: false,
        message: 'Urban forest record not found'
      });
    }

    await UrbanForest.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Urban forest record deleted successfully',
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUrbanForests,
  getUrbanForestById,
  createUrbanForest,
  updateUrbanForest,
  deleteUrbanForest
};

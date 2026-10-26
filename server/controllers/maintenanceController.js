const { getModel } = require('../config/db');

// @desc    Get all maintenance tasks
// @route   GET /api/maintenance
// @access  Public
const getMaintenances = async (req, res, next) => {
  try {
    const Maintenance = getModel('Maintenance');
    const { status, targetType, priority, search } = req.query;

    let filter = {};

    if (search) {
      filter.$or = [
        { targetName: { $regex: search, $options: 'i' } },
        { responsibleTeam: { $regex: search, $options: 'i' } },
        { activityType: { $regex: search, $options: 'i' } }
      ];
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (targetType && targetType !== 'All') {
      filter.targetType = targetType;
    }

    if (priority && priority !== 'All') {
      filter.priority = priority;
    }

    const tasks = await Maintenance.find(filter);
    tasks.sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate));

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get maintenance task by ID
// @route   GET /api/maintenance/:id
// @access  Public
const getMaintenanceById = async (req, res, next) => {
  try {
    const Maintenance = getModel('Maintenance');
    const task = await Maintenance.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new maintenance task
// @route   POST /api/maintenance
// @access  Private / Public
const createMaintenance = async (req, res, next) => {
  try {
    const {
      targetType,
      targetName,
      activityType,
      scheduledDate,
      responsibleTeam,
      priority,
      cost,
      status,
      remarks
    } = req.body;

    if (!targetType || !targetName || !activityType || !responsibleTeam) {
      return res.status(400).json({
        success: false,
        message: 'Target type, target name, activity type, and responsible team are required'
      });
    }

    const Maintenance = getModel('Maintenance');
    const task = await Maintenance.create({
      targetType,
      targetName,
      activityType,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : new Date(),
      completedDate: status === 'Completed' ? new Date() : null,
      responsibleTeam,
      priority: priority || 'Medium',
      cost: Number(cost) || 0,
      status: status || 'Scheduled',
      remarks: remarks || ''
    });

    res.status(201).json({
      success: true,
      data: task,
      message: 'Maintenance task scheduled successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update maintenance task
// @route   PUT /api/maintenance/:id
// @access  Private / Public
const updateMaintenance = async (req, res, next) => {
  try {
    const Maintenance = getModel('Maintenance');
    let task = await Maintenance.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance task not found'
      });
    }

    const updateData = { ...req.body };
    if (updateData.cost !== undefined) updateData.cost = Number(updateData.cost);
    if (updateData.status === 'Completed' && !task.completedDate && !updateData.completedDate) {
      updateData.completedDate = new Date();
    }

    const updated = await Maintenance.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    res.status(200).json({
      success: true,
      data: updated,
      message: 'Maintenance task updated successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete maintenance task
// @route   DELETE /api/maintenance/:id
// @access  Private / Public
const deleteMaintenance = async (req, res, next) => {
  try {
    const Maintenance = getModel('Maintenance');
    const task = await Maintenance.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance task not found'
      });
    }

    await Maintenance.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Maintenance task deleted successfully',
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMaintenances,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance
};

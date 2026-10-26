const express = require('express');
const router = express.Router();
const {
  getParks,
  getParkById,
  createPark,
  updatePark,
  deletePark
} = require('../controllers/parkController');

router.route('/')
  .get(getParks)
  .post(createPark);

router.route('/:id')
  .get(getParkById)
  .put(updatePark)
  .delete(deletePark);

module.exports = router;

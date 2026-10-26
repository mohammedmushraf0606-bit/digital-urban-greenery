const express = require('express');
const router = express.Router();
const {
  getIndicators,
  getLatestIndicator,
  createIndicator,
  updateIndicator,
  deleteIndicator
} = require('../controllers/environmentalController');

router.route('/')
  .get(getIndicators)
  .post(createIndicator);

router.get('/latest', getLatestIndicator);

router.route('/:id')
  .put(updateIndicator)
  .delete(deleteIndicator);

module.exports = router;

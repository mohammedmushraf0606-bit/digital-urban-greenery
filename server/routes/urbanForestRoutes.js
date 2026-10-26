const express = require('express');
const router = express.Router();
const {
  getUrbanForests,
  getUrbanForestById,
  createUrbanForest,
  updateUrbanForest,
  deleteUrbanForest
} = require('../controllers/urbanForestController');

router.route('/')
  .get(getUrbanForests)
  .post(createUrbanForest);

router.route('/:id')
  .get(getUrbanForestById)
  .put(updateUrbanForest)
  .delete(deleteUrbanForest);

module.exports = router;

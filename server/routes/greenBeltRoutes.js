const express = require('express');
const router = express.Router();
const {
  getGreenBelts,
  getGreenBeltById,
  createGreenBelt,
  updateGreenBelt,
  deleteGreenBelt
} = require('../controllers/greenBeltController');

router.route('/')
  .get(getGreenBelts)
  .post(createGreenBelt);

router.route('/:id')
  .get(getGreenBeltById)
  .put(updateGreenBelt)
  .delete(deleteGreenBelt);

module.exports = router;

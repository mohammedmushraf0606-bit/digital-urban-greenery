const express = require('express');
const router = express.Router();
const {
  getReports,
  generateReport,
  getReportById,
  deleteReport
} = require('../controllers/reportController');

router.route('/')
  .get(getReports);

router.post('/generate', generateReport);

router.route('/:id')
  .get(getReportById)
  .delete(deleteReport);

module.exports = router;

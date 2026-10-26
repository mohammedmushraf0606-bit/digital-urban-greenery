const express = require('express');
const router = express.Router();
const {
  getTrees,
  getTreeById,
  createTree,
  updateTree,
  deleteTree
} = require('../controllers/treeController');

router.route('/')
  .get(getTrees)
  .post(createTree);

router.route('/:id')
  .get(getTreeById)
  .put(updateTree)
  .delete(deleteTree);

module.exports = router;

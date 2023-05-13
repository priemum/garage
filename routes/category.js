const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category');
const {checkAuthenticated} = require('../middleware/auth');

router.get('/', checkAuthenticated, categoryController.index);
router.get('/new', checkAuthenticated, categoryController.new);
router.post('/', checkAuthenticated, categoryController.create);
router.delete('/:id', checkAuthenticated, categoryController.delete);

module.exports = router;

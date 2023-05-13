const express = require('express');
const router = express.Router();
const productController = require('../controllers/product');
const {checkAuthenticated} = require('../middleware/auth');

router.get('/', checkAuthenticated, productController.index);
router.get('/new', checkAuthenticated, productController.new);
router.post('/', checkAuthenticated, productController.create);
router.delete('/:id', checkAuthenticated, productController.delete);

module.exports = router;

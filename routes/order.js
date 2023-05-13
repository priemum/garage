const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order');
const {checkAuthenticated} = require('../middleware/auth');

router.get('/', checkAuthenticated, orderController.index);
router.get('/new', checkAuthenticated, orderController.new);
router.post('/', checkAuthenticated, orderController.create);
router.delete('/:id', checkAuthenticated, orderController.delete);

module.exports = router;

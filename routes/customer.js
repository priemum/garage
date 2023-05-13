const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer');
const {checkAuthenticated} = require('../middleware/auth');

router.get('/', checkAuthenticated, customerController.index);
router.get('/new', checkAuthenticated, customerController.new);
router.post('/', checkAuthenticated, customerController.create);
router.delete('/:id', checkAuthenticated, customerController.delete);

module.exports = router;

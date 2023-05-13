const express = require('express');
const router = express.Router();
const garageItemController = require('../controllers/garageItem');
const {checkAuthenticated} = require('../middleware/auth');

router.get('/', checkAuthenticated, garageItemController.index);
router.get('/new', checkAuthenticated, garageItemController.new);
router.post('/', checkAuthenticated, garageItemController.create);
router.delete('/:id', checkAuthenticated, garageItemController.delete);

module.exports = router;

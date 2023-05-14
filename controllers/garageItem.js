const db = require('../models/db');
const GarageItem = require('../models/garageItem');
const Product = require('../models/product');
const Category = require('../models/category');
const validateGarageItem = require('../validation/garageItems');

exports.index = (req, res) => {
	GarageItem.findAll((err, garageItemsResult) => {
		if (err) {
			console.log(err);
			res.sendStatus(500);
			return;
		}
		Category.findAll((err, categoriesResult) => {
			if (err) {
				console.log(err);
				res.sendStatus(500);
				return;
			}
			Product.findAll((err, productsResult) => {
				if (err) {
					console.log(err);
					res.sendStatus(500);
					return;
				}
				res.render('garageItems/index.ejs', {
					garageItems: garageItemsResult,
					categories: categoriesResult,
					products: productsResult,
				});
			});
		});
	});
};

exports.new = (req, res) => {
	Category.findAll((err, categoriesResult) => {
		if (err) {
			console.log(err);
			res.sendStatus(500);
			return;
		}
		Product.findAll((err, productsResult) => {
			if (err) {
				console.log(err);
				res.sendStatus(500);
				return;
			}
			res.render('garageItems/new.ejs', {
				categories: categoriesResult,
				products: productsResult,
			});
		});
	});
};

exports.create = (req, res) => {
	const garageItem = req.body;
	try {
		validateGarageItem(garageItem);
	} catch (err) {
		req.flash('error', err.message);
		return res.redirect('/garageItems/new');
	}
	GarageItem.create(garageItem, (err, result) => {
		if (err) {
			console.log(err.code);
			res.sendStatus(500);
			return;
		}
		req.flash('success', 'Item Added Successfully');
		res.redirect('/garageItems');
	});
};

exports.delete = (req, res) => {
	const garageId = req.params.id;
	GarageItem.deleteById(garageId, (err, result) => {
		if (err) {
			console.log(err);
			res.sendStatus(500);
			return;
		}
		if (result.affectedRows === 0) {
			res.sendStatus(404);
			return;
		}
		req.flash('success', 'Item Deleted Successfully');
		res.redirect('/garageItems');
	});
};

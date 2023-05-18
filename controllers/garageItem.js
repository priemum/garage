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

exports.show = (req, res) => {
	const id = req.params.id;
	GarageItem.findById(id, (err, garageItem) => {
		if (err) {
			console.log(err);
			res.sendStatus(500);
			return;
		}
		if (!garageItem) {
			res.sendStatus(404);
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
				db.query(
					`SELECT SUM(o.quantity) AS total_sell_orders
						FROM orders o
						JOIN garage_items g ON o.garage_item_id = g.id
						JOIN products p ON g.product_id = p.id
						WHERE o.order_type = 'sell' AND g.product_id = ?
						GROUP BY g.product_id, p.name, g.quantity_on_hand, g.retail_price
						ORDER BY total_sell_orders DESC`,
					[garageItem.product_id],
					(err, sellOrdersResult) => {
						if (err) {
							console.log(err);
							res.sendStatus(500);
							return;
						}
						res.render('garageItems/show', {
							garageItem,
							categories: categoriesResult,
							products: productsResult,
							sellOrders: sellOrdersResult,
						});
					}
				);
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
		req.flash('success', 'تمت إضافة العنصر بنجاح');
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
		req.flash('success', 'تم حذف العنصر بنجاح');
		res.redirect('/garageItems');
	});
};

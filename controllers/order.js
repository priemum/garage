const Order = require('../models/order');
const Product = require('../models/product');
const Customer = require('../models/customer');
const GarageItem = require('../models/garageItem');
const db = require('../models/db');
const validateOrder = require('../validation/order');

exports.index = (req, res, next) => {
	Order.findAll((err, orders) => {
		if (err) {
			return next(err);
		}
		GarageItem.findAll((err, garageItemsResult) => {
			if (err) {
				console.log(err);
				return res.sendStatus(500);
			}
			Customer.findAll((err, customersResult) => {
				if (err) {
					console.log(err);
					return res.sendStatus(500);
				}
				Product.findAll((err, productsResult) => {
					if (err) {
						console.log(err);
						return res.sendStatus(500);
					}
					res.render('orders/index', {
						orders,
						customers: customersResult,
						garageItems: garageItemsResult,
						products: productsResult,
                        
					});
				});
			});
		});
	});
};

exports.new = (req, res) => {
	Customer.findAll((err, customersResult) => {
		if (err) {
			console.log(err);
			res.sendStatus(500);
			return;
		}
		GarageItem.findAll((err, garageItemsResult) => {
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
				res.render('orders/new.ejs', {
					customers: customersResult,
					garageItems: garageItemsResult,
					products: productsResult,
				});
			});
		});
	});
};

exports.create = (req, res) => {
	const { customer_id, garage_item_id, order_date, order_type, quantity } =
		req.body;
	try {
		validateOrder(req.body);
	} catch (err) {
		req.flash('error', err.message);
		return res.redirect("/orders/new");
	}
	const checkQtySql = 'SELECT quantity_on_hand FROM garage_items WHERE id = ?';
	const sql =
		'INSERT INTO orders (customer_id, order_date, order_type, garage_item_id, quantity) VALUES (?, ?, ?, ?, ?)';
	const updateSqlSell =
		'UPDATE garage_items SET quantity_on_hand = quantity_on_hand - ? WHERE id = ?';
	const updateSqlBuy =
		'UPDATE garage_items SET quantity_on_hand = quantity_on_hand + ? WHERE id = ?';
	db.query(checkQtySql, [garage_item_id], (checkErr, checkResult) => {
		if (checkErr) {
			throw checkErr;
		}
		const quantity_on_hand = checkResult[0].quantity_on_hand;
		if (order_type === 'sell' && quantity > quantity_on_hand) {
			req.flash('error', 'Quantity requested exceeds quantity on hand');
			res.redirect('/orders');
		} else {
			const updateSql = order_type === 'sell' ? updateSqlSell : updateSqlBuy;
			const customerId = order_type === 'buy' ? null : customer_id;
			db.query(
				sql,
				[customerId, order_date, order_type, garage_item_id, quantity],
				(err, result) => {
					if (err) {
						throw err;
					}
					db.query(
						updateSql,
						[quantity, garage_item_id],
						(updateErr, updateResult) => {
							if (updateErr) {
								throw updateErr;
							}
							req.flash('success', 'Order Added Successfully');
							res.redirect('/orders');
						}
					);
				}
			);
		}
	});
};

exports.delete = (req, res) => {
	const orderId = req.params.id;
	db.query('SELECT * FROM orders WHERE id = ?', [orderId], (err, result) => {
		if (err) {
			console.log(err);
			res.sendStatus(500);
			return;
		}
		if (result.length === 0) {
			res.sendStatus(404);
			return;
		}

		const order = result[0];
		const qty = order.quantity;
		const garageItemId = order.garage_item_id;
		const orderType = order.order_type;

		db.query('DELETE FROM orders WHERE id = ?', [orderId], (err, result) => {
			if (err) {
				console.log(err);
				res.sendStatus(500);
				return;
			}
			if (result.affectedRows === 0) {
				res.sendStatus(404);
				return;
			}

			if (orderType === 'sell') {
				// add the removed qty to the garageitems qty on hand
				db.query(
					'UPDATE garage_items SET quantity_on_hand = quantity_on_hand + ? WHERE id = ?',
					[qty, garageItemId],
					(err, result) => {
						if (err) {
							console.log(err);
							res.sendStatus(500);
							return;
						}

						req.flash('success', 'Order Deleted Successfully');
						res.redirect('/orders');
					}
				);
			} else if (orderType === 'buy') {
				// remove the added qty from the garageitems qty on hand
				db.query(
					'UPDATE garage_items SET quantity_on_hand = quantity_on_hand - ? WHERE id = ?',
					[qty, garageItemId],
					(err, result) => {
						if (err) {
							console.log(err);
							res.sendStatus(500);
							return;
						}

						req.flash('success', 'Order Deleted Successfully');
						res.redirect('/orders');
					}
				);
			} else {
				// handle invalid order type
				res.sendStatus(400);
			}
		});
	});
};

/* app.get('/orders', checkAuthenticated, (req, res) => {
	db.query('SELECT * FROM orders', (err, ordersResult) => {
		if (err) {
			console.log(err);
			res.sendStatus(500);
			return;
		}
		db.query('SELECT * FROM customers', (err, customersResult) => {
			if (err) {
				console.log(err);
				res.sendStatus(500);
				return;
			}
			db.query('SELECT * FROM garage_items', (err, itemsResult) => {
				if (err) {
					console.log(err);
					res.sendStatus(500);
					return;
				}
				db.query('SELECT * FROM products', (err, productsResult) => {
					if (err) {
						console.log(err);
						res.sendStatus(500);
						return;
					}
					res.render('orders.ejs', {
						orders: ordersResult,
						customers: customersResult,
						garageItems: itemsResult,
						products: productsResult,
					});
				});
			});
		});
	});
}); */

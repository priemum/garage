const db = require('./db');

class Order {
	constructor(customer_id, order_date, order_type, garage_item_id, quantity) {
		this.customer_id = customer_id;
		this.order_date = order_date;
		this.order_type = order_type;
		this.garage_item_id = garage_item_id;
		this.quantity = quantity;
	}

	save(callback) {
		if (this.id) {
			// Update an existing order
			Order.update(
				this.id,
				{
					customer_id: this.customer_id,
					order_date: this.order_date,
					order_type: this.order_type,
					garage_item_id: this.garage_item_id,
					quantity: this.quantity,
				},
				callback
			);
		} else {
			// Create a new order
			const data = {
				customer_id: this.customer_id,
				order_date: this.order_date,
				order_type: this.order_type,
				garage_item_id: this.garage_item_id,
				quantity: this.quantity,
			};
			Order.create(data, callback);
		}
	}

	static findAll(callback) {
		db.query(
			'SELECT orders.* FROM orders',
			(err, result) => {
				if (err) {
					return callback(err);
				}
				callback(null, result);
			}
		);
	}

	static findById(id, callback) {
		db.query('SELECT * FROM orders WHERE id = ?', [id], (err, result) => {
			if (err) {
				return callback(err);
			}
			if (result.length === 0) {
				return callback(null, null);
			}
			callback(null, result[0]);
		});
	}

	static create(data, callback) {
		db.query('INSERT INTO orders SET ?', data, (err, result) => {
			if (err) {
				return callback(err);
			}
			this.findById(result.insertId, (err, order) => {
				if (err) {
					return callback(err);
				}
				callback(null, order);
			});
		});
	}

	static update(id, data, callback) {
		db.query('UPDATE orders SET ? WHERE id = ?', [data, id], (err) => {
			if (err) {
				return callback(err);
			}
			this.findById(id, callback);
		});
	}

	static delete(id, callback) {
		db.query('DELETE FROM orders WHERE id = ?', [id], (err, result) => {
			if (err) {
				return callback(err);
			}
			callback(null, result.affectedRows > 0);
		});
	}
}

module.exports = Order;

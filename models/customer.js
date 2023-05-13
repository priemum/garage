const db = require('./db');

class Customer {
	constructor(name, email, phone) {
		this.name = name;
		this.email = email;
		this.phone = phone;
	}
	save(callback) {
		if (this.id) {
			// Update an existing customer
			Customer.update(
				this.id,
				{
					name: this.name,
					email: this.email,
					phone: this.phone,
				},
				callback
			);
		} else {
			// Create a new customer
			const data = {
				name: this.name,
				email: this.email,
				phone: this.phone,
			};
			Customer.create(data, callback);
		}
	}
	static findAll(callback) {
		db.query(
			'SELECT customers.*, COUNT(orders.id) AS total_orders FROM customers LEFT JOIN orders ON customers.id = orders.customer_id GROUP BY customers.id',
			(err, result) => {
				if (err) {
					return callback(err);
				}
				callback(null, result);
			}
		);
	}

	static findById(id, callback) {
		db.query('SELECT * FROM customers WHERE id = ?', [id], (err, result) => {
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
		db.query('INSERT INTO customers SET ?', data, (err, result) => {
			if (err) {
				return callback(err);
			}
			this.findById(result.insertId, (err, customer) => {
				if (err) {
					return callback(err);
				}
				callback(null, customer);
			});
		});
	}

	static update(id, data, callback) {
		db.query('UPDATE customers SET ? WHERE id = ?', [data, id], (err) => {
			if (err) {
				return callback(err);
			}
			this.findById(id, callback);
		});
	}

	static delete(id, callback) {
		db.query('DELETE FROM customers WHERE id = ?', [id], (err, result) => {
			if (err) {
				return callback(err);
			}
			callback(null, result.affectedRows > 0);
		});
	}
}

module.exports = Customer;

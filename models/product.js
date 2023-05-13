const db = require('./db');

class Product {
	constructor(name, upc) {
		this.name = name;
		this.upc = upc;
	}

	save(callback) {
		const data = {
			name: this.name,
			email: this.email,
			phone: this.phone,
		};
		Product.create(data, callback);
	}
	static create(data, callback) {
		const sql =
			'INSERT INTO products SET ?';
		db.query(sql, data, (err, result) => {
			if (err) {
				return callback(err);
			}
			callback(null, result);
		});
	}
	static findAll(callback) {
		db.query('SELECT * FROM products', callback);
	}

	static findById(id, callback) {
		db.query('SELECT * FROM products WHERE id = ?', [id], (err, result) => {
			if (err) {
				callback(err, null);
			} else {
				const product = new Product(
					result[0].name,
					result[0].universal_product_code
				);
				product.id = result[0].id;
				callback(null, product);
			}
		});
	}

	static deleteById(id, callback) {
		db.query('DELETE FROM products WHERE id = ?', [id],  (err, result) => {
			if (err) {
				return callback(err);
			}
			callback(null, result.affectedRows > 0);
		});
	}
}

module.exports = Product;

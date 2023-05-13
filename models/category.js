const db = require('./db');

class Category {
	constructor(name) {
		this.name = name;
	}

	save(callback) {
		const data = {
			name: this.name,
		};
		Category.create(data, callback);
	}

	static create(data, callback) {
        const sql = 'INSERT INTO categories SET ?';
        console.log(data);
		db.query(sql, data, (err, result) => {
			if (err) {
				return callback(err);
			}
			callback(null, result);
		});
	}

	static findAll(callback) {
		db.query('SELECT * FROM categories', callback);
	}

	static findById(id, callback) {
		db.query('SELECT * FROM categories WHERE id = ?', [id], (err, result) => {
			if (err) {
				callback(err, null);
			} else {
				const category = new Category(result[0].name);
				category.id = result[0].id;
				callback(null, category);
			}
		});
	}

	static deleteById(id, callback) {
		db.query('DELETE FROM categories WHERE id = ?', [id], (err, result) => {
			if (err) {
				return callback(err);
			}
			callback(null, result.affectedRows > 0);
		});
	}
}

module.exports = Category;

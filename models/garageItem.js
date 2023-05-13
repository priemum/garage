const db = require('./db');

class GarageItem {
	constructor({
		product_id,
		description,
		product_cost,
		retail_price,
		quantity_on_hand,
		category_id,
	}) {
		this.product_id = product_id;
		this.description = description;
		this.product_cost = product_cost;
		this.retail_price = retail_price;
		this.quantity_on_hand = quantity_on_hand;
		this.category_id = category_id;
	}

	save(callback) {
		const data = {
			product_id: this.product_id,
			description: this.description,
			product_cost: this.product_cost,
			retail_price: this.retail_price,
			quantity_on_hand: this.quantity_on_hand,
			category_id: this.category_id,
		};
		GarageItem.create(data, callback);
	}

	static create(data, callback) {
		db.query(
			'INSERT INTO garage_items SET ?',
			data,
			callback
		);
	}
	static findById(id, callback) {
		db.query('SELECT * FROM garageItem WHERE id = ?', [id], (err, result) => {
			if (err) {
				callback(err, null);
			} else {
				const garageItem = new GarageItem(
					result[0].product_id,
					result[0].description,
					result[0].product_cost,
					result[0].retail_price,
					result[0].quantity_on_hand,
					result[0].category_id
                );
                garageItem.id = result[0].id;
                callback(null, garageItem);
			}
		});
	}
	static findAll(callback) {
		db.query('SELECT * FROM garage_items', callback);
	}

	static deleteById(id, callback) {
		db.query('DELETE FROM garage_items WHERE id = ?', [id], callback);
	}
}

module.exports = GarageItem;

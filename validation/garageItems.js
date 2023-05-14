const validateGarageItem = (garageItem) => {
	const product_cost = parseFloat(garageItem.product_cost);
	const retail_price = parseFloat(garageItem.retail_price);
	const quantity_on_hand = parseInt(garageItem.quantity_on_hand);
	if (!product_cost || !retail_price || !quantity_on_hand) {
		throw new Error('Missing required fields');
	}
	
	if (typeof product_cost !== 'number') {
		throw new Error('Invalid product cost');
	}
	if (typeof retail_price !== 'number') {
		throw new Error('Invalid retail price');
	}
	if (typeof quantity_on_hand !== 'number') {
		throw new Error('Invalid quantity');
	}
	if (product_cost < 0) {
		throw new Error('Product cost cannot be negative');
	}

	if (retail_price < 0) {
		throw new Error('Retail price cannot be negative');
	}

	if (quantity_on_hand < 0) {
		throw new Error('Quantity on hand cannot be negative');
	}

	if (retail_price <= product_cost) {
		throw new Error('Retail price must be greater than product cost');
	}
};

module.exports = validateGarageItem;
const validateGarageItem = (garageItem) => {
	const product_cost = parseFloat(garageItem.product_cost);
	const retail_price = parseFloat(garageItem.retail_price);
	const quantity_on_hand = parseInt(garageItem.quantity_on_hand);

	if (!product_cost || !retail_price || !quantity_on_hand) {
		throw new Error('حقول مطلوبة مفقودة');
	}

	if (typeof product_cost !== 'number') {
		throw new Error('تكلفة المنتج غير صالحة');
	}

	if (typeof retail_price !== 'number') {
		throw new Error('سعر البيع بالتجزئة غير صالح');
	}

	if (typeof quantity_on_hand !== 'number') {
		throw new Error('الكمية غير صالحة');
	}

	if (product_cost < 0) {
		throw new Error('تكلفة المنتج لا يمكن أن تكون سالبة');
	}

	if (retail_price < 0) {
		throw new Error('سعر البيع بالتجزئة لا يمكن أن يكون سالبًا');
	}

	if (quantity_on_hand < 0) {
		throw new Error('الكمية المتوفرة لا يمكن أن تكون سالبة');
	}

	if (retail_price <= product_cost) {
		throw new Error('سعر البيع بالتجزئة يجب أن يكون أعلى من تكلفة المنتج');
	}
};

module.exports = validateGarageItem;

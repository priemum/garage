const validateOrder = (order) => {

	// Validate order_type
	if (!order.order_type || !['sell', 'buy'].includes(order.order_type)) {
		throw new Error('Invalid order type');
	}

	order.quantity = parseInt(order.quantity);
	// Validate quantity
	if (
		!order.quantity ||
		typeof order.quantity !== 'number' ||
		order.quantity < 1
	) {
		throw new Error('Invalid quantity');
	}
};
module.exports = validateOrder;
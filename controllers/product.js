const Product = require('../models/product');

exports.index = (req, res, next) => {
	Product.findAll((err, products) => {
		if (err) {
			return next(err);
		}
		res.render('products/index', { products });
	});
};

exports.new = (req, res) => {
	res.render('products/new', { product: new Product() });
};

exports.create = (req, res, next) => {
	const { name, upc } = req.body;
	const productData = { name, universal_product_code: upc };
	Product.create(productData, (err, product) => {
		if (err) {
			if (err.code === 'ER_DUP_ENTRY') {
				req.flash('error', 'A product with that UPC already exists');
			} else {
				return next(err);
			}
		} else {
			req.flash('success', 'Product created successfully');
		}
		res.redirect('/products');
	});
};

exports.delete = (req, res, next) => {
	const productId = req.params.id;
	Product.deleteById(productId, (err) => {
		if (err) {
			return next(err);
		}
		req.flash('success', 'Product deleted successfully');
		res.redirect('/products');
	});
};

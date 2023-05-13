const Category = require('../models/category');

exports.index = (req, res, next) => {
	Category.findAll((err, categories) => {
		if (err) {
			return next(err);
		}
		res.render('categories/index', { categories });
	});
};

exports.new = (req, res) => {
	res.render('categories/new', { category: new Category() });
};

exports.create = (req, res, next) => {
    const { name } = req.body;
	Category.create({name}, (err, category) => {
		if (err) {
			if (err.code === 'ER_DUP_ENTRY') {
				req.flash('error', 'A Category with this name already Exists');
			} else {
				return next(err);
			}
		} else {
			req.flash('success', 'Category created successfully');
		}
		res.redirect('/categories');
	});
};

exports.delete = (req, res, next) => {
	const categoryId = req.params.id;
	Category.deleteById(categoryId, (err) => {
		if (err) {
			return next(err);
		}
		req.flash('success', 'Category deleted successfully');
		res.redirect('/categories');
	});
};

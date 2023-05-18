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
	Category.create({ name }, (err, category) => {
		if (err) {
			if (err.code === 'ER_DUP_ENTRY') {
				req.flash('error', 'توجد فئة بهذا الاسم بالفعل');
				return res.redirect('/categories/new');
			} else {
				return next(err);
			}
		} else {
			req.flash('success', 'تم إنشاء الفئة بنجاح');
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
		req.flash('success', 'تم حذف الفئة بنجاح');
		res.redirect('/categories');
	});
};

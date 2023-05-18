const Customer = require('../models/customer');
const checkEmailExists = require('../middleware/checkEmailExists');
const validateCustomer = require('../validation/cutomers');

exports.index = (req, res, next) => {
	Customer.findAll((err, customers) => {
		if (err) {
			return next(err);
		}
		res.render('customers/index', { customers });
	});
};

exports.new = (req, res) => {
	res.render('customers/new', { customer: new Customer() });
};

exports.create = (req, res, next) => {
	const { name, email, phone } = req.body;
	try {
		validateCustomer(req.body);
	} catch (err) {
		req.flash('error', err.message);
		return res.redirect('/customers/new');
	}
	checkEmailExists(null, email, (err, exists) => {
		if (err) {
			return callback(err);
		}
		if (exists) {
			req.flash('error', 'البريد الإلكتروني موجود بالفعل');
			return res.redirect('/customers');
		}
		const customer = new Customer(name, email, phone);
		customer.save((err) => {
			if (err) {
				return next(err);
			}
			req.flash('success', 'تمت إضافة العميل بنجاح');
			res.redirect('/customers');
		});
	});
};

exports.delete = (req, res, next) => {
	Customer.findById(req.params.id, (err, customer) => {
		if (err) {
			return next(err);
		}
		if (!customer) {
			return res.sendStatus(404);
		}
		Customer.delete(customer.id, (err, result) => {
			if (err) {
				return next(err);
			}
			req.flash('success', 'تم حذف العميل بنجاح');
			res.redirect('/customers');
		});
	});
};

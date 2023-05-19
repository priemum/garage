const validateCustomer = (customer) => {
	const { name, email, phone } = customer;

	if (!name) {
		throw new Error('لا يمكن أن يكون الاسم فارغًا');
	}

	if (!email) {
		throw new Error('لا يمكن أن يكون البريد الإلكتروني فارغًا');
	}

	const emailRegex = /^\S+@\S+\.\S+$/;
	if (!emailRegex.test(email)) {
		throw new Error('تنسيق البريد الإلكتروني غير صالح');
	}

	if (!phone) {
		throw new Error('لا يمكن أن يكون رقم الهاتف فارغًا');
	}
	const regex = /^[+\d\s]+$/;
	if (!regex.test(phone)) {
		throw new Error('رقم الهاتف غير صالح');
	}
};

module.exports = validateCustomer;

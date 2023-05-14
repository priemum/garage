const validateCustomer = (customer) => {
	const { name, email, phone } = customer;

	if (!name) {
        throw new Error('Name cannot be empty');
    }

	if (!email) {
        throw new Error('Email cannot be empty');
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
    }

	if (!phone) {
		throw new Error('Phone cannot be empty');
	}
	const regex = /^[+\d\s]+$/;
	if (!regex.test(phone)) {
		throw new Error('Invalid Phone Number');
	}
};

module.exports = validateCustomer;
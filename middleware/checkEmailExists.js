const db = require('../models/db')
function checkEmailExists(req, email, callback) {
	const sql = 'SELECT * FROM customers WHERE email = ?';
	db.query(sql, email, (err, result) => {
		if (err) {
			callback(err, null);
		} else {
			callback(null, result.length > 0);
		}
	});
}
module.exports = checkEmailExists;
const mysql = require('mysql');

const db = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER_NAME,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
});

db.connect((err) => {
	if (err) {
		console.log(
			'DB connection failed \n Error: ' + JSON.stringify(err, undefined, 2)
		);
	} else {
		console.log('DB connection succeeded');
	}
});

module.exports = db;

if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const mysql = require('mysql');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const ExpressError = require('./ExpressError');

app.engine('ejs', ejsMate);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const mysqlConnection = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER_NAME,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
});

mysqlConnection.connect((err) => {
	if (!err) {
		console.log('DB connection succeeded');
	} else {
		console.log(
			'DB connection failed \n Error: ' + JSON.stringify(err, undefined, 2)
		);
	}
});

users = [];

users.push({
	id: Date.now().toString(),
	name: 'Admin',
	email: process.env.LOGIN_ID,
	password: process.env.LOGIN_PASSWORD,
});

const initializePassport = require('./passport-config');
initializePassport(
	passport,
	(email) => users.find((user) => user.email === email),
	(id) => users.find((user) => user.id === id)
);

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(flash());
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
	})
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

app.use((req, res, next) => {
	res.locals.errorMessage = req.flash('error');
	next();
});

app.get('/', (req, res) => {
	res.send('Good Job!');
});

app.get('/test', checkAuthenticated, (req, res) => {
	res.send('You are logged in');
});

app.get('/login', checkNotAuthenticated, (req, res) => {
	res.render('users/login.ejs');
});

app.post(
	'/login',
	checkNotAuthenticated,
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/login',
		failureFlash: true,
	})
);

app.all('*', (req, res, next) => {
	next(new ExpressError('Page Not Found', 400));
});

app.use((err, req, res, next) => {
	const { status = 500 } = err;
	if (!err.message) err.message = 'Oh No, Something Went Wrong!';
	res.status(status).render('error', { err });
});

function checkAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}

	res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return res.redirect('/');
	}
	next();
}

const port = 5000;
app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});

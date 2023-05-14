if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const express = require('express');
const app = express();
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const ExpressError = require('./ExpressError');
const db = require('./models/db');
const path = require('path');

app.engine('ejs', ejsMate);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const {checkAuthenticated,checkNotAuthenticated} = require('./middleware/auth');

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

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname,'public')));
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
	res.locals.successMessage = req.flash('success');
	next();
});

const customerRoute = require('./routes/customer');
const productRoute = require('./routes/product');
const categoryRoute = require('./routes/category');
const garageItemRoute = require('./routes/garageItem');
const orderRoute = require('./routes/order');

app.use('/customers', customerRoute);
app.use('/products', productRoute);
app.use('/categories', categoryRoute);
app.use('/garageItems', garageItemRoute);
app.use('/orders', orderRoute);

app.get('/', (req, res) => {
	res.render('home.ejs');
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

app.get('/logout', (req, res) => {
	req.logout(function (err) {
		if (err) {
			// handle error
			return req.flash('error',err.message);
		}
		res.redirect('/login');
	});
});

app.get('/monthly_profit_cost', checkAuthenticated, (req, res) => {
	db.query('SELECT * FROM monthly_profit_cost', (err, result) => {
		if (err) {
			console.log(err);
			res.sendStatus(500);
			return;
		}
		res.render('revenues.ejs', { monthly_profit_cost: result });
	});
});

app.all('*', (req, res, next) => {
	next(new ExpressError('Page Not Found', 400));
});

app.use((err, req, res, next) => {
	const { status = 500 } = err;
	if (!err.message) err.message = 'Oh No, Something Went Wrong!';
	res.status(status).render('error', { err });
});

const port = 5000;
app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});

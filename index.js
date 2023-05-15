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

const {
	checkAuthenticated,
	checkNotAuthenticated,
} = require('./middleware/auth');

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
app.use(express.static(path.join(__dirname, 'public')));
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
	const currentPath = req.path;
	// Set a variable to track the active header
	res.locals.header = '';
	// Check if the current path matches any of the desired paths
	if (currentPath === '/monthly_profit_cost') {
		res.locals.header = 'dashboard';
	} else if (currentPath.startsWith('/customers')) {
		res.locals.header = 'management';
	} else if (currentPath.startsWith('/products')) {
		res.locals.header = 'management';
	} else if (currentPath.startsWith('/categories')) {
		res.locals.header = 'management';
	} else if (currentPath.startsWith('/garageItems')) {
		res.locals.header = 'management';
	} else if (currentPath.startsWith('/orders')) {
		res.locals.header = 'management';
	}
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
	res.render('users/login.ejs');
});

app.get('/login', checkNotAuthenticated, (req, res) => {
	res.render('users/login.ejs');
});

app.post(
	'/login',
	checkNotAuthenticated,
	passport.authenticate('local', {
		successRedirect: '/monthly_profit_cost',
		failureRedirect: '/login',
		failureFlash: true,
	})
);

app.get('/logout', (req, res) => {
	req.logout(function (err) {
		if (err) {
			// handle error
			return req.flash('error', err.message);
		}
		res.redirect('/login');
	});
});

app.get('/monthly_profit_cost', checkAuthenticated, (req, res) => {
	db.query('SELECT * FROM monthly_profit_cost', (err, monthly_profit_cost) => {
		if (err) {
			console.log(err);
			res.sendStatus(500);
			return;
		}
		db.query(
			'SELECT SUM(profit) AS total_profit, SUM(cost) AS total_cost FROM monthly_profit_cost',
			(err, total_profit_cost) => {
				if (err) {
					console.log(err);
					res.sendStatus(500);
					return;
				}
				const query = `
							SELECT 
							t1.year, 
							t1.month, 
							t1.profit,
							IFNULL(ROUND(((t1.profit - t2.profit) / t2.profit) * 100, 2), 0) AS 'growth_rate'
							FROM 
							(SELECT * FROM monthly_profit_cost WHERE (year, month) = (YEAR(CURDATE()), MONTH(CURDATE()))) t1
							LEFT JOIN 
							(SELECT * FROM monthly_profit_cost WHERE (year, month) = (YEAR(CURDATE() - INTERVAL 1 MONTH), MONTH(CURDATE() - INTERVAL 1 MONTH))) t2
							ON 
							(t1.year = t2.year AND t1.month = t2.month + 1) OR (t1.year = t2.year + 1 AND t1.month = 1 AND t2.month = 12);
							`;

				db.query(query, (err, profit_growth) => {
					if (err) {
						console.log(err);
						res.sendStatus(500);
						return;
					}
					db.query(
						'SELECT COUNT(*) as total_orders from orders',
						(err, total_orders) => {
							if (err) {
								console.log(err);
								res.sendStatus(500);
								return;
							}
							db.query(
								'SELECT count(*) as total_customers FROM customers',
								(err, total_customers) => {
									if (err) {
										console.log(err);
										res.sendStatus(500);
										return;
									}
									db.query(
										`SELECT g.product_id, p.name, SUM(o.quantity) AS total_sell_orders, g.quantity_on_hand, g.retail_price
											FROM orders o
											JOIN garage_items g ON o.garage_item_id = g.id
											JOIN products p ON g.product_id = p.id
											WHERE o.order_type = 'sell'
											GROUP BY g.product_id, p.name, g.quantity_on_hand, g.retail_price
											ORDER BY total_sell_orders DESC
											LIMIT 5;`,
										(err, top_products) => {
											if (err) {
												console.log(err);
												res.sendStatus(500);
												return;
											}
											res.render('revenues.ejs', {
												monthly_profit_cost,
												total_profit_cost,
												total_orders,
												profit_growth,
												total_customers,
												top_products,
											});
										}
									);
								}
							);
						}
					);
				});
			}
		);
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

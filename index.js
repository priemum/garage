if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const session = require('express-session');
const flash = require('express-flash');
const mysql = require('mysql');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const ExpressError = require('./ExpressError');
const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))


app.get('/', (req, res) => {
    res.send("Good Job!");
})

app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 400));
})

//how to add .env in the .gitignore?

app.use((err, req, res, next) => {
    const { status = 500 } = err;
    if (!err.message) err.message = "Oh No, Something Went Wrong!";
    res.status(status).render('error', { err });
});

const port = 5000;
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
})
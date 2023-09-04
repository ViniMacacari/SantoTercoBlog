// require('dotenv').config();

import "dotenv/config.js";

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mathodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const connectDB = require('./server/config/db');
const {isActiveRoute} = require('./server/helpers/routeHelpers')

const app= express();
const PORT = 5000 || process.env.PORT;

// Conectar na DB
connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(mathodOverride('_method'));

app.locals.isActiveRoute = isActiveRoute;

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI
    }),
    // cookie: {maxAge: new Date (Date.now() + (3600000))}
}));

app.use(express.static('public'));

// Template
app.use(expressLayouts);
app.set('layout', './layouts/main')
// app.set('layout extract', true);
app.set('view engine', 'ejs');


app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/admin'));

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});

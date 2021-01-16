if (process.env.NODE_ENV != 'production') {
    require('dotenv').config();
}

const express = require('express');
const bodyParser = require('body-parser');
const session = require("express-session");
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const methodOverride = require('method-override');
const app = express();


const intializePassport = require('./passport-config');
intializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id));


app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

const users = [];

const port = process.env.PORT || 3000;



app.get('/', (req, res) => {
    res.render('index.ejs', {
        name: req.body.name
    });
});

app.get('/login', (req, res) => {
    res.render('login.ejs');
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true

}));

app.get('/register', (req, res) => {
    res.render('register.ejs');
});

app.post('/register', async(req, res) => {

    try {
        const hashpassword = await bcrypt.hash(req.body.password, 10);
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashpassword
        });
        res.redirect('/login')

    } catch {
        res.redirect('/register')
    }

});


app.delete('/logout', (req, res) => {
    req.logOut();
    return res.redirect('/login');
});



function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated) {
        return next();
    }
    return redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated) {
        return res.redirect('/');
    }
    next();
}

app.listen(port, () => {
    console.log(`Server started on port:${port}`);
});
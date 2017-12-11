var express             = require('express');
var router              = express.Router();
var User                = require('../models/user');
var passport            = require('passport');
var LocalStrategy       = require('passport-local').Strategy;

//signin page render
router.get('/signin', function(req, res){
    res.render('signin', { title: 'FoodX | Registration', bodyClass: 'registration', customNavbar: 'registration-navbar' ,homeMenuClass: '', aboutMenuClass: ''});
});

// signin post request
router.post('/signin', function(req, res, next){
    var username        = req.body.usernameField;
    var email           = req.body.emailField;
    var password        = req.body.passwordField;
    var verifyPassword  = req.body.verifyPasswordField;

    req.checkBody('usernameField',          'Username is required').notEmpty();
    req.checkBody('emailField',             'Email is required').notEmpty();
    req.checkBody('emailField',             'Email is not valid').isEmail();
    req.checkBody('passwordField',          'Password is required').notEmpty();
    req.checkBody('passwordField',          'Passwords have to match').equals(req.body.verifyPasswordField);

    var errors          = req.validationErrors();

    // If any error show it
    if (errors){
        res.render('signin', {
            errors:errors,
            title: 'FoodX | Registration', 
            bodyClass: 'registration', 
            customNavbar: 'registration-navbar',
            homeMenuClass: '', 
            aboutMenuClass: ''
        });
    } else{

        var newUser = new User({
            username    : username,
            email       : email,
            password    : password

        });

        User.createUser(newUser, function(err, user){
            if(err) throw err;
            console.log(user);
        });

        req.flash('success_msg', 'You are registered and you can login');
        res.redirect('/users/login');

        // Print user information to console
        console.log("User created with following information")
        console.log("Username", username);
        console.log("Email", email);
        console.log("Password", password);
        console.log("Verify Password", verifyPassword);
    }

    //res.render('signin', { title: 'FoodX | Registration', bodyClass: 'registration', customNavbar: 'registration-navbar' ,homeMenuClass: '', aboutMenuClass: ''});
});

// login page render
router.get('/login', function(req, res){
    res.render('login', { title: 'FoodX | Login', bodyClass: 'registration', customNavbar: 'registration-navbar' ,homeMenuClass: '', aboutMenuClass: ''});
});

passport.use(new LocalStrategy(
function(username, password, done) {
    User.getUserByUsername(username, function(err, user){
        if(err) throw err;
        if(!user){
            return done(null, false, {message: 'Unknown User'});
        }

        User.comparePassword(password, user.password, function(err, isMatch) {
            if(err) throw err;
            if(isMatch){
                return done(null, user);
            } 
            else{
                return done(null, false, {message: 'Invalid password'});
            }
        });
    });
}));

// Serialize user
passport.serializeUser(function(user, done) {
    done(null, user.id);
});
 
// Deserialize user
passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
        done(err, user);
    });
});


// loging post request
router.post('/login', 
    passport.authenticate('local',{successRedirect:'/recipe', failureRedirect: '/users/login', failureFlash: true}),
    function(req, res) {
        res.redirect('/');
});

router.get('/logout', function(req, res){
    req.logout();
    req.flash('success_msg', 'You are logged out');

    res.redirect('/');
})

module.exports = router;
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const passport = require('passport');

// User model
const User = require('../models/User')

// Login page
router.get('/login', (req, res) => {
    res.render('login');
})

// Register page
router.get('/register', (req, res) => {
    res.render('register');
})

// Register Handle
router.post("/register", (req, res) => {
    // array destructuring
    const {name, email, password, password2} = req.body;
    let errors = [];

    // Check required fields
    if (!name || !email || !password || !password2) {
        errors.push(({
            msg: 'Please fill in all fields'
        }));
    }

    // Check passwords match
    if (password !== password2) {
        errors.push({
            msg: 'Passwords do not match'
        });
    }

    // Check len of < 6 char for passwords
    if (password.length < 6) {
        errors.push({
            msg: 'Password should be at least six characters'
        });
    }

    if (errors.length > 0) {
        res.render('register', {
            errors: errors,
            name: name,
            email: email,
            password: password,
            password2: password2
        })
    } else {
        // Validation passed
        User.findOne({email: email})
            .then(user => {
                if (user) {
                    // User exists
                    errors.push({msg: 'Email is already registered'});
                    res.render('register', {
                        errors: errors,
                        name: name,
                        email: email,
                        password: password,
                        password2: password2
                    });
                } else {
                    const newUser = new User({
                        name: name,
                        email: email,
                        password: password
                    });

                    // Hash Password
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            // Set password to hashed
                            newUser.password = hash;

                            // Save the user
                            newUser.save()
                                .then(user => {
                                    req.flash('success_msg', 'You are now registered and can log in');
                                    res.redirect('/users/login')
                                })
                                .catch(err => console.log(err));
                        })
                    })
                }
            });
    }

});

// Login Handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Logout Handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/login');
})


module.exports = router;

/**
 * SessionController
 *
 * @module        :: Controller
 * @description    :: Contains logic for handling requests.
 */

var bcrypt = require('bcrypt');

module.exports = {

    'new': function (req, res) {
        res.view('session/new');
    },

    create: function (req, res, next) {

        // Check for email and password in params sent via the form, if none
        // redirect the browser back to the sign-in form.
        if (!req.param('email') || !req.param('password')) {
            // return next({err: ["Password doesn't match password
            // confirmation."]});

            var usernamePasswordRequiredError = [
                req.__('auth-error')
            ]

            // Remember that err is the object being passed down (a.k.a.
            // flash.err), whose value is another object with the key of
            // usernamePasswordRequiredError
            req.session.flash = {
                err: usernamePasswordRequiredError
            };

            res.redirect('/session/new');
            return;
        }

        // Try to find the user by there email address.
        // findOneByEmail() is a dynamic finder in that it searches the model
        // by a particular attribute.
        // User.findOneByEmail(req.param('email')).done(function(err, user) {
        User.findOneByEmail(
            req.param('email'), function foundUser(err, user) {
                if (err) return next(err);

                // If no user is found...
                if (!user) {
                    var noAccountError = [
                        req.__('user-not-found-err')
                    ]
                    req.session.flash = {
                        err: noAccountError
                    }
                    res.redirect('/session/new');
                    return;
                }

                // Compare password from the form params to the encrypted
                // password of the user found.
                bcrypt.compare(
                    req.param('password'),
                    user.encryptedPassword,
                    function (err, valid) {
                        if (err) return next(err);

                        // If the password from the form doesn't match the
                        // password from the database...
                        if (!valid) {

                            req.session.flash = {
                                err: [req.__('auth-error')]
                            };

                            res.redirect('/session/new');
                            return;
                        }

                        // Log user in
                        req.session.authenticated = true;
                        req.session.User = user;

                        //res.redirect('/user/show/' + user.id);
                        res.redirect('/');
                    });
            });
    },

    destroy: function (req, res, next) {

        // Wipe out the session (log out)
        req.session.destroy();

        // Redirect the browser to the sign-in screen
        res.redirect('/session/new');

    }
};

/**
 * OrderController
 *
 * @description :: Server-side logic for managing orders
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    // This loads the sign-up page --> new.ejs
    'new': function (req, res) {
        User.find({role: 'driver'})
            .then((drivers = []) => {
                res.view({drivers});
            })
            .then((data) => {
                res.view(data);
            })
            .catch((err) => {
                res.serverError(err);
            });

    },

    index: function (req, res, next) {
        Order.find()
            .populate('customer')
            .exec(function foundOrder(err, orders) {
                if (err) return next(err);

                res.view({orders});
            });
    },

    create: function (req, res, next) {
        let values = req.params.all();

        Customer //todo вообще не факт что хорошее решение создавать в этом контроллере другую модель и сохранять
            .create(_.pick(values, [
                'city',
                'district',
                'name',
                'address',
                'phones'
            ]))
            .then((customer) => {
                values.customer = customer.id;

                Order.create(values, function orderCreated(err, user) {
                    if (err) {
                        sails.log.error(err);
                        req.session.flash = {err: [req.__('order-create-error')]};

                        return res.redirect('/order/new');
                    }

                    res.redirect('/order');
                });
            })
            .catch((err) => {
                res.serverError(err);
            });
    },


};


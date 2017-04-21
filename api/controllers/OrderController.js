/**
 * OrderController
 *
 * @description :: Server-side logic for managing orders
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    // This loads the sign-up page --> new.ejs
    'new' (req, res) {
        var data = {};

        Customer.find({
            city: sails.config.dictionary.city.names[0]
        })
        .then((customers = []) => {
            return customers.map((customer) => {
                return {value: customer.district};
            })
        })
        .then((districts) => {
            data.districts = _.uniqBy(districts, 'value');

            res.view(data);
        })
        .catch((err) => {
            res.serverError(err);
        });

    },

    index (req, res, next) {
        Order.find()
            .sort('dateCreate DESC')
            .populate('customer')
            .exec(function foundOrder(err, orders) {
                if (err) return next(err);

                res.view({orders});
            });
    },

    create (req, res, next) {
        const values = _.omitBy(req.params.all(), _.isEmpty);

        Order.createOrderWithCustomer(values)
            .then(() => {
                res.redirect('/order');
            })
            .catch((err) => {
                sails.log.error(err);
                req.session.flash = {
                    err: [
                        req.__('order-create-error'),
                        JSON.stringify(err)
                    ]
                };

                return res.redirect('/order/new');
            });
    },

    edit (req, res, next) {
        const id = req.param('id');
        const data = {};

        if (_.isEmpty(id)) {
            return next(new Error('ID required but empty.'));
        }

        User.find({role: 'driver'})  //todo поиск водителя и рйонов нужно делать параллельно
            .then((drivers = []) => {
                data.drivers = drivers;

                return Order.findOne({id})
                    .populate('customer')
                    .then((order) => {
                        if (!order) {
                            return res.notFound();
                        }

                        data.order = order;
                        res.view(data);
                    });
            })
            .catch((err) => {
                next(err);
            });
    },

    update (req, res, next) {
        Order.updateOrderWithCustomer(req.params.all())
            .then(() => {
                res.redirect('/order');
            })
            .catch((err) => {
                sails.log.error(err);
                req.session.flash = {
                    err: [
                        req.__('order-create-error'),
                        JSON.stringify(err)
                    ]
                };

                return res.redirect('/order/edit');
            });
    },
};


/**
 * OrderController
 *
 * @description :: Server-side logic for managing orders
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const _ = require('lodash');
const Promise = require("bluebird");

module.exports = {

    _viewsByRole: {
        owner: 'index',
        admin: 'index',
        manager: 'index-manager',
    },

    _paginationLimitsByRole: {
        owner: 7,
        admin: 7,
        manager: 2,
    },

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
        const moment = sails.moment;
        const today = moment().format('YYYY-MM-DD');
        const date = req.param('date') || today; //todo че нить с форматированием придумать
        const thirtyDaysFromDate = moment(date).add(30, 'd').format('YYYY-MM-DD');
        const tomorrow = moment(date).add(1, 'd').format('YYYY-MM-DD');

        Promise.all([
                this._getOrdersDates(today, thirtyDaysFromDate),
                this._getOrders(date, tomorrow)
            ])
            .then((result) => {
                const template = this._viewsByRole[req.session.user.role];
                const paginationLimit = this._paginationLimitsByRole[req.session.user.role];

                if (!template) {
                    return  next('No template found for user role - ', req.session.user.role);
                }

                const prevDates = this._getPrevDates(date, result[0]);
                const nextDates = this._getNextDates(date, result[0]);
                const nextDaysLimit = paginationLimit +
                    (prevDates.length < paginationLimit ? paginationLimit - prevDates.length : 0);
                const prevDaysLimit = paginationLimit +
                    (nextDaysLimit.length < paginationLimit ? paginationLimit - nextDaysLimit.length : 0);

                res.view('order/' + template, {
                    moment: moment,
                    dates: result[0],
                    orders: result[1],
                    currentDate: moment(date).format('YYYY-MM-DD'),
                    prevDates: prevDates.slice(-prevDaysLimit),
                    nextDates: nextDates.slice(0, nextDaysLimit)
                });
            })
            .catch((e) => {
                console.log(e); //todo errors log

                res.serverError(e);
            });
    },

    _getNextDates (from, dates) {
        const moment = sails.moment;

        return dates.reduce(function (result, date) {
            if (moment(date).isAfter(from)) {
                result.push(moment(date).format('YYYY-MM-DD'));
            }

            return result;
        }, []);
    },

    _getPrevDates (from, dates) {
        const moment = sails.moment;

        return dates.reduce((result, date) => {
            if (moment(date).isBefore(from)) {
                result.push(moment(date).format('YYYY-MM-DD'));
            }

            return result;
        }, []);
    },

    _getOrders (from, to) {
        return Order.find({
            orderDate: {   //todo как то кривовато выглядит
                '>=': from,
                '<': to
            }
        })
        .sort('dateCreate DESC')
        .populate('customer');
    },

    _getOrdersDates (from, to) {
        const moment = sails.moment;

        return Order.find({
                orderDate: {   //todo как то кривовато выглядит
                    '>=': from,
                    '<': to
                }
            })
            .sort('orderDate ASC')
            .then((orders) => {
                return _.uniq(orders.map((order) => {
                    return moment(order.orderDate).format('YYYY-MM-DD');
                }));
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


module.exports = {
    index: function (req, res, next) {

        const criteria = {
            where: {
                orderDate: {'>=': sails.moment().set('hour', 0).set('minute', 1).format()}
            },
            sort: 'orderDate',
        };

        if (User.isDriver(req.session.user)) {
            //todo польное привязано к заказу. Нужен метод getFullNameByEmail
            criteria.where.driver = req.session.user.name + ' ' + req.session.user.lastName;
            criteria.where.orderDate = {
                '>=': sails.moment().set('hour', 0).set('minute', 0).format(),
                '<=': sails.moment().add(1, 'day').set('hour', 24).format()
            };
        }

        Order.find(criteria)
            .populate('customer')
            .exec(function foundOrder(err, orders) {
                if (err) return next(err);

                res.view({orders});
            });
    },
};
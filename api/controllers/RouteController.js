module.exports = {
    index: function (req, res, next) {
        const moment = sails.moment;
        const today = moment().format('YYYY-MM-DD');
        const criteria = {
            //todo critical убрать все добавления часов минут и тд работать с датой
            where: {
                orderDate: {'>=': today}
            },
            sort: 'orderDate',
        };

        if (User.isDriver(req.session.user)) {
            //todo польное привязано к заказу. Нужен метод getFullNameByEmail
            criteria.where.driver = req.session.user.name + ' ' + req.session.user.lastName;
            criteria.where.orderDate = {
                '>=': today,
                '<=': moment().add(1, 'day').set('hour', 24).format('YYYY-MM-DD')
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
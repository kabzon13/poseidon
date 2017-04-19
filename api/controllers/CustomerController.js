const _ = require('lodash');

module.exports = {
    search (req, res, next) {
        const customerFields = [
            'city',
            'phones',
            'address',
            'name',
        ];

        const params = _.omitBy(
            _.pick(req.params.all(), customerFields),
            _.isEmpty
        );

        const criteria = {
            where: customerFields.reduce((result, name) => {
                if (name != 'address')  {
                    params[name] && (result[name] = {
                        contains: params[name]
                    });
                } else {
                    params.address && (result.address = {$in: [new RegExp(params.address)]})
                }

                return result;
            }, {})
        };

        Customer.find(criteria)
            .then((customers = []) => {
                const customersInfo = {};

                const result = customers.reduce(function (result, customer) {
                    customersInfo[customer.id] = _.pick(
                        customer,
                        ['district', 'phones', 'address', 'name']
                    );

                    ['district', 'phones', 'address', 'name'].forEach(function (key) {
                        result[key] = result[key] || {};
                        result[key].values = result[key].values || [];

                        if (customer[key]) {
                            //todo муть - нужно человеческое описание
                            _.isArray(customer[key]) ?
                                (result[key].values = result[key].values.concat(
                                    customer[key].map((value) => {
                                        return {value: value, data: customer.id};
                                    })
                                )) :

                                result[key].values.push({
                                    value: customer[key],
                                    data: customer.id
                                });
                        }
                    });

                    return result;
                }, {});

                ['district', 'phones', 'address', 'name'].forEach(function (key) {

                    if (result[key]) {
                        result[key].values = _.uniqBy(result[key].values, 'value');
                    }
                });

                res.json({data: result, customers: customersInfo});
            })
            .catch((err) => {
                next(err);
            });
    }
};


module.exports = {
    'district': function (req, res) {
        Customer.find({city: req.param('city')})
            .then((customers = []) => {
                var districts = customers.map((customer) => {
                    return {value: customer.district};
                });

                res.json(districts);
            })
            .catch((err) => {
                res.serverError(err);
            });
    },

    'address': function (req, res) {
        Customer.find({
                city: req.param('city'),
                district: req.param('district')
            })
            .then((customers = []) => {
                var districts = customers.map((customer) => {
                    return {value: customer.address};
                });

                res.json(districts);
            })
            .catch((err) => {
                res.serverError(err);
            });
    }
};


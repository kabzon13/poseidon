/**
 * Order.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const _ = require('lodash');

module.exports = {

    schema: true,

    attributes: {
        dateCreate: {
            type: 'datetime',
            defaultsTo () {
                return sails.moment().format();
            }
        },

        orderDate: {
            type: 'date',
            defaultsTo () {
                return sails.moment().format('YYYY-MM-DD');
            }
        },

        customer: {
            model: 'customer'
        },

        address: {
            type: 'string',
            required: true
        },

        paymentForm: {
            type: 'string',
            enum: sails.config.dictionary.paymentForms,
            defaultsTo: sails.config.dictionary.paymentForms[0]
        },

        bottlesQuantity: {
            type: 'string',
            integer: true,
            required: true
        },

        comment: {
            type: 'mediumtext',
            defaultsTo: ''
        },

        driver: {
            type: 'string'
        },

        status: {
            type: 'string',
            enum: [
                'new',
                'done',
                'rejected',
                'in-progress',
            ],
            required: true,
            defaultsTo:'new'
        }
    },

    createOrderWithCustomer (data) {
        const customerData = _.omitBy(
            _.pick(data, [
                'city',
                'district',
                'name',
                'address',
                'phones'
            ]),
            _.isUndefined
        );


        if (!_.isEmpty(customerData.phones)) {

            return Customer.findByPhones(customerData.phones)
                .then((customer = []) => {

                    if (customer.length) {
                        if (customer.length > 1) {
                            throw new Error(
                                'More then 1 customer with phones ' +
                                customerData.phones +
                                ' found'
                            );
                        }

                        customerData.address = _.uniq(
                            customer[0].address.concat(customerData.address)
                        );

                        return Customer.update({id: customer[0].id}, customerData)
                            .then((updated) => {
                                return updated[0].id;
                            })
                    }


                    return Customer.create(customerData)
                        .then((created) => {
                            return created.id;
                        });
                })
                .then((customerId) => {
                    data.customer = customerId;

                    return Order.create(data)
                        .then((order) => {

                            return order;
                        });
                });
        }

        throw new Error('Phones required');
    },


    updateOrderWithCustomer (data) {
        const customerData = _.omitBy(_.pick(data, [
                'city',
                'district', //todo важно!, район относится к заказу. Иначе апдейт одного заказа поменяет район везде. Районов может быть меньше либо равно адресам
                'address',
                'phones'
            ]),
            _.isUndefined
        );
        const orderData = _.omitBy(_.pick(data, [
                'orderDate',
                'paymentForm',
                'bottlesQuantity',
                'comment',
                'driver',
                'address'
            ]),
            _.isUndefined
        );

        return this.update({id: data.id}, orderData)
            .then((order) => {

                return Customer.find({id: order[0].customer})
                    .then((customer) => {
                        customer = customer[0];

                        customerData.address = _.uniq(
                            customer.address.concat(customerData.address)
                        );

                        return Customer.update({id: customer.id}, customerData);
                    });
            });
    }
};


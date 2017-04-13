/**
 * Order.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    schema: true,

    attributes: {
        dateCreate: {
            type: 'datetime',
            defaultsTo () {
                return new Date();
            }
        },

        orderDate: {
            type: 'date',
            defaultsTo () {
                return new Date();
            }
        },

        customer: {
            model: 'customer'
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
            type: 'mediumtext'
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
    }
};


/**
 * Order.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    schema: true,

    attributes: {
        // todo можно использовать алиасы для поиска и схлопывания заказщиков
        // часть можно формировать сразу на этапе создания ["Ленина 44", "44 Ленина"]
        // и можно дать возможность манагеру добавить алиас (тут еще можно продумать ручной мердж)

        city: {
            type: 'string',
            enum: sails.config.dictionary.city.names,
            required: true,
            defaultsTo: sails.config.dictionary.city.names[0]
        },

        district: {
            type: 'string'
        },

        name: {
            type: 'string',
            required: true
        },

        address: {
            type: 'string',
            required: true
        },

        phones: {
            type: 'string',
            //type: 'array', todo validation
            required: true
        },

        orders: {
            collection: 'order',
            via: 'customer'
        }
    }
};


/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 *
 */

module.exports = {

    schema: true,

    attributes: {
        name: {
            type: 'string',
            required: true
        },

        email: {
            type: 'string',
            email: true,
            required: true,
            unique: true
        },

        lastName: {
            type: 'string',
            defaultsTo: ''
        },

        role: {
            type: 'string',
            defaultsTo: 'user',
            enum: _.values(sails.config.dictionary.roles),
        },

        encryptedPassword: {
            type: 'string'
        },

        toJSON: function () {
            var obj = this.toObject();
            delete obj.encryptedPassword;
            return obj;
        }

    },

    beforeCreate: function (values, next) {
        // This checks to make sure the password and password confirmation match before creating record
        if (!values.password || values.password != values.confirmation) {
            return next({err: ["Password doesn't match password confirmation."]});
        }

        require('bcrypt').hash(values.password, 10, function passwordEncrypted(err, encryptedPassword) {
            if (err) return next(err);
            values.encryptedPassword = encryptedPassword;
            // values.online= true;
            next();
        });
    },

    isManager (user) {
        return user.role === 'manager';
    },

    isDriver (user) {
        return user.role === 'driver';
    },

    isAdmin (user) {
        return user.role === 'admin';
    },

    isOwner (user) {
        return user.role === 'owner';
    },

    isPrivileged (user) {
        return this.isAdmin(user) || this.isOwner(user);
    },

};

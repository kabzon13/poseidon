module.exports = {

    'index': function (req, res) {
        const roles = sails.config.dictionary.roles;
        if ([roles.owner, roles.admin].includes(req.session.user.role)) {
            res.view('homepage')
        }
        else {
            sails.controllers.session //todo move to service
                ._routToStartPage(req, res);
        }
    }
};

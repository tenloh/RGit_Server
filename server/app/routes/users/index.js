'use strict';
var router = require('express').Router();
var db = require('../../../db');
const User = db.model('user');
//eslint-disable-line new-cap
module.exports = router;


// var ensureAuthenticated = function (req, res, next) {
//     if (req.isAuthenticated()) {
//         next();
//     } else {
//         res.status(401).end();
//     }
// };

router.get('/', function (req, res, next) {
    User.findAll({})
    .then( users => res.json(users) )
    .catch(next)
});

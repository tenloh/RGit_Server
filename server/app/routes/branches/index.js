'use strict';
var router = require('express').Router();
var db = require('../../../db');
const Branch = db.model('branch');
//eslint-disable-line new-cap
module.exports = router;


var ensureAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).end();
    }
};

router.get('/', function (req, res, next) {
    Branch.findAll({})
    .then( branches => res.json(branches) )
    .catch(next)
});

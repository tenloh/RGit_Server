'use strict';
var router = require('express').Router();
var db = require('../../../db');
const Event = db.model('event');
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
    Event.findAll({})
    .then( events => res.json(events) )
    .catch(next)
});

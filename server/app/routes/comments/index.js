'use strict';
var router = require('express').Router();
var db = require('../../../db');
const Comment = db.model('comment');
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
    Comment.findAll({})
    .then( comments => res.json(comments) )
    .catch(next)
});

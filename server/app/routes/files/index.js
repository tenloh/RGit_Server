'use strict';
var router = require('express').Router();
var db = require('../../../db');
const File = db.model('file');
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
    File.findAll({})
    .then( files => res.json(files) )
    .catch(next)
});

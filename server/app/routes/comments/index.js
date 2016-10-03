'use strict';
var router = require('express').Router();
var db = require('../../../db');
const Promise = require('bluebird');
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

// //Enter a comment on a file from a specific branch - Expect data to have comment object
// //Expect query params to have fileId and branchId
// router.post('/', function (req, res, next){
//     Comment.create(req.body)
//     .then(comment => {
//         Promise.all([comment.addFile(req.query.fileId), comment.addBranch(req.query.branchId)])
//     })
//     .spread((commentAddFile, commentAddBranch) => res.json(commentAddBranch))
//     .catch(next)
// })

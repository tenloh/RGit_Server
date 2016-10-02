'use strict';
var router = require('express').Router();
var db = require('../../../db');
const File = db.model('file');
const Event = db.model('event');
const Comment = db.model('comment');
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

//Router Params for fileId
router.param('fileId', function (req, res, next, id) {
	    File.findOne({
            where: {
                id: req.params.fileId
            },
            include: [Event, Comment, Branch]
        })
        .then(file => {
            req.file = file
            next();
        })
		.catch(next);
});

//Get a file history
router.get('/:fileId', function(req, res, next){
    res.json(req.file);
});

//Get a list of all files that are currently being tracked
router.get('/', function (req, res, next) {
    File.findAll({})
    .then( files => res.json(files) )
    .catch(next)
});

//Remove a file from being tracked (deleted)
router.delete('/:fileId', function(req, res, next){
    req.file.destroy()
    .then( () => res.sendStatus(204))
    .catch(next)
});

//Add a file to be tracked
//Expect there to be file object with name and which branch it belongs to
router.post('/', function(req, res, next){
    File.create({
        fileName: req.body.file.name,
        branch: req.body.file.branch
    })
    .then(file => res.json(file))
    .catch(next)
})
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
router.delete('/', function(req, res, next){
    File.find({where: {
        fileName: req.body.fileName,
        repoId: req.body.repoId
    }})
    .then(result => {
        return result.removeUser([req.body.userId])
    })
    .then(() => res.sendStatus(204))
    .catch(next)


});

//Add a file to be tracked
//Expect there to be file object with name and which branch it belongs to
router.post('/', function(req, res, next){
    File.findOrCreate({where: {
        fileName: req.body.fileName,
        repoId: req.body.repoId
    }})
    .then(file => file[0].addUsers([req.body.userId]))
    .then(checkedOutFile => res.json(checkedOutFile))
    .catch(next)
    // .then(file => res.json(file))
    // .catch(next)
})

'use strict';
var router = require('express').Router();
var db = require('../../../db');
const File = db.model('file');
const Event = db.model('event');
const Comment = db.model('comment');
const Branch = db.model('branch');
const User = db.model('user');
const Channel = db.model('channel');
const User_File = db.model('User_File');
//eslint-disable-line new-cap
module.exports = router;


var ensureAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).end();
    }
};

//Router Params for fileId
//Due to de-limiting, file paths will come in with * instead of /
router.param('fileId', function(req, res, next, id) {
    req.params.fileId = req.params.fileId.split('*').join('/');
    req.query.repoId = req.query.repoId.split('*').join('/');
    Channel.findOne({
            where: {
                repoId: req.query.repoId
            }
        })
        .then(channel => {
            return File.findOne({
                where: {
                    fileName: req.params.fileId,
                    channelId: channel.id
                },
                include: [{
                    model: Event,
                    include: [User, Branch, Channel],
                    limit: 3,
                    order: [['createdAt', 'DESC']]
                }]
            })
        })
        .then(file => {
            req.file = file
            next();
        })
        .catch(next);
});

//Get a file history
router.get('/:fileId', function(req, res, next) {
    res.json(req.file);
});

//Get a list of all files that are currently being tracked OR for a specific user
router.get('/', function(req, res, next) {
    if (req.query.userId) {
        User.findById(req.query.userId, {
                include: [{
                    model: File
                }]
            })
            .then((watchFileList) => res.send(watchFileList.files))
    } else {
        File.findAll({})
            .then(files => res.json(files))
            .catch(next)

    }
    //  User.findById(req.params.userId, { include: [{model: Channel, include: [User]}]} )

});

//Remove a file from being tracked (deleted)
router.delete('/', function(req, res, next) {
    File.find({
            where: {
                fileName: req.body.fileName,
                repoId: req.body.repoId
            }
        })
        .then(result => {
            return result.removeUser([req.body.userId])
        })
        .then(() => res.sendStatus(204))
        .catch(next)


});

//Add a file to be tracked
//Expect there to be file object with name and which branch it belongs to
router.post('/', function(req, res, next) {
	console.log("BODY ", req.body)
    File.findOrCreate({
            where: {
                fileName: req.body.fileName,
                repoId: req.body.repoId
            }
        })
        .then(file => file[0].addUser(req.body.userId))
        .then(checkedOutFile => res.json(checkedOutFile))
        .catch(next)
})

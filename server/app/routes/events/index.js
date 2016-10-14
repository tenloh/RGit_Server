'use strict';
var router = require('express').Router();
var db = require('../../../db');
const Event = db.model('event');
const User  = db.model('user');
const Branch = db.model('branch');
const File = db.model('file');
const Channel = db.model('channel');
const Promise = require('bluebird');
//eslint-disable-line new-cap
module.exports = router;


var ensureAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).end();
    }
};

//Router Params for eventId
router.param('eventId', function (req, res, next, id) {
	    Event.findOne({
            where: {
                id: req.params.eventId
            },
            include: [User, Branch, File]
        })
        .then(event => {
            req.event = event
            next();
        })
		.catch(next);
});

// //Routes to get events for a given file
// router.put('/file/:fileId', function (req, res, next){
//     Event.findAll({
//         where:{
//             fileName: req.body.fileName
//         },
//         include: [User, Branch, File, Channel],
//         limit: 10,
//         order: [['createdAt', 'DESC']]
//     })
//     .then(events => res.json(events))
//     .catch(next)
// })

//Get repo id from query
router.get('/user/:username', function (req, res, next){
    req.query.repoId = req.query.repoId.split('*').join('/');
    let channelQuery = Channel.findOne({
        where: {
            repoId: req.query.repoId
        }
    })

    let userQuery = User.findOne({
        where: {
            name: req.params.username
        }
    })

    Promise.all([channelQuery, userQuery])
    .spread( (channel, user) => {
        return Event.findAll({
            where:{
                userId: user.id,
                channelId: channel.id
            },
            limit: 3,
            order: [['createdAt', 'DESC']]
        })
    })
    .then(events => {
        res.json(events);
    })
})


//Get all events for all repos
router.get('/', function (req, res, next) {
    Event.findAll({})
    .then( events => res.json(events) )
    .catch(next)
});

//Get specific Event
router.get('/:eventId', function (req, res, next){
    res.json(req.event);
})

//Create an Event
//Assume that events come with saveDetails, userId, branchId, and fileId
router.post('/', function(req, res, next){
    Event.create({
        saveDetails: req.body.saveDetails,
        timeOfSave: new Date()
    })
    .then(event => {
        return Promise.all([event.setUser(req.body.userId), event.setBranch(req.body.branchId), event.setFile(req.body.fileId)])
    })
    .then(event => res.json(event[0]))
    .catch(next)
})


//Remove a event from being tracked (deleted)
router.delete('/:eventId', function(req, res, next){
    req.event.destroy()
    .then( () => res.sendStatus(204))
    .catch(next)
});


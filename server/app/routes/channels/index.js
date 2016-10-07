'use strict';
var router = require('express').Router();
var db = require('../../../db');
const Promise = require('bluebird');
const Channel = db.model('channel');
const User = db.model('user');
//eslint-disable-line new-cap
module.exports = router;


var ensureAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).end();
    }
};


//Get all channels that exist + eager load the users for each channel
router.get('/', function (req, res, next) {
    Channel.findAll({
        include: [User]
    })
        .then(channels => res.json(channels))
        .catch(next)
});

//Get all channels for a given user
// router.get('/:userId', function (req, res, next) {
//     Channel.find({
//         where: {
//             userId: req.params.userId
//         }
//     })
//         .then(channels => res.json(channels))
//         .catch(next)
// });

//Add a channel for a given user - It is assumed you cannot add a channel without any users
//Assume req.body has channel object
router.post('/:userId', function (req, res, next) {
    Channel.findOrCreate({
        where: {
            repoId: req.body.repoId
        }
    }).spread(function (channel, created) {
        if (!created) return channel.addUser(req.params.userId);
        return channel;
    }).then(channel => res.json(channel))
        .catch(next)
});

//Delete a channel
router.delete('/:channelId', function (req, res, next) {
    Channel.destroy({
        where: {
            id: req.params.channelId
        }
    })
        .then(() => { res.sendStatus(204) })
        .catch(next);
});

//Remove a user from a channel
//Query should have userId and channelId
router.put('/remove', function (req, res, next) {
	console.log(req.query)
	Channel.findOne({
		where: {
			repoId: req.query.channelId
		}
	})
		.then(channel => channel.removeUser(req.query.userId))
		.then(() => res.send(204))
		.catch(next)
    // Channel.removeUser(req.query.channelId, req.query.userId)
    //     .then((channel) => res.json(channel))
    //     .catch(next)
});

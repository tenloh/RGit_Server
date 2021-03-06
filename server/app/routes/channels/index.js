'use strict';
var router = require('express').Router();
var db = require('../../../db');
const Promise = require('bluebird');
const Channel = db.model('channel');
const User = db.model('user');
const Event = db.model('event');
const Chat = db.model('chat');
//eslint-disable-line new-cap
module.exports = router;
const io = require('../../../io')


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

router.get('/:channelName', function (req, res, next) {
    req.params.channelName = req.params.channelName.split('*').join('/');
    Channel.findOne({
        where: {
            repoId: req.params.channelName
        },
        include: [{model: Chat} ,{model: Event, limit: 5, order: [['createdAt', 'DESC']], include: [User]}]
    })
        .then(channel => res.json(channel))
        .catch(next)
});

//Add a channel for a given user - It is assumed you cannot add a channel without any users
//Assume req.body has channel object
router.post('/:userId', function (req, res, next) {
    let channel = Channel.findOrCreate({
        where: {
            repoId: req.body.repoId
        }
    })
    let promiseArray = [channel];
    //Only used when no id can be found
    let user;
	let channelInfo
    if(req.body.userName){
        user = User.findOrCreate({
            where: {
                name: req.body.userName
            }
        })
    }
    Promise.all([channel, user])
    .then( responseArray => {
        //[[channel, created or not], [user, created]]
		console.log(responseArray[0])
		channelInfo = JSON.parse(JSON.stringify(responseArray[0]))
        if(req.body.userName) return responseArray[0][0].addUser(responseArray[1][0])
		return responseArray[0][0].addUser(req.params.userId)
    })
    .then( channel => {
		res.io.to(channelInfo[0].repoId).emit('reloadTeam', channelInfo[0].repoId)
		let addedUser = io.getClient(req.body.userName)
		res.io.to(addedUser).emit('reloadChannels', channelInfo[0].repoId)
        res.json(channel)
    })
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
	let promiseArray = [Channel.findOne({
		where: {
			repoId: req.query.channelId
		}
    })]

    if(req.query.userName){
        promiseArray.push(User.findOne({where: { name: req.query.userName}}))
    }
		Promise.all(promiseArray)
        .then(resultArray => {
            let channel = resultArray[0];
			res.io.to(req.query.channelId).emit('reloadTeam', req.query.channelId)
			let addedUser = io.getClient(req.body.userName)
			res.io.to(addedUser).emit('reloadChannels', req.query.channelId)
            if(req.query.userName) return channel.removeUser(resultArray[1]);
            return channel.removeUser(req.query.userId)
        })
		.then(() => res.send(204))
		.catch(next)
});

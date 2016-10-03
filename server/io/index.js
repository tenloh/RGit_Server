'use strict';
var socketio = require('socket.io');
var io = null;
const User = '../db/models/user.js'
const Channel = '../db/models/user.js'

module.exports = function (server) {

    if (io) return io;

    io = socketio(server);

    io.on('connection', function (socket) {
		socket.on('passLogin', function(loginName) {
			//TOCHANGE: hit the db and get all the channels that the user is associated with
			//something like:
			return User.findOne({
				where: {
					name: loginName
				},
				include: [ model: Channel ]
			}) 
				.then(function(loggingUser) {
					return loggingUser.channels.forEach(channel=> {
						//TOCHANGE: need to include reponame in db, or change
						//how things are being stored client-side
						socket.join(channel.repoName)		
					})
				})
		})

		socket.on('fileChanges', function(payload) {
			io.to(payload.channel).emit('fileChanges', payload)
		})
    });

    return io;

};

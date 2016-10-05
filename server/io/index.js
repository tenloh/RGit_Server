'use strict';
var socketio = require('socket.io');
var io = null;
const db = require('../db')
const User = db.model('user')
const Channel = db.model('channel')

module.exports = function (server) {

    if (io) return io;

    io = socketio(server);

    io.on('connection', function (socket) {
		let loggedUser;
		socket.on('passLogin', function(loginName) {
			loggedUser = loginName
			console.log(loggedUser + ' has logged in.')
			//TOCHANGE: hit the db and get all the channels that the user is associated with
			//something like:
			return User.findOrCreate({
				where: {
					name: loginName
				},
				include: [ Channel ]
			}) 
				.then(function(loggingUser) {
					if (loggingUser.channels) {
						loggingUser.channels.forEach(channel=> {
							//TOCHANGE: need to include reponame in db, or change
							//how things are being stored client-side
							socket.join(channel.repoName)		
						})
					}
				})
		})

		socket.on('fileChanges', function(payload) {
			io.to(payload.channel).emit('fileChanges', payload)
		})

		socket.on('disconnect', function() {
			console.log(loggedUser + ' has logged out')
		})
    });

    return io;

};

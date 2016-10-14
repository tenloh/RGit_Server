'use strict';
var socketio = require('socket.io');
var io = null;
const Promise = require('bluebird');
const db = require('../db')
const User = db.model('user')
const Channel = db.model('channel')
const Branch = db.model('branch');
const Event = db.model('event');
const File = db.model('file');
const _ = require('lodash');


let clients = {}
let rooms = {}

module.exports = {
	startIo: function (server) {

		if (io) return io;

		io = socketio(server);

		io.sockets.on('connection', function (socket) {
			let loggedUser;
			socket.on('passLogin', function (loginName) {
				if (!loginName) return
				loggedUser = loginName
				clients[loginName] = socket
				console.log(loggedUser + ' has logged in.')
				return User.findOrCreate({
					where: {
						name: loginName
					},
					include: [Channel]
				})
					.then(function (loggingUser) {
						console.log('logged in user', loggingUser);
						if (loggingUser[0].channels) {
							loggingUser[0].channels.forEach(channel=> {
								let channelName = channel.repoId
								if (!rooms[channelName]) {
									rooms[channelName] = []
								}
								if (!_.includes(rooms[channelName], loginName)) { 
									rooms[channelName].push(loginName) 
								}	
								console.log('Joining a socket channel', channelName);
								socket.join(channelName)		
								socket.broadcast.to(channelName).emit('refreshOnline', {channelName, currentlyOnline: rooms[channelName]} )
							})
						}
					})
			})

			socket.on('fileChanges', function (payload) {
				const {username, event, channel, filepath} = payload;
				let currentBranch = payload.branch.current;
				//Find all the sequelize objects for current user, channel, and fileName
				let mainObjectsPromiseArray = [];
				let user, room, file, branchIndex;
				mainObjectsPromiseArray.push(User.findOne({ where: { name: username } }));
				mainObjectsPromiseArray.push(Channel.findOne({ where: { repoId: channel } }));
				mainObjectsPromiseArray.push(File.findOrCreate({where:{ fileName: filepath}}));
				Promise.all(mainObjectsPromiseArray)
					.then(objArray => {
						user = objArray[0];
						room = objArray[1];
						file = objArray[2][0];
						let promisifiedBranchCalls = [file.setChannel(room)];
						//Find or create all the branches in the user's branches
						payload.branch.all.forEach((b, i) => {
							if (payload.branch.branches[b].name === currentBranch) branchIndex = i + 1;
							promisifiedBranchCalls.push(Branch.findOrCreate({
								where: {
									branchName: payload.branch.branches[b].name,
									channelId: room.id
								}
							}))
						})
						for (let key in payload.diff) {
							promisifiedBranchCalls.push(File.findOrCreate({
								where: {
									fileName: '/' + key,
									channelId: room.id
								}
							}))
						}
						return Promise.all(promisifiedBranchCalls)
					}).then(promiseBranchArray => {
						//Loop through git diff result and store them in as well.
						let promisifiedDiffCalls = []
						for (let key in payload.diff) {
							let fileId = promiseBranchArray.slice(1).filter(file => { return file[0].fileName === '/' + key})[0][0].id
							payload.diff[key].forEach(linesArray => {
								promisifiedDiffCalls.push(Event.findOrCreate({
									where: {
										origLineStart: linesArray[0],
										origLineEnd: linesArray[1],
										localLineStart: linesArray[2],
										localLineEnd: linesArray[3],
										userId: user.id,
										eventType: 'changed',
										fileId: fileId,
										branchId: promiseBranchArray[branchIndex][0].id,
										channelId: room.id
									}
								}))
							})
						}
						if (event !== 'changed') {
							promisifiedDiffCalls.push(Event.findOrCreate({
								where: {
									userId: user.id,
									eventType: event,
									channelId: room.id,
									fileId: file.id,
									branchId: promiseBranchArray[branchIndex][0].id,
								}
							}))
						}
						return Promise.all(promisifiedDiffCalls)
					}).then(event => {
						console.log('Successfully added events');
					}).catch((err) => {
						console.error(err);
					})

				io.to(payload.channel).emit('fileChanges', payload)
			})

			socket.on('disconnect', function () {

				return User.findOrCreate({
					where: {
						name: loggedUser
					},
					include: [Channel]
				})
					.then(function (loggingUser) {
						console.log('logging out user', loggingUser);
						if (loggingUser[0].channels) {
							loggingUser[0].channels.forEach(channel=> {
								let channelName = channel.repoId
								_.remove(rooms[channelName], user => {
									return user === loggedUser
								})
								socket.leave(channelName)
								console.log('CURRENTLY ONLINE ', rooms[channelName])
								socket.broadcast.to(channelName).emit('refreshOnline', {channelName, currentlyOnline: rooms[channelName]} )
							})
						}
					})
				console.log(loggedUser + ' has logged out')
			})

			socket.on('error', function (err) {
				console.error(err);
			})
		});

		return io;
	},

	getClient: function(name) {
		console.log(`looking for ${name}, returning ${clients[name]}`)
		return clients[name]
	}

}

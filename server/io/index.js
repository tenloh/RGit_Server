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


module.exports = function (server) {

    if (io) return io;

    io = socketio(server);

    io.sockets.on('connection', function (socket) {
		let loggedUser;
		socket.on('passLogin', function (loginName) {
			loggedUser = loginName
			console.log(loggedUser + ' has logged in.')
			//TOCHANGE: hit the db and get all the channels that the user is associated with
			//something like:
			return User.findOrCreate({
				where: {
					name: loginName
				},
				include: [Channel]
			})
				.then(function (loggingUser) {
					console.log('logged in user', loggingUser);
					if (loggingUser[0].channels) {
						loggingUser[0].channels.forEach(channel => {
							//TOCHANGE: need to include reponame in db, or change
							//how things are being stored client-side
							console.log('Joining a socket channel', channel.repoId);
							socket.join(channel.repoId)
						})
					}
				})
		})

		socket.on('fileChanges', function (payload) {
			console.log('PAYLOAD', payload);
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

			console.log('Payload Object', payload);
			io.sockets.in(payload.channel).emit('fileChanges', payload)
		})

		socket.on('disconnect', function () {
			console.log(loggedUser + ' has logged out')
		})

		socket.on('error', function (err) {
			console.error(err);
		})
    });

    return io;

};


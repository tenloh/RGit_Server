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
					console.log('logged in user', loggingUser);
					if (loggingUser[0].channels) {
						loggingUser[0].channels.forEach(channel=> {
							//TOCHANGE: need to include reponame in db, or change
							//how things are being stored client-side
							console.log('Joining a socket channel', channel.repoId);
							socket.join(channel.repoId)		
						})
					}
				})
		})

		socket.on('fileChanges', function(payload) {
			console.log('PAYLOAD', payload);
			let currentUser = payload.username;
			let event = payload.event;
			let channel = payload.channel;
			let fileName = payload.filepath;
			let	currentBranch = payload.branch.current;
			//Find all the sequelize objects for current user, channel, and fileName
			let mainObjectsPromiseArray = [];
			let user, room, file;
			mainObjectsPromiseArray.push(User.findOne({where:{ name: currentUser}}));
			mainObjectsPromiseArray.push(Channel.findOne({where: {repoId: channel}}));
			mainObjectsPromiseArray.push(File.findOrCreate({where: {fileName: fileName}}));	
			Promise.all(mainObjectsPromiseArray)
			.then( (objArray) => {
				user = objArray[0];
				channel = objArray[1];
				file = objArray[2];
				let promisifiedBranchCalls = [];
				//Find or create all the branches in the user's branches
				payload.branch.all.forEach(b => {
					promisifiedBranchCalls.push(Branch.findOrCreate({
						where: { 
							branchName: payload.branch.branches[b].name,
							channelId: channel.id
						}
					}))
				})
				return Promise.all(promisifiedBranchCalls)
			}).then( promiseBranchArray => {
				if(event === 'changed'){
					//Loop through git diff result and store them in as well.
					let promisifiedDiffCalls = []
					for(let key in payload.diff){
						payload.diff[key].forEach(linesArray => {
							console.log('Key is: ' + key + ' and linesArray is: ' + linesArray);
							promisifiedDiffCalls.push(Event.findOrCreate({
								where: {
									lineStart: linesArray[0],
									lineEnd: linesArray[1],
									userId: user.id,
									eventType: event,
									fileName: channel.repoId + '/' + key,
									branchName: currentBranch,
									channelId: channel.id
								}
							}))
						})
					}
					return Promise.all(promisifiedDiffCalls)	
				} else {
					return Event.create({
						where: {
							userId: user.id,
							fileName: file.id,
							eventType: event,
							branchName: currentBranch.name,
							channelId: channel.id
						}
					})
				}
			}).then( () => {
				console.log('Success');
			}).catch( (err) => {
				console.error(err);
			})	
			

			//Send payload to relevant channel members
			let notification = {
				currentUser: currentUser,
				event: event,
				fileName: fileName,
				branchName: currentBranch
			};
			console.log('Notification Object', notification);
			// io.to(payload.channel).emit('fileChanges', notification);
			io.sockets.in(payload.channel).emit('fileChanges', notification)
			socket.broadcast.emit('fileChanges', notification)

			// //Parsing payload and storing in the database:

			// /*Branches file structure
			// 	branch: [Array of Branches]

			// 	each individual branch:
			// 		commit <-- string for commit hash
			// 		current: <--- false or true
			// 		label: <--- label for most recent commit
			// 		name: <-- branch name
			// */



		})

		socket.on('disconnect', function() {
			console.log(loggedUser + ' has logged out')
		})

		socket.on('error', function(err){
			console.error(err);
		})
    });

    return io;

};


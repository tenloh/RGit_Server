'use strict';
var socketio = require('socket.io');
var io = null;
const User = '../db/models/user.js'
const Channel = '../db/models/channel.js'
const Branch = '../db/models/branch.js'
const Promise = require('bluebird');

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
				include: [ Channel ]
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
			//Send payload to relevant channel members
			io.to(payload.channel).emit('fileChanges', payload);
			let currentUser = payload.username;
			let event = payload.event;
			let channel = payload.channel;
			//Parsing payload and storing in the database:

			/*Branches file structure
				branch: [Array of Branches]

				each individual branch:
					commit <-- string for commit hash
					current: <--- false or true
					label: <--- label for most recent commit
					name: <-- branch name
			*/
			let promisifiedBranchCalls = [];
			//Find or create all the branches in the user's branches
			payload.branch.forEach(b => {
				promisifiedBranchCalls.push(Branch.findOrCreate({
					where: { 
						branchName: b,
						channel: channel
					}
				}))
			})

			Promise.all[promisifiedBranchCalls]
			.then( (arrayOfResolvedPromises) => {
				let promisifiedAddingUserToBranch = [];
				//Each element (e) is an array, item and created or not
				arrayOfResolvedPromises.forEach(e => {
					if(e[1]) {
						promisifiedAddingUserToBranch.push(e[0].addUser(
							{
							where: {
								name: currentUser
							}
						}))
					}
				})
			})


		})
    });

    return io;

};


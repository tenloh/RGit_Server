'use strict'
/*

This seed file is only a placeholder. It should be expanded and altered
to fit the development of your application.

It uses the same file the server uses to establish
the database connection:
--- server/db/index.js

The name of the database used is set in your environment files:
--- server/env/*

This seed file has a safety check to see if you already have users
in the database. If you are developing multiple applications with the
fsg scaffolding, keep in mind that fsg always uses the same database
name in the environment files.

*/

var chalk = require('chalk');
var db = require('./server/db');
const User = db.model('user');
const Channel = db.model('channel');
const Branch = db.model('branch');
const Event = db.model('event');
const Comment = db.model('comment');
const File = db.model('file');
var Promise = require('sequelize').Promise;

var seedUsers = function () {

    var users = [
        {
            email: 'testing@fsa.com',
            password: 'password',
            name: 'Mike Davis',
            company: 'Tesla',
            github_id: '1'
        },
        {
            email: 'obama@gmail.com',
            password: 'potus',
            name: 'Obama Obama',
            company: 'Murica',
            github_id: '2'
        }
    ];

    var creatingUsers = users.map(function (userObj) {
        return User.create(userObj);
    });

    return Promise.all(creatingUsers);
};

let seedChannel = function () {

    var channels = [
        {
            repoId: '1',
            settingsForChannel: 'settingsForChannel'
        },
        {
            repoId: '2',
            settingsForChannel: 'moreSettingsForChannel'
        },
    ];
    let creatingChannels = channels.map(function (channelObj) {
        return Channel.create(channelObj);
    });
    return Promise.all(creatingChannels);
};

let seedBranch = function () {

    var branches = [
        {
            repoId: '1',
            branchName: 'miladBranch',
            dateOfLastUpdate: new Date()
        },
        {
            repoId: '2',
            branchName: 'tenBranch',
            dateOfLastUpdate: new Date()
        }

    ];

    let creatingBranches = branches.map(function (branchObj) {
        return Branch.create(branchObj);
    });

    return Promise.all(creatingBranches);
};

let seedComment = function () {

    var comments = [
        {
            fileBranchId: 'F',
            comment: "this is great!"
        },
        {
            fileBranchId: 'F',
            comment: "this is not so great!"
        }

    ];

    let creatingComment = comments.map(function (commentsObj) {
        return Comment.create(commentsObj);
    });

    return Promise.all(creatingComment);
};

let seedFile = function () {

    var files = [
        {
            fileName: 'Milad.text'
        },
        {
            fileName: 'Kin.text'
        }

    ];

    let creatingFile = files.map(function (fileObj) {
        return File.create(fileObj)
        .then(result => result.setUsers([1]));
    });

    return Promise.all(creatingFile);
};

let seedEvent = function () {

    var events = [
        {
            timeOfSave: new Date(),
            saveDetails: 'Milad',
        },
        {
            timeOfSave: new Date(),
            saveDetails: 'Not Milad',
        },
    ];

    let creatingEvent = events.map(function (eventObj) {
        return Event.create(eventObj);
    });

    return Promise.all(creatingEvent);
};

db.sync({ force: true })
    .then(function () {
        return seedUsers();
    })
    .then(function () {
        return seedChannel();
    })
    .then(function () {
        return seedBranch();
    })
    .then(function () {
        return seedComment();
    })
    .then(function () {
        return seedFile();
    })
    .then(function () {
        return seedEvent();
    })
    .then(function () {
        console.log(chalk.green('Seed successful!'));
        process.exit(0);
    })
    .catch(function (err) {
        console.error(err);
        process.exit(1);
    });

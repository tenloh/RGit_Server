'use strict';
const db = require('./_db');
module.exports = db;

// eslint-disable-next-line no-unused-vars
const User = require('./models/user');
const Channel = require('./models/channel');
const Branch = require('./models/branch');
const Event = require('./models/event');
const Comment = require('./models/comment');
const File = require('./models/file');

User.belongsToMany(Channel, {through: 'User_Channel'});
User.hasMany(Event);
User.hasMany(Comment);

Channel.belongsToMany(User, {through: 'User_Channel'});
Channel.hasMany(Branch);

Branch.hasMany(Event);
Branch.belongsTo(Channel);
Branch.hasMany(File);

File.hasMany(Event);
File.hasMany(Comment);
File.belongsTo(Branch);

Event.belongsTo(User);
Event.belongsTo(File);
Event.belongsTo(Branch);

Comment.belongsTo(User); // Each user can enter a comment
Comment.belongsTo(File);

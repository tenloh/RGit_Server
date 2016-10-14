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
// const Checkout = require('./models/checkout');

User.belongsToMany(Channel, {through: 'User_Channel'});
User.hasMany(Event);
User.hasMany(Comment);
User.belongsToMany(Branch, {through: 'User_Branch'});

Channel.belongsToMany(User, {through: 'User_Channel'});
Channel.hasMany(Branch);
Channel.hasMany(Event);

Branch.hasMany(Event);
Branch.belongsTo(Channel);
// Branch.hasMany(File);
Branch.belongsToMany(User, {through: 'User_Branch'});

File.hasMany(Event);
File.hasMany(Comment);
File.belongsTo(Channel);

File.belongsToMany(User, {through: 'User_File'})
User.belongsToMany(File, {through: 'User_File'})

Event.belongsTo(User);
Event.belongsTo(File);
Event.belongsTo(Branch);
Event.belongsTo(Channel);

Comment.belongsTo(User); // Each user can enter a comment
Comment.belongsTo(File);

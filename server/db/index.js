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

User.hasMany(Channel);
User.hasMany(Event);

Channel.hasMany(User);

Branch.hasMany(Event);

File.hasMany(Event);

Event.belongsTo(User);




'use strict'
const Sequelize = require('sequelize');

const db = require('../_db');



let Channel = db.define('channel', {
  repoId: {
    type: Sequelize.STRING,
    allowNull: false
  },
  settingsForChannel: {
    type: Sequelize.TEXT,
    // allowNull: false -- Commented out by TEN -- Let's not restrict this for now
  }
}, {
  classMethods: {
    //Remove a user from a channel
    removeUser: function(channelId, userId){
      return Channel.findById(channelId)
      .then( (channel) => {
        channel.removeUser(userId)
      })
      .then( (channel) => channel)
    }
  }
})

module.exports = Channel;

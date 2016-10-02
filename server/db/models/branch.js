'use strict'
const Sequelize = require('sequelize');

const db = require('../_db');
const User = db.define('user');
const Channel = db.define('channel');

let Branch = db.define('branch', {
  repoId: {
    type: Sequelize.STRING
  },
  branchName: {
    type: Sequelize.STRING
  },
  dateOfLastUpdate: {
    type: Sequelize.DATE
  },
  local: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  }
}, {
  classMethods: {
    //Find all channels and the related branches for a given user
    findAllForUser: function(userId){
      return User.getChannels({
        where: {
          userId: userId
        },
        include: [Branch]
      })
      .then( channels =>  channels ) 
    },
    setRemote: function(branchId){
      return User.update({
        local: false
        }, { 
          where: {
            id: branchId
          }
        })
        .then( rowsUpdated => rowsUpdated)
    }
  }
})

module.exports = Branch;

'use strict'
const Sequelize = require('sequelize');

const db = require('../_db');
const User = db.model('user');

let Branch = db.define('branch', {
  repoId: {
    type: Sequelize.STRING
  },
  branchName: {
    type: Sequelize.STRING
  },
  local: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  }
}, {
  classMethods: {
    //Find all channels and the related branches for a given user
    findAllForUser: function(userId){
      return User.findById(userId)
      .then( user => {
        return user.getChannels({
          include: [Branch]
        })
      })
      .then( channels =>  {
        return channels 
      })
    },
    setRemote: function(branchId){
      //Set a branch from local to remote
      return Branch.update({
        local: false
        }, {
          where: {
            id: branchId,
            local: true
          }
        })
        .then( rowsUpdated => rowsUpdated)
    }
  }
})

module.exports = Branch;

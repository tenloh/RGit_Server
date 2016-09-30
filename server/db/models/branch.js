'use strict'
const Sequelize = require('sequelize');

const db = require('../_db');

module.exports = db.define('branch', {
  repoId: {
    type: Sequelize.STRING
  },
  branchName: {
    type: Sequelize.STRING
  },
  dateOfLastUpdate: {
    type: Sequelize.DATE
  }
})

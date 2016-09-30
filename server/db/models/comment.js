'use strict'
const Sequelize = require('sequelize');

const db = require('../_db');

module.exports = db.define('comment', {
  fileBranchId: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  comment: {
    type: Sequelize.TEXT,
    allowNull: false
  }
})

'use strict'
const Sequelize = require('sequelize');

const db = require('../_db');

module.exports = db.define('event', {
  lineStart: {
    type: Sequelize.INTEGER,
  },
  lineEnd: {
    type: Sequelize.INTEGER,
  },
  eventType: {
    type: Sequelize.STRING,
  },
  branchName: {
    type: Sequelize.STRING,
  },
  fileName: {
    type: Sequelize.STRING,
  }
})

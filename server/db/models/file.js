'use strict'
const Sequelize = require('sequelize');

const db = require('../_db');

module.exports = db.define('file', {
  fileName: {
    type: Sequelize.STRING,
    allowNull: false
  }
})

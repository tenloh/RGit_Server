'use strict'
const Sequelize = require('sequelize');

const db = require('../_db');

module.exports = db.define('event', {
  timeOfSave: {
    type: Sequelize.DATE,
    allowNull: false
  },
  saveDetails: {
    type: Sequelize.JSON,
    allowNull: false
  }
})

'use strict'
const Sequelize = require('sequelize');

const db = require('../_db');

module.exports = db.define('channel', {
  repoId: {
    type: Sequelize.STRING,
    allowNull: false
  },
  settingsForChannel: {
    type: Sequelize.TEXT,
    allowNull: false
  }
})

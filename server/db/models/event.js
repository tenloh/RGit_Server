'use strict'
const Sequelize = require('sequelize');

const db = require('../_db');

module.exports = db.define('event', {
  origLineStart: {
    type: Sequelize.INTEGER,
  },
  origLineEnd: {
    type: Sequelize.INTEGER,
  },
  localLineStart: {
    type: Sequelize.INTEGER,
  },
  localLineEnd: {
    type: Sequelize.INTEGER,
  },
  eventType: {
    type: Sequelize.STRING,
  },
})

'use strict'
const Sequelize = require('sequelize');

const db = require('../_db');
const User = require('./user')

module.exports = db.define('file', {
    fileName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    repoId: {
      type: Sequelize.INTEGER
    }
}, {
    defaultScope: {
        include: [
            { model: User }
        ]
    }
})

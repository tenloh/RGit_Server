'use strict'
const Sequelize = require('sequelize');

const db = require('../_db');

module.exports = db.define('chat', {
	message: {
		type: Sequelize.STRING
	}
})

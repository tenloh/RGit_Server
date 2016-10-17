'use strict'
// import request from 'request'
// import githubTokenUser from 'github-token-user'
// import rp from 'request-promise'
const request = require('request');
const githubTokenUser = require('github-token-user')
const rp = require('request-promise');
const router = require('express').Router()
const User = require('../../../db/models/user.js')

const githubConfig = {
	clientId: '02c613b6855930709237',
	clientSecret: '663458b2eaf244d8c03a990ecf9d694101db3250',
	callbackURL: 'http://127.0.0.1:1337/auth/github/callback'
}

module.exports = router

router.post('/github', ( req, res, next ) => {
	console.log('got request')
	let token, username
	console.log(req.body)
	let options = {
		method: 'post',
		body: {
			client_secret: githubConfig.clientSecret,
			client_id: githubConfig.clientId,
			code: req.body.code
		},
		json: true,
		url: 'https://github.com/login/oauth/access_token'
	}

	return rp(options)
		.then(response => {
			token = response.access_token

			return githubTokenUser(token)
		})
		.then(user => {
			if (!user) throw new Error()
			username = user.login
			return User.findOrCreate({
				where: {
					name: username
				}
			})
		})
		.then(createdUser => {
			let parsedUser = JSON.parse(JSON.stringify(createdUser))
			let id = parsedUser[0].id
			let responseObj = { username, token, id }

			res.send(responseObj)
		})
		.catch(err => {
			console.error(err)
			res.status(500).send(err)
		})
})

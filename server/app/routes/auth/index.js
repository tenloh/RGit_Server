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
	clientId: 'afd403668b69ee8101fc',
	clientSecret: '5aaff4f4b4b85ab137e03d8add60a9561575f56f',
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
			username = user.login
			//TOCHANGE: have this eager-load other stuff: channels, files, etc
			//TOCHANGE: also have it correctly create once db works
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

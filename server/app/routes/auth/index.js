'use strict'
import http from 'http-request'
const router = require('express').Router()

const githubConfig = {
	clientId: 'afd403668b69ee8101fc',
	clientSecret: '5aaff4f4b4b85ab137e03d8add60a9561575f56f',
	callbackURL: 'http://127.0.0.1:1337/auth/github/callback'
}

module.exports = router

router.post('/github', ( req, res, next ) => {
	let postObject = {
		client_id: githubConfig.clientId,
		clientSecret: githubConfig.clientSecret,
		code: req.body.code
	}

	return http.post('https://github.com/login/oauth/access_token', postObject)
		.end( ( err, response ) => {
			if (response && response.ok) {
				res.send(response)
			} else {
				res.send(404)
			}
		})

})

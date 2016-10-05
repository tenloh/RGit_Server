'use strict';
var router = require('express').Router();
// eslint-disable-line new-cap
module.exports = router;

router.use('/users', require('./users'));
router.use('/channels', require('./channels'));
router.use('/branches', require('./branches'));
router.use('/comments', require('./comments'));
router.use('/files', require('./files'));
router.use('/events', require('./events'));
router.use('/auth', require('./auth'));

// Make sure this is after all of
// the registered routes!
router.use(function (req, res) {
    res.status(404).end();
});

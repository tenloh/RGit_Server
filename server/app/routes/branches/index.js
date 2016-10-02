'use strict';
var router = require('express').Router();
var db = require('../../../db');
const Branch = db.model('branch');
const Channel = db.model('channel');
const User = db.model('user');
//eslint-disable-line new-cap
module.exports = router;


var ensureAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).end();
    }
};

//Find all branches - eager loaded with which channels they are associated with
router.get('/', function (req, res, next) {
    Branch.findAll({
        include: [Channel]
    })
    .then( branches => res.json(branches) )
    .catch(next)
});

//Find all branches associated with an user
router.get('/user/:id', function(req, res, next){
    Branch.findAllForUser(req.params.id)
    .then( channelsBranches => res.json(channelsBranches) )
    .catch(next)
})


//Find all branches associated with a given channel (repo) 
router.get('/:channelId', function(req, res, next){
    Branch.findAll({
        where:{
            channelId: req.params.channelId
        }
    })
    .then( branches => res.json(branches) )
    .catch(next)
})

//Create a new branch for a channel
router.post('/:channelId', function(req, res, next){
    Branch.create({
        repoId: req.body.branch.id,
        branchName: req.body.branch.name,
        local: false,
        channelId: req.params.channelId
    })
    .then( branch => res.json(branch) )
    .catch(next)
})

//Delete a branch
router.delete('/:branchId', function(req, res, next){
    Branch.destroy({
        where:{
            id: req.params.branchId
        }
    })
    .then( () => res.sendStatus(204))
    .catch(next)
});

//Update a branch to remote
//Query params expected branchId
router.put('/setremote', function(req, res, next){
    Branch.setRemote(req.query.branchId)
    .then( branch => res.json(branch))
    .catch(next)
})



var express = require('express');
var router = express.Router();
const mongodb = require('../src/mongo.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/insertSpells', function(req, res, next) {
    mongodb.insertSpells().then(() => {
        res.render('index', {title: 'Compétences ajoutées'});
    });
});

router.get('/insertArmors', function(req, res, next) {
    mongodb.insertArmors().then(() => {
        res.render('index', {title: 'Armures ajoutées'});
    });
});

router.get('/insertWeapons', function(req, res, next) {
    mongodb.insertWeapons().then(() => {
        res.render('index', {title: 'Armes ajoutées'});
    });
});

router.get('/test', function(req, res, next) {
    res.render('test');
});

router.get('/api/spells', function(req, res, next) {
    mongodb.getSpells().then((json) => {
        res.json(json);
    });
});

router.get('/api/armors', function(req, res, next) {
    mongodb.getArmors().then((json) => {
        res.json(json);
    });
});

router.get('/api/weapons', function(req, res, next) {
    mongodb.getWeapons().then((json) => {
        res.json(json);
    });
});

module.exports = router;

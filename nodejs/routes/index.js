var express = require('express');
var router = express.Router();
const mongodb = require('../src/mongo.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/insert', function(req, res, next) {
    mongodb.insertAll().then(() => {
        res.send('OK');
    })
});

router.get('/spells', function(req, res, next) {
    res.render('spells');
});

router.get('/armors', function(req, res, next) {
    res.render('armors');
});

router.get('/weapons', function(req, res, next) {
    res.render('weapons');
});

router.get('/api/spells', function(req, res, next) {
    mongodb.getSpells().then((json) => {
        res.json(json);
    });
});

router.get('/api/classes', function(req, res, next) {
    mongodb.getClasses().then((json) => {
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

var express = require('express');
var router = express.Router();
const mongodb = require('../src/mongo.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/insertSpells', function(req, res, next) {
    mongodb.insertSpells().then(() => {
        res.render('index', {title: 'Données ajoutées'});
    });
});

router.get('/classes', function(req, res, next) {
    mongodb.getClasses().then((classes) => {
        res.json(classes);
    })
})

router.get('/test', function(req, res, next) {
    res.render('test');
});

router.get('/api/test', function(req, res, next) {
    res.json(require('../data/spell.json'));
});

router.get('/base', function(req, res, next) {
    res.json(require('../../flare.json'));
});

router.get('/passives', function(req, res, next) {
    mongodb.getAllPassives().then((passives) => {
        res.json(passives);
    });
});

router.get('/passives/:className', function(req, res, next) {
    mongodb.getClassPassives(req.params.className).then((passives) => {
        res.json(passives);
    });
});

router.get('/actives', function(req, res, next) {
    mongodb.getAllActives().then((actives) => {
        res.json(actives);
    });
});

router.get('/actives/:className', function(req, res, next) {
    mongodb.getClassActives(req.params.className).then((actives) => {
        res.json(actives);
    });
});

router.get('/actives/:className/:category', function(req, res, next) {
    mongodb.getClassCategoryActives(req.params.className, req.params.category).then((categories) => {
        res.json(categories);
    });
});

router.get('/spells', function(req, res, next) {
    mongodb.getSpells().then((json) => {
        res.json(json);
    });
})

module.exports = router;

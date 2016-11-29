const mongodb = require('mongodb');
const config = require('./config/mongo.json');

let url = 'mongodb://localhost:27017/diablo3';
let MongoClient = mongodb.MongoClient;

let classes = ['Barbare', 'Chasseuse de démons', 'Croisé', 'Moine', 'Sorcière', 'Féticheur'];

const obj = {
    init() {
        return new Promise((resolve, reject) => {
            MongoClient.connect(url, (err, db) => {
                if (err) {
                    reject(err);
                }
                this.instance = db;
                resolve(db);
            });
        });
    },
    insertSpells() {
        return new Promise((resolve, reject) => {
            const collection = this.instance.collection('spells');
            const spells = require('../data/spell.json');
            collection.insert(spells, (err, records) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    },
    getClasses() {
        return new Promise((resolve, reject) => {
            const collection = this.instance.collection('spells');
            collection.distinct('class_name', ((err, classes) => {
                if (err) {
                    reject(err);
                }
                resolve(classes);
            }));
        });
    },
    getClassPassives(className) {
        return new Promise((resolve, reject) => {
            const collection = this.instance.collection('spells');
            collection
                .find({spell: "passive", class_name: className})
                .toArray((err, passives) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(passives);
                });
        });
    },
    getAllPassives() {
        return new Promise((resolve, reject) => {
            let json = {
                'name': 'classes',
                'children': []
            };
            let total = 0;
            this.getClasses().then((classes) => {
                classes.forEach((className) => {
                    total++;
                    this.getClassPassives(className).then((data) => {
                        json.children.push({
                            'name': className,
                            'children': data
                        });
                        if (--total === 0) {
                            resolve(json);
                        }
                    });
                });
            });
        });
    },
    getClassActives(className) {
        return new Promise((resolve, reject) => {
            let json = [];
            let total = 0;
            this.getClassActiveCategories(className).then((categories) => {
                categories.forEach((category) => {
                    total++;
                    this.getClassCategoryActives(className, category).then((data) => {
                        json.push({
                            'name': category,
                            'children': data,
                            'treeLevel': 4
                        });
                        if (--total === 0) {
                            resolve(json);
                        }
                    });
                });
            });
        });
    },
    getClassActiveCategories(className) {
        return new Promise((resolve, reject) => {
            const collection = this.instance.collection('spells');
            collection.distinct('category', {class_name: className}, (err, categories) => {
                if (err) {
                    reject(err);
                }
                resolve(categories);
            });
        });
    },
    getClassCategoryActives(className, category) {
        return new Promise((resolve, reject) => {
            const collection = this.instance.collection('spells');
            collection
                .find({'spell': 'active', 'class_name': className, 'category': category})
                .toArray((err, actives) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(actives);
                });
        });
    },
    getAllActives() {
        return new Promise((resolve, reject) => {
            let json = {
                'name': 'classes',
                'children': []
            };
            let total = 0;
            this.getClasses().then((classes) => {
                classes.forEach((className) => {
                    total++;
                    this.getClassActives(className).then((data) => {
                        json.children.push({
                            'name': className,
                            'children': data
                        });
                        if (--total === 0) {
                            resolve(json);
                        }
                    });
                });
            });
        });
    },
    getSpells() {
        return new Promise((resolve, reject) => {
            let json = {
                'name': 'classes',
                'children': [],
                'treeLevel': 1
            };
            let total = 0;
            this.getClasses().then((classes) => {
                classes.forEach((className) => {
                    let currentClass = {
                        'name': className,
                        'children': [],
                        'treeLevel': 2
                    };
                    json.children.push(currentClass);
                    total++;
                    this.getClassPassives(className).then((passives) => {
                        currentClass.children.push({
                            'name': 'Compétences passives',
                            'children': passives,
                            'treeLevel': 3
                        });
                        return this.getClassActives(className);
                    }).then((actives) => {
                        currentClass.children.push({
                            'name': 'Compétences actives',
                            'children': actives,
                            'treeLevel': 3
                        });
                        if (--total === 0) {
                            resolve(json);
                        }
                    });
                });
            });
        })
    }
}

module.exports = obj;

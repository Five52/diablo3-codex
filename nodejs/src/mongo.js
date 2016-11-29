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

    // Spells

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
    },

    // Armors

    insertArmors() {
        return new Promise((resolve, reject) => {
            const collection = this.instance.collection('armors');
            const armors = require('../data/armor.json');
            collection.insert(armors, (err, records) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    },
    getArmorTypes() {
        return new Promise((resolve, reject) => {
            const collection = this.instance.collection('armors');
            collection.distinct('type', ((err, types) => {
                if (err) {
                    reject(err);
                }
                resolve(types);
            }));
        });
    },
    getArmorQualities() {
        return new Promise((resolve, reject) => {
            const collection = this.instance.collection('armors');
            collection.distinct('quality', ((err, qualities) => {
                if (err) {
                    reject(err);
                }
                resolve(qualities);
            }));
        });
    },
    getTypeQualityArmors(type, quality) {
        return new Promise((resolve, reject) => {
            const collection = this.instance.collection('armors');
            collection
                .find({type: type, quality: quality})
                .toArray((err, armors) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(armors);
                });
        });
    },
    getTypeArmors(type) {
        return new Promise((resolve, reject) => {
            let json = [];
            let total = 0;
            this.getArmorQualities().then((qualities) => {
                qualities.forEach((quality) => {
                    total++;
                    this.getTypeQualityArmors(type, quality).then((armors) => {
                        if (armors.length !== 0) {
                            json.push({
                                'name': quality,
                                'children': armors,
                                'treeLevel': 3
                            });
                        }
                        if (--total === 0) {
                            resolve(json);
                        }
                    });
                });
            });
        })
    },
    getArmors() {
        return new Promise((resolve, reject) => {
            let json = {
                'name': 'types',
                'children': [],
                'treeLevel': 1
            };
            let total = 0;
            this.getArmorTypes().then((types) => {
                types.forEach((type) => {
                total++;
                    this.getTypeArmors(type).then((armors) => {
                        json.children.push({
                            'name' : type,
                            'children' : armors,
                            'treeLevel': 2
                        });
                        if (--total === 0) {
                            resolve(json);
                        }
                    });
                });
            });
        })
    },

    // Weapons

    insertWeapons() {
        return new Promise((resolve, reject) => {
            const collection = this.instance.collection('weapons');
            const weapons = require('../data/weapon.json');
            collection.insert(weapons, (err, records) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    },
    getWeaponTypes() {
        return new Promise((resolve, reject) => {
            const collection = this.instance.collection('weapons');
            collection.distinct('type', ((err, types) => {
                if (err) {
                    reject(err);
                }
                resolve(types);
            }));
        });
    },
    getWeaponQualities() {
        return new Promise((resolve, reject) => {
            const collection = this.instance.collection('weapons');
            collection.distinct('quality', ((err, qualities) => {
                if (err) {
                    reject(err);
                }
                resolve(qualities);
            }));
        });
    },
    getTypeQualityWeapons(type, quality) {
        return new Promise((resolve, reject) => {
            const collection = this.instance.collection('weapons');
            collection
                .find({type: type, quality: quality})
                .toArray((err, weapons) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(weapons);
                });
        });
    },
    getTypeWeapons(type) {
        return new Promise((resolve, reject) => {
            let json = [];
            let total = 0;
            this.getWeaponQualities().then((qualities) => {
                qualities.forEach((quality) => {
                    total++;
                    this.getTypeQualityWeapons(type, quality).then((weapons) => {
                        if (weapons.length !== 0) {
                            json.push({
                                'name': quality,
                                'children': weapons,
                                'treeLevel': 3
                            });
                        }
                        if (--total === 0) {
                            resolve(json);
                        }
                    });
                });
            });
        })
    },
    getWeapons() {
        return new Promise((resolve, reject) => {
            let json = {
                'name': 'types',
                'children': [],
                'treeLevel': 1
            };
            let total = 0;
            this.getWeaponTypes().then((types) => {
                types.forEach((type) => {
                total++;
                    this.getTypeWeapons(type).then((weapons) => {
                        json.children.push({
                            'name' : type,
                            'children' : weapons,
                            'treeLevel': 2
                        });
                        if (--total === 0) {
                            resolve(json);
                        }
                    });
                });
            });
        })
    },
}

module.exports = obj;

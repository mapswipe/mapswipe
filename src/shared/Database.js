/**
 * @author Pim de Witte (pimdewitte.me/pimdewitte95@gmail.com). Copyright MSF UK 2016.
 *
 * Database is the main class for communicating with firebase and AsyncStorage.
 */

// import React from "react";
// import { Platform } from "react-native";
import firebase from "firebase";

var ConnectionManager = require('./ConnectionManager');
var AuthManager = require('./AuthManager');


var RNFS = require('react-native-fs');

const config = require("../../config.json");

console.log(RNFS.DocumentDirectoryPath);
firebase.initializeApp(config.firebaseConfig);

/*var PushNotification = require('react-native-push-notification');
PushNotification.configure({

    // (optional) Called when Token is generated (iOS and Android)
    onRegister: function (token) {
        console.log('TOKEN:', token);
    },

    // (required) Called when a remote or local notification is opened or received
    onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
    },

    // ANDROID ONLY: (optional) GCM Sender ID.
    senderID: config.senderID,

    // IOS ONLY (optional): default: all - Permissions to register.
    permissions: {
        alert: true,
        badge: true,
        sound: true
    },

    // Should the initial notification be popped automatically
    // default: true
    popInitialNotification: false,

    /**
     * IOS ONLY: (optional) default: true
     * - Specified if permissions will requested or not,
     * - if not, you must call PushNotificationsHandler.requestPermissions() later
     *
    requestPermissions: true,
});*/


var levels = {
    1: {
        badge: require('./views/badges/1.png'),
        title: "Square One",
        description: "You're off to a great start! As soon as you finish this tutorial, you'll be able to join real projects and start making a difference.",
        expRequired: 1
    },
    2: {
        badge: require('./views/badges/2.png'),
        title: "Welcome to the team!",
        description: "You can now call yourself a mapper. Be proud! As you move forward, your work will impact the lives of actual people. Isn't that great?",
        expRequired: 3
    },
    3: {
        badge: require('./views/badges/3.png'),
        title: "Tilting the Scale",
        description: "With every image you classify, you help weight the odds in favor of vulnerable communities.",
        expRequired: 10
    },
    4: {
        badge: require('./views/badges/4.png'),
        title: "Another Rung on the Latitude",
        description: "Hand over hand, foot over foot, and, uh, finger over finger, pace yourself and keep up the good work!",
        expRequired: 50
    },
    5: {
        badge: require('./views/badges/5.png'),
        title: "Off the Charts",
        description: "It's a great big world out there. Stick with your team and chart the uncharted!",
        expRequired: 100
    },
    6: {
        badge: require('./views/badges/6.png'),
        title: "Making the Grade",
        description: "Everytime the app pings the server, a mapper gets their wings. Okay, okay, not every time, but this time one did and it's you! Keep playing for more opportunities to impact lives, as well as shinier badges and nerdier map puns.",
        expRequired: 250
    },
    7: {
        badge: require('./views/badges/7.png'),
        title: "Getting the GISt of It",
        description: "It's the gist, and you got it!",
        expRequired: 400
    },
    8: {
        badge: require('./views/badges/8.png'),
        title: "Bearing Forward",
        description: "Always forward, never back! Just keep swiping, you've a knack!",
        expRequired: 550
    },
    9: {
        badge: require('./views/badges/9.png'),
        title: "A Coordinated Effort",
        description: "Thousands of little taps by users like you add up to pinpoint people in need. Thanks for making an effort!",
        expRequired: 800
    },
    10: {
        badge: require('./views/badges/10.png'),
        title: "The Best Laid Planimetrics",
        description: "Plans often go awry, but it's less likely with an accurate planimetric map!",
        expRequired: 1100
    },
    11: {
        badge: require('./views/badges/11.png'),
        title: "With Sincere Graticule",
        description: "In the words of Aesop, 'Graticule is a line from global poles.'",
        expRequired: 1500
    },
    12: {
        badge: require('./views/badges/12.png'),
        title: "To the Highest Degree",
        description: "Hmm... that's actually the North Pole, and there aren't many people to map up there! Nevertheless, we appreciate your enthusiasm - to the highest degree.",
        expRequired: 2000
    },
    13: {
        badge: require('./views/badges/13.png'),
        title: "A Geodesy of Discovery",
        description: "You are Geodesseus and your adventure is truly epic. You're battling the dragons that live off the edge of the map!",
        expRequired: 2300
    },
    14: {
        badge: require('./views/badges/14.png'),
        title: "Good Homolosine, Homeslice!",
        description: "Way to go, Waterman! Let's take it to the Dymaxion. You're really putting your Ekhert into this.",
        expRequired: 3000
    },
    15: {
        badge: require('./views/badges/15.png'),
        title: "Gotta Catch 'Emollweide",
        description: "My eyes will travel across the land... searching far and wiiiiide... each image tile, to understand... the feature that's inside! MAPSWIPE!",
        expRequired: 4100
    },
    16: {
        badge: require('./views/badges/16.png'),
        title: "Mercators Gonna Mercate",
        description: "It's the most popular projection in school, but don't let that distort your perception. If you need to compare areas areas far from the equator, you'd better keep on walking.",
        expRequired: 5600
    },
    17: {
        badge: require('./views/badges/17.png'),
        title: "Quick as a Winkel",
        description: "A tripel threat that can't sing, dance, or act? Luckily, you don't need to maintain a classy image to classify one quickly!",
        expRequired: 7400
    },
    18: {
        badge: require('./views/badges/18.png'),
        title: "Tissot's Bag of Tricks",
        description: "+5 Health, +15 Coordination, +10 Intelligence, -10 Charisma",
        expRequired: 9200
    },
    19: {
        badge: require('./views/badges/19.png'),
        title: "In Hannu Light",
        description: "Sometimes you just have to Punt your work. With MapSwipe, you can procrastinate productively.",
        expRequired: 9700
    },
    20: {
        badge: require('./views/badges/20.png'),
        title: "It's All Well and Gudrid",
        description: "Thanks for your dedicated use. Mappers like you keep MapSwipe from whithering on the Vineland.",
        expRequired: 10600
    },
    21: {
        badge: require('./views/badges/21.png'),
        title: "Building Manco Capacity",
        description: "MapSwipe users don't make ex-Cuscos, they make results!",
        expRequired: 12000
    },
    22: {
        badge: require('./views/badges/22.png'),
        title: "A Bright Xu Fu-ture",
        description: "It's no Penglai, you're making a difference pixel by pixelixer!",
        expRequired: 13800
    },
    23: {
        badge: require('./views/badges/23.png'),
        title: "Footloose and Bungaree",
        description: "I like to think I write koalaty puns, but I'm having some trouble making one out of Australia.",
        expRequired: 16000
    },
    24: {
        badge: require('./views/badges/24.png'),
        title: "Stick to Jemison",
        description: "Judging by how many tiles you've tapped now, you Mae really Carol about Jemison. Thanks for making space in your day to help out!",
        expRequired: 18500
    },
    25: {
        badge: require('./views/badges/25.png'),
        title: "No Man is a Null Island",
        description: "No woman either, for that matter. Be involved in mankind!",
        expRequired: 19250
    },
    26: {
        badge: require('./views/badges/26.png'),
        title: "Just Tagging Along",
        description: "The more the merrier, we say! Let's tag everything! k=you, and v=very generous with your time, thanks!",
        expRequired: 21000
    },
    27: {
        badge: require('./views/badges/27.png'),
        title: "Plate Carreer Advancement",
        description: "Everyone starts at the Bottomly of the corporate ladder. The Keyes is to choose a job you [Werner], and you'll never work a day in your life.",
        expRequired: 23200
    },
    28: {
        badge: require('./views/badges/28.png'),
        title: "Kicking Over the Traces",
        description: "Open source projects may buck tradition, and some can stirrup a lot of emotion, but don't let neigh-saying rein you in. You're whinnying in my book!",
        expRequired: 26300
    },
    29: {
        badge: require('./views/badges/29.png'),
        title: "Totally JOSM",
        description: "People say kids these days overuse JOSM. If everything is JOSM, they say, then nothing is JOSM. But we're going to say it anyway! We think you're totally JOSM!",
        expRequired: 30300
    },
    30: {
        badge: require('./views/badges/30.png'),
        title: "Late Night Double Feature",
        description: "Doctor X will map a feature, as will Brad and Janet. I believe Anne Francis will be attending the mapathon as well. I wanna go! Do you?",
        expRequired: 34250
    },
    31: {
        badge: require('./views/badges/31.png'),
        title: "The Lay of the Landsat",
        description: "You've laid your eyes on a lot of land and it's fair to say you are *quite* the expert in staring at the ground now!",
        expRequired: 35000
    },
    32: {
        badge: require('./views/badges/32.png'),
        title: "Flying above the Radar",
        description: "Like a falcon on the wing, or a lost helium balloon, you're cruising along and no one can bring you down now. Keep soaring!",
        expRequired: 37000
    },
    33: {
        badge: require('./views/badges/33.png'),
        title: "A MetOp with Destiny",
        description: "Was it something cosmic that brought you to MapSwipe? Were you chosen by fate to lend your hands to people in need? Those questions are completely beyond the scope of this app! However you got here, we're just glad you did.",
        expRequired: 39800
    },
    34: {
        badge: require('./views/badges/34.png'),
        title: "Reach for the Navstars",
        description: "You have checked an astronomical number of tiles. Congratulations on this stellar accomplishment!",
        expRequired: 43500
    },
    35: {
        badge: require('./views/badges/35.png'),
        title: "LEO, King of the Jungle",
        description: "The lion is the king of the jungle, and you are the king of this hill of badges. Really, it's more of a mountain now. You are so close to the top, don't stop!",
        expRequired: 48000
    },
    36: {
        badge: require('./views/badges/36.png'),
        title: "SSO... ISS this it?",
        description: "You've reached the end of the first batch of badges, and you've made a truly impressive contribution to this project. We are so grateful! But the answer is... no! There's more to map, and we'd love your help.",
        expRequired: 52700
    }
}

var database = firebase.database();


const INTERVALS = {}


const projectsRef = database.ref("projects");
const groupsRef = database.ref("groups");
const resultsRef = database.ref("results");
var myUserRef;
const announcementRef = database.ref("announcement");

var store = require('react-native-simple-store');
var con = new ConnectionManager();
var auth = new AuthManager(firebase);

auth.addListeners();


module.exports = {

    /**
     * Variable to access internal functions through promises.
     */

    dbParent: this,

    /**
     * Stores all the tasks that still need pushing to the database
     */

    taskResults: [],
    groupCompletes: [],

    /**
     * Returns the connection manager
     * @returns {ConnectionManager|exports|module.exports}
     */
    getConnectionManager() {
        return con;
    },
    /**
     * Returns the auth manager
     * @returns {AuthManager|exports|module.exports}
     */
    getAuth() {
        return auth;
    },


    /**
     * Syncs all the objects in memory with the remote database and returns any unreported objects for later re-sync
     * @returns {Promise}
     *
     * Reject triggers an error popup, resolve triggers a success
     */
    syncAndDeIndex: function () {

        var parent = this;

        return new Promise(function (resolve, reject) {

            // syncAndStatus always attempts to report ALL objects. Therefore, we only have to listen for the errors to re-pupulate the stores.
            parent.syncAndStatus().then(results => {

                console.log("i can haz results");

                var errorCount = results.task.error.length;
                var successCount = results.task.success.length;

                parent.updateContributions(successCount);
                store
                    .save('taskResults', {
                        // initialize the
                        tasks: results.task.error
                    }).then(status => {
                    store
                        .save('groupCompletes', {
                            // initialize the
                            groups: results.group.error
                        }).then(status => {
                        if (errorCount > successCount) {
                            // more errors than successes... nope
                            reject({
                                errorCount: errorCount,
                                successCount: successCount
                            });
                        } else {
                            resolve({
                                errorCount: errorCount,
                                successCount: successCount
                            });
                        }
                    })
                })

            });
        });

    },

    /**
     * Syncs and returns the status to syncAndDeIndex
     * @returns {Promise}
     */

    syncAndStatus: function () {

        return new Promise(function (resolve, reject) {

            var completeCount = 0;

            var resolveTypes = {
                task: {
                    success: [],
                    error: []
                },
                group: {
                    success: [],
                    error: []
                }
            }

            /**
             * Resolver function that resolves when all async actions have reported back their result (either success or error). The response will be resolved.
             * @param status
             * @param obj
             */
            var checkResolve = function (status, type, obj) {
                resolveTypes[type][status].push(obj);
                completeCount--;

                console.log("count: " + completeCount);

                if (completeCount == 0) {
                    console.log("All data points reported. Resolving promise");
                    resolve(resolveTypes);
                }
            }

            if (con.isOnline()) {

                // get the current task results in memory that have not been synced yet
                store.get('taskResults').then(result => {
                    if (result !== null) {
                        for (var i = 0; i < result.tasks.length; i++) {


                            var task = result.tasks[i];
                            if (task.device !== undefined) {
                                console.log("Attempting to sync task " + task.id);
                                var taskRef = database.ref("results/" + task.id);

                                // increase the amount of actions that need to happen for completion
                                completeCount++;
                                (function (task) { // capturing the group in a closure so that the callbacks use the right task variable
                                    taskRef.child(auth.getUser().uid).set({
                                        data: task
                                    }).then(function (data) {
                                        checkResolve('success', 'task', task);
                                    }).catch(data => {
                                        checkResolve('error', 'task', task);
                                    });
                                })(task);
                            }
                        }
                    }
                });

                // sync the group complete count with firebase (The completed count is used to sort groups so that they can always be returned properly)
                store.get('groupCompletes').then(result => {
                    if (result !== null) {
                        console.log("completes:");

                        for (var i = 0; i < result.groups.length; i++) {
                            var group = result.groups[i];
                            if (group.groupId !== undefined) {
                                completeCount += 1; // need 2 callbacks form groups, 1 for local sync, 1 for remote
                                console.log("Attempting to sync group " + group.groupId + " in project" + group.projectId);
                                var groupRef = groupsRef.child(group.projectId + "").child(group.groupId);

                                (function (group) { // capturing the group in a closure
                                    groupRef.transaction(function (group) {
                                        if (group) {
                                            group.completedCount = group.completedCount + 1;
                                        }
                                        return group;
                                    }).then(function (data) {
                                        return checkResolve('success', 'group', group);
                                    }).catch(function (error) {
                                        checkResolve('error', 'group', group);
                                    });
                                })(group);

                            }
                        }
                    }

                });

            } else {
                console.log("We're offline, not reporting rn");
                resolve(resolveTypes);
            }
        });
    },

    tasksReady: {},

    taskLoop: null,

    /**
     * Delete a task to process from memory
     * @param id
     */

    deleteTask: function (id) {
        console.log("deleting" + id);
        delete this.tasksReady[id];
    },

    /**
     * Adds a task (aka tile) that is ready for processing to the queue.
     * Also, if new tasks are added while others are being processed, this is handled with the fact that it only removes objects from the array that were reported.
     * @param task
     */
    taskReadyForProcessing: function (task) {
        var parent = this;
        if (this.taskLoop === null) {
            this.taskLoop = setInterval(function () {
                console.log("processing tasks...");
                //console.log(parent.tasksReady);
                parent.processTasks(Object.keys(parent.tasksReady)).then(data => {
                    console.log("Processed tasks")
                    console.log(data);
                    data.forEach(function (task) {
                        delete parent.deleteTask(task);
                    });
                }).catch(error => {
                    console.log("Task wasn't set ready for processing! Big alert!");
                })
            }, 5000);
        }
        this.tasksReady[task.id] = task;
    },

    /**
     * Adds a task result that needs to be sent to firebase when a network is available
     * @returns {Promise}
     *
     * Example task object: {id:"18-122222x-1222y", result: 1, device: deviceId}
     *
     */
    processTasks: function (tasks) {
        var parent = this;
        var tasksToProcess = tasks;
        var taskArray = [];
        tasksToProcess.forEach(function (task) {
            taskArray.push(parent.tasksReady[task]);
        });
        return new Promise(function (resolve, reject) {

            if (parent.taskQueryBusy === true) {
                reject();
                return;
            }
            parent.taskQueryBusy = true;

            store.get('taskResults').then(result => {
                if (result !== null && result !== undefined) {
                    taskArray.forEach(function (task) {
                        // check if it already contains a task with the current id
                        // if so, overwrite that task
                        //otherwise, push a new task

                        if (task.result === 0) {
                            // find the
                        }

                        var taskFound = false;
                        var toDelete = -1;
                        for (var i = 0; i < result.tasks.length; i++) {
                            if (result.tasks[i].id === task.id) {
                                if (task.result === 0) {
                                    toDelete = i;
                                }
                                console.log(task);
                                result.tasks[i] = task;
                                taskFound = true;
                            }
                        }

                        if (toDelete !== -1) {
                            result.tasks.splice(toDelete, 1);
                        }
                        if (taskFound === false) {
                            console.log("pushing task to cache:" + task.id);
                            result.tasks.push(task);
                        }
                    });

                    store
                        .save('taskResults', {
                            // initialize the
                            tasks: result.tasks
                        }).then(status => {
                        // we've now stored the object and referenced it in the project

                        parent.taskQueryBusy = false;
                        resolve(tasksToProcess);
                        parent.taskQueryBusy = false;
                    })

                } else {

                    // if the project store is not yet found, find it.
                    store
                        .save('taskResults', {
                            // initialize the
                            tasks: tasksToProcess
                        }).then(status => {
                        // we've now stored the object and referenced it in the project
                        parent.taskQueryBusy = false;
                        resolve(tasksToProcess); // simple, we resolved all of them.
                    })
                        .catch(error => {
                            parent.taskQueryBusy = false;
                            console.log("Couldn't store task");

                        });
                }
            });
        });
    },

    /**
     * These functions determine whether there is a level up that needs to be popped up.
     */

    pendingLvlUp: -1,

    getPendingLevelUp() {
        return this.pendingLvlUp
    },

    setPendingLevelUp(val){
        this.pendingLvlUp = val;
    },

    /**
     * Updates the mapped distance of the user locally and in firebase
     * @param addedDistance
     */
    updateMappedDistance(addedDistance) {
        var startedDistance = this.distance;

        var parent = this;
        console.log("updating mapped distance by:" + addedDistance);
        store.get('currentUser').then(result => {
            var currentDistance = -1;
            var newDistance = -1;
            if (result !== null && result !== undefined && result.distance !== undefined) {
                currentDistance = result.distance;
                newDistance = currentDistance + addedDistance;
                console.log("checking lvl up");
                if (parent.getLevelForExp(newDistance) > parent.getLevelForExp(currentDistance)) {
                    parent.pendingLvlUp = parent.getLevelForExp(newDistance);
                }
                store.update('currentUser', {
                    distance: newDistance
                }).then(data => {
                    parent.refreshDistance();
                });

                // add the added distance in firebase (never override with local value bc it might reset)
                if (con.isOnline()) {
                    myUserRef.transaction(function (user) {
                        if (user) {
                            user.distance = user.distance + addedDistance;
                        }
                        return user;
                    })
                }
            }
        });
    },


    // the max level in the app
    maxLevel: 36,

    /**
     * Returns the current level of the user
     * @returns {*}
     */
    getLevel() {
        return this.getLevelForExp(this.distance);
    },


    /**
     * Returns the entire level object, mainly for showing the badge
     * @returns {*}
     */
    getLevelObject() {
        return levels[this.getLevel()];
    },

    /**
     * Get a custom level object based on level (shown for level ups)
     * @param customLevel
     * @returns {*}
     */
    getCustomLevelObject(customLevel) {
        return levels[customLevel];
    },

    /**
     * Get the tiles until the next level (divide by 6 for swipes)
     * @returns {number}
     */
    getTilesUntilNextLevel() {
        var level = this.getLevel();
        var checkAgainst = level + 1 > this.maxLevel ? this.maxLevel : level + 1;
        return Math.ceil(((levels[checkAgainst].expRequired - levels[level].expRequired) / this.getSquareKilometersForZoomLevelPerTile(18)) / 6);
    },

    /**
     * Get the level for the exp
     * @param exp
     * @returns {number}
     */

    getLevelForExp(exp) {
        try {
            var toReturn = 1;
            var parent = this;
            Object.keys(levels).forEach(level => {
                if (exp > levels[parent.maxLevel]) {
                    toReturn = parent.maxLevel
                } else if (exp > levels[level].expRequired && exp < levels[parseInt(level) + 1].expRequired) {
                    toReturn = level;
                }
            });
            if (toReturn > this.maxLevel) {
                toReturn = this.maxLevel;
            } else if (toReturn < 1) {
                toReturn = 1;
            }
        } catch (err) {
            console.log(err);
        }

        return toReturn;
    },

    /**
     * Get the exp needed for a level
     * @param lvl
     * @returns {*}
     */

    getExpForLevel(lvl) {
        return levels[lvl].expRequired;
    },

    /**
     * Get the percentage until the next level
     * @returns {number}
     */

    getToNextLevelPercentage() {
        if (level == this.maxLevel) {
            return 1;
        }
        var level = parseInt(this.getLevel());
        var checkAgainst = level + 1;
        var currentLevelExp = levels[level].expRequired;
        var nextLevelExp = this.getExpForLevel(checkAgainst)
        var myExp = this.distance;
        var expToGainTotal = (nextLevelExp - currentLevelExp);
        var expToGainForMe = (nextLevelExp - myExp)
        var toReturn = 1 - (expToGainForMe / expToGainTotal);
        return toReturn;
    },

    /**
     * Get the amount of kilometers until the next level
     * @returns {number}
     */

    getKmTilNextLevel() {
        if (level == this.maxLevel) {
            return 1;
        }
        var level = parseInt(this.getLevel());
        var checkAgainst = level + 1;
        var currentLevelExp = levels[level].expRequired;
        var nextLevelExp = this.getExpForLevel(checkAgainst);
        var myExp = this.distance;
        var expToGainTotal = (nextLevelExp - currentLevelExp);
        var expToGainForMe = (nextLevelExp - myExp)
        return expToGainForMe;
    },

    /**
     * Calculate how much 1 tile is in square kilometers
     * @param zoomLevel
     * @returns {number}
     */

    getSquareKilometersForZoomLevelPerTile(zoomLevel) {
        if (zoomLevel === 23) {
            return 2.29172838e-5;
        } else if (zoomLevel === 22) {
            return 9.11795814e-5;
        } else if (zoomLevel == 21) {
            return 0.000364718326;
        } else if (zoomLevel == 20) {
            return 0.00146082955;
        } else if (zoomLevel == 19) {
            return 0.00584331821;
        } else if (zoomLevel == 18) {
            return 0.0233732728;//(((0.5972 * 256) ^ 2) / (1000 ^ 2))
        } else if (zoomLevel == 17) {
            return 0.0934774368;
        } else if (zoomLevel == 16) {
            return 0.373941056;
        } else if (zoomLevel == 15) {
            return 1.4957016;
        } else if (zoomLevel == 14) {
            return 5.98280642;
        } else if (zoomLevel == 13) {
            return 23.9314761;
        } else if (zoomLevel == 12) {
            return 95.7254037;
        }
    },
    /**
     * Updates the contributions of the user
     */

    updateContributions(addedContributions) {

        var parent = this;
        store.get('currentUser').then(result => {
            var currentContributions = -1;
            var newContributions = -1;
            if (result !== null && result !== undefined && result.contributions !== undefined) {
                currentContributions = result.contributions;
                newContributions = currentContributions + addedContributions;
                store.update('currentUser', {
                    contributions: newContributions
                }).then(data => {
                    parent.refreshContributions();
                });

                // add the added contributions in firebase (never override with local value bc it might reset)
                if (con.isOnline()) {
                    myUserRef.transaction(function (user) {
                        if (user) {
                            user.contributions = user.contributions + addedContributions;
                        }
                        return user;
                    })
                }
            }
        });
    },


    /**
     * Returns the firebase timestamp
     * @returns {rf.TIMESTAMP|{[.sv]}|sf.TIMESTAMP}
     */
    getTimestamp() {
        return firebase.database.ServerValue.TIMESTAMP;
    },
    /**
     * Adds a group complete to your local storage to later by synced
     * @returns {Promise}
     */
    addGroupComplete: function (project, group) {


        var parent = this;

        /**
         * Add the distance of this map to your current level
         */
        var projKey = 'project-' + project + "-group-" + group;
        // this.addToIgnoreList(projKey);
        store.get(projKey).then(result => {
            if (result !== null && result !== undefined && result.group !== undefined) {
                var distancePerTile = parent.getSquareKilometersForZoomLevelPerTile(result.group.zoomLevel);
                console.log("Distance per tile was:" + distancePerTile);
                console.log("group count was:" + result.group.count);
                this.updateMappedDistance(Math.ceil(result.group.count * distancePerTile));
            }

        });


        return new Promise(function (resolve, reject) {

            var obj = {
                groupId: group,
                projectId: project
            };

            // remove the group from the cache

            // add the group to the group completes object
            store.get('groupCompletes').then(result => {
                if (result !== null && result !== undefined) {

                    result.groups.push(obj);

                    store
                        .save('groupCompletes', {
                            // initialize the
                            groups: result.groups
                        }).then(status => {
                        // we've now stored the object and referenced it in the project
                        console.log("Storing groups");
                        console.log(obj);
                        parent.removeGroup(project, group).then(data => {
                            resolve();
                            var key = 'project-' + project + "-group-" + group;
                            parent.removeOfflineGroup(key);
                        });
                    })

                } else {

                    // if the project store is not yet found, find it.
                    store
                        .save('groupCompletes', {
                            // initialize the
                            groups: [obj]
                        }).then(status => {
                        // we've now stored the object and referenced it in the project
                        console.log("Storing complete group");
                        console.log(obj);
                        parent.removeGroup(project, group).then(data => {
                            resolve();
                        });
                    })
                        .catch(error => {
                            console.log("Couldn't store group complete");
                        });
                }

            })


        });
    },

    distance: -1,

    /**
     * After the user has his/her session, this will get the latest mapping data. If the local distance is greater, it'll update firebase and ues the local one
     * If offline, it'll also use the local one
     * If on firebase is larger, it'll use firebase's and turn yours to that one
     */
    refreshDistance() {
        var parent = this;
        store.get("currentUser").then(data => {
            if (data !== null && data !== undefined && data.distance !== undefined) {
                // we have a valid local distance store
                parent.distance = data.distance;
            }
        });
    },
    contributions: -1,

    /**
     * After the user has his/her session, this will get the latest mapping data. If the local contributions is greater, it'll update firebase and ues the local one
     * If offline, it'll also use the local one
     * If on firebase is larger, it'll use firebase's and turn yours to that one
     */
    refreshContributions() {
        var parent = this;
        store.get("currentUser").then(data => {
            if (data !== null && data !== undefined && data.contributions !== undefined) {
                // we have a valid local distance store
                parent.contributions = data.contributions;
            }
        });
    },

    /**
     * Log out
     */

    logOut() {
        store.update('currentUser', {
            distance: 0,
            contributions: 0,
            username: "",
        }).then(data => {
            auth.logOut();
        });

    },

    getDistance() {
        return this.distance
    },

    getContributions() {
        return this.contributions
    },

    /**
     * Gets the remote user object and compares it to the local one, updates any outdated values in both
     * @param remoteObj
     */
    compareAndUpdate() {

        myUserRef = database.ref("/users/" + auth.getUser().uid);

        var parent = this;
        myUserRef.once('value', function (data) {
            var remoteObj = data.val();
            console.log("remote data obj");
            console.log(remoteObj);
            store.get("currentUser").then(local => {
                if (local !== null && local !== undefined && local.distance !== undefined && local.contributions !== undefined) {

                    // IMPORTANT PART!

                    var localDistance = local.distance;
                    var remoteDistance = remoteObj.distance;
                    var localContributions = local.contributions;
                    var remoteContributions = remoteObj.contributions;

                    console.log("remote distance:" + remoteDistance);
                    console.log("local distance:" + localDistance);

                    // compare and sync the necessary objects

                    // distance mapped
                    if (localDistance > remoteDistance) {
                        myUserRef.update({
                            distance: localDistance
                        })
                        parent.refreshDistance();
                    } else if (remoteDistance > localDistance) {
                        store.update('currentUser', {
                            distance: remoteDistance
                        }).then(data => {
                            parent.refreshDistance();
                        })
                    } else {
                        parent.refreshDistance();
                    }

                    console.log("remote contributions:" + remoteContributions);
                    console.log("local contributions:" + localContributions);
                    // contributions
                    if (localContributions > remoteContributions) {
                        myUserRef.update({
                            contributions: localContributions
                        })
                        parent.refreshContributions();
                    } else if (remoteContributions > localContributions) {
                        store.update('currentUser', {
                            contributions: remoteContributions
                        }).then(data => {
                            parent.refreshContributions();
                        })
                    } else {
                        parent.refreshContributions();
                    }

                } else {
                    store.update('currentUser', remoteObj).then(data => {
                        parent.refreshDistance();
                        parent.refreshContributions();
                    });
                }


            });
        });
    },


    /**
     * Refresh the offline groups with the one currently in the cache
     */
    refreshOfflineGroups() {
        var parent = this;
        store.get("offlineGroups").then(data => {
            console.log("setting offline groups");
            console.log(data);
            if (data !== null && data !== undefined && data.offlineGroups !== undefined) {
                parent.offlineGroups = data.offlineGroups;
            }
        });
    },

    /**
     * Whether we should open the popup
     */
    openPopup: function (state) {
        var parent = this;

        return new Promise(function (resolve, reject) {
            // this will throw, x does not exist


            store.get('popupWatched').then(result => {
                if (result !== null && result !== undefined) {
                    resolve();
                } else {
                    reject();
                }
            });

        });
    },

    stopPopup() {
        store.update('popupWatched', {
            watched: true
        })
    },
    /**
     * Handles the initial loading of the app (what we consider login) to see if the user has already used Mapswipe before.
     * @returns {Promise}
     */
    offlineGroups: [],
    interval: null,

    handleSessionStart: function (state) {

        var parent = this;
        //this.refreshIgnoreList();
        con.initializeWithState(state);
        this.refreshOfflineGroups();

        return new Promise(function (resolve, reject) {
            // this will throw, x does not exist
            // checks every 500 ms if we are authenticated and if we have finished the tutorial
            parent.interval = setInterval(function () {
                //do what you need here
                if (auth.receivedLoginStatus() === true) {
                    store.get('finishTutorial').then(result => {
                        if (auth.isLoggedIn() && result !== null && result !== undefined) {
                            myUserRef = database.ref("/users/" + auth.getUser().uid);
                            parent.compareAndUpdate();
                            resolve();
                            clearInterval(parent.interval);
                        } else {
                            reject();
                            clearInterval(parent.interval);
                        }
                    });
                }
            }, 500);

        });
    },

    /**
     * Dispatches an event to reset the pass to the user
     * @param email
     * @returns {Promise}
     */
    resetPass: function (email) {

        return new Promise(function (resolve, reject) {
            // this will throw, x does not exist

            auth.resetPass(email).then(data => {
                resolve(data);
            }).catch(error => {
                console.log(error);
                reject(error);
            })

        });
    },

    /**
     * Dispatches an event to create the account
     * @param email
     * @param username
     * @param pass
     * @returns {Promise}
     */

    createAccount: function (email, username, pass) {
        var parent = this;
        return new Promise(function (resolve, reject) {
            // this will throw, x does not exist

            auth.createAccount(email, username, pass).then(data => {
                console.log("account created!!");
                var userObj = {
                    username: username,
                    distance: 0,
                    contributions: 0,

                };
                database.ref("/users/" + auth.getUser().uid).set(userObj).then(data => {
                    resolve(data);
                });
                myUserRef = database.ref("/users/" + auth.getUser().uid);
                parent.compareAndUpdate();
                store.update('currentUser', userObj);
            }).catch(error => {
                console.log(error);
                reject(error);
            })

        });
    },

    /**
     * Dispatches an event to the auth manager to sign in
     * @param email
     * @param pass
     * @returns {Promise}
     */
    signIn: function (email, pass) {
        var parent = this;
        return new Promise(function (resolve, reject) {
            // this will throw, x does not exist


            auth.signIn(email, pass).then(data => {
                // set the user ref
                myUserRef = database.ref("/users/" + auth.getUser().uid);

                // compare the remote obj and set the local one
                parent.compareAndUpdate();
                resolve(data);
            }).catch(error => {
                console.log(error);
                reject(error);
            })

        });
    },


    /**
     * Sets the tut to complete
     */
    setTutorialComplete: function () {
        return new Promise(function (resolve, reject) {
            // this will throw, x does not exist
            store
                .save('finishTutorial', {
                    finished: true
                }).then(status => {
                resolve(status);
            })
                .catch(error => {
                    reject(error);
                });
        });
    },

    /**
     * Gets the projects available to the user. If no projects are stored AND the user is offline, we return an error.
     *
     * @returns {Promise}
     */
    getProjects: function () {
        function sortObject(obj) {
            return Object.keys(obj).sort().reduce(function (result, key) {
                result[key] = obj[key];
                return result;
            }, {});
        }

        return new Promise(function (resolve, reject) {
            {

                if (con.isOnline()) {
                    projectsRef.on('value', function (snapshot) {

                        /* await snapshot.forEach(async (child) => {
                         console.log(child);
                         // add each project to the local store
                         });*/

                        var projects = snapshot.val();
                        // FIXME: sort projects without using underscore
                        //var projects = _.sortBy(projects, "isFeatured").reverse();


                        var newCards = {
                            featuredCard: null,
                            otherCards: []
                        };

                        var currentRow = [];
                        var projectCount = 0;
                        for (var p in projects) {
                            projectCount++;
                            var project = projects[p];
                            if (project !== undefined && project !== null && project.groupAverage !== undefined && project.state !== 3) {

                                currentRow.push(project);

                                if (newCards.featuredCard === null && currentRow[0].isFeatured) {
                                    newCards.featuredCard = currentRow[0];
                                    currentRow = [];
                                } else {
                                    if (currentRow.length === 2 || projectCount >= projects.length) {
                                        newCards.otherCards.push({cards: currentRow});
                                        currentRow = [];
                                    }
                                }


                            }
                        }


                        store
                            .save('projects', {
                                cards: newCards
                            })
                            .catch(error => {
                                console.log("Threw error on saving new cards");
                            });
                        console.log("Resolving!");
                        resolve(newCards);


                    });
                } else {
                    console.log("Getting projects offline......");
                    store.get('projects').then(result => {
                        if (result !== null && result !== undefined) {
                            resolve(result.cards);
                        } else {
                            reject();
                        }
                    });

                }


            }
        });
    },
    /**
     * Gets the announcement from firebase
     *
     * @returns {Promise}
     */
    getAnnouncement: function () {
        return new Promise(function (resolve, reject) {
            {

                if (con.isOnline()) {
                    announcementRef.on('value', function (snapshot) {
                        resolve(snapshot.val());
                    });
                } else {
                    reject();
                }


            }
        });
    },
    /**
     * Ran as part of an interval, initiated by startTiledownload.
     * @param group
     */
    queuedDownloadInterval: 200,


    /**
     * Downloads all the tiles in a given group to disk
     * @param group
     */
    tileDownloadWrapper: {
        groups: {},
        currentUsageBy: -1,
    },

    totalRequests: {},
    totalRequestsOutstanding2: {},
    totalRequestsOutstandingByGroup: {},
    isDownloading: {},

    /**
     * Starts the tile download and downloads all the tiles offline, then sends a notification
     * @param projectId
     * @param groups
     */
    startTileDownload: function (projectId, groups) {
        var parent = this;
        var keyGroup = [];
        console.log("Groups:");

        Object.keys(groups).forEach(function (groupKey) {
            console.log("adding to keygroup: " + groupKey);
            var key = "project-" + projectId + "-group-" + groupKey;
            keyGroup.push(key);
        });
        Object.keys(groups).forEach(function (groupKey) {
            console.log("starting download for group " + groupKey);
            var groupRequestCache = {};
            var group = groups[groupKey];
            var key = "project-" + projectId + "-group-" + groupKey;
            parent.isDownloading[key] = true;
            var projectKey = "project-" + projectId;
            let projectDir = RNFS.DocumentDirectoryPath + "/" + projectId;
            let dir = projectDir + "/" + groupKey // e.g. /1/45
            parent.totalRequestsOutstandingByGroup[key] = 0;
            if (parent.totalRequests[projectKey] === undefined) {
                parent.totalRequests[projectKey] = 0;
                parent.totalRequestsOutstanding2[projectKey] = 0;

            }
            RNFS.mkdir(projectDir).then(data => {
                RNFS.mkdir(dir).then(data => {
                    Object.keys(group.tasks).forEach(function (taskKey) {
                        var tile = group.tasks[taskKey];


                        var fileName = dir + '/' + tile.id + ".jpeg";
                        parent.totalRequestsOutstandingByGroup[key]++;

                        parent.totalRequests[projectKey]++;
                        parent.totalRequestsOutstanding2[projectKey]++


                        // self invoking function to ensure the state of the download when it finishes.
                        (function (tileUrl, fileName, parent, key, projectKey) {


                            RNFS.downloadFile({
                                fromUrl: tileUrl,
                                toFile: fileName,
                                background: true
                            }).then(res => {
                                parent.totalRequestsOutstanding2[projectKey]--;
                                parent.totalRequestsOutstandingByGroup[key]--;
                                // console.log("(success) Outstanding:" + parent.totalRequests[projectKey] + " /" + parent.totalRequestsOutstanding2[projectKey]);
                                if (parent.totalRequestsOutstanding2[projectKey] <= 0) {

                                    parent.isDownloading[key] = false;
                                    store.get("offlineGroups").then(data => {

                                        if (data !== null && data !== undefined && data.offlineGroups !== undefined && data.offlineGroups.length > 0) {

                                            data.offlineGroups.concat(keyGroup);
                                            console.log("added " + keyGroup + " to offline groups")

                                            store.update('offlineGroups', {
                                                offlineGroups: data.offlineGroups
                                            }).then(data => {
                                                parent.refreshOfflineGroups();
                                            });
                                        } else {
                                            console.log("setting offline groups to just " + keyGroup);
                                            store.update('offlineGroups', {
                                                offlineGroups: keyGroup
                                            }).then(data => {
                                                parent.refreshOfflineGroups();
                                            });
                                        }
                                    });
                                    /* FIXME: make push notifications work again
                                    PushNotification.localNotification({
                                        message: "Project Download Complete", // (required)
                                    });
                                    */

                                }

                                if (parent.totalRequestsOutstandingByGroup[key] <= 0) {

                                    console.log(key + " has finished downloading");


                                }
                            }).catch(error => {
                                parent.totalRequestsOutstanding2[key]--;
                            });
                        })(tile.url, fileName, parent, key, projectKey);
                    });


                });
            });

        });


    },


    /**
     * Gets the task groups available to the user (whether online or offline)
     *
     * First, the function gets the least distributed groups
     * Then, the client stores these groups in storage
     * Then, it references the groups in the main project store, along with some data (e.g. whether the group is available offline, and it's progressCount)
     *
     *
     * @param projectId is the project you're working on
     * @param groupCount is the amount of groups you want to download
     * @param taskAmount is the amount of tasks you want to download (usually if you don't know how many groups you need)
     * @returns {Promise}
     *
     * The result is an array of the newly added stores. This does not include the actual imagery. That is a separate promise.
     */

    getTaskGroupsForProject: function (projectId, groupCount, taskAmount, avgGroupSize, downloadTiles) {
        var parent = this;
        return new Promise(function (resolve, reject) {
            {
                var projectKey = 'project-' + projectId;

                // we usfe this when we download large sets for offline use
                if (taskAmount !== undefined && avgGroupSize !== undefined) {
                    groupCount = Math.floor(Math.floor(taskAmount) / Math.floor(avgGroupSize));
                    console.log("Groups set to " + groupCount + " with avg group size: " + avgGroupSize + " and tasks: " + taskAmount + "");
                }

                if (con.isOnline()) {
                    console.log("asking firebase for.. stuff");
                    const myGroups = groupsRef.child(projectId + "");


                    fetch(`${config.firebaseConfig.databaseURL}/groups/` + projectId + '.json?orderBy="completedCount"&limitToFirst=' + groupCount + '')
                        .then((response) => response.json())
                        .then(data => {
                            var returnGroups = [];
                            if (downloadTiles === true) {
                                parent.startTileDownload(projectId, data);
                            }
                            var awaitStores = 0;

                            // first build the index so that returnGroups is filled in and gets added properly.
                            for (var idx in data) {
                                awaitStores++;
                                console.log("Building index for group id: " + idx)

                                var child = data[idx];

                                if (child !== null) {

                                    var key = 'project-' + child.projectId + "-group-" + child.id;


                                    var groupNow = {
                                        groupId: key,
                                        projectId: child.projectId,
                                        progress: 0, // measured in xOffset, so that we can return to there.
                                        status: 0 // 0 = not started, 1 = started, 2 = finished

                                    };

                                    console.log("pushing to return groups:");
                                    console.log(groupNow);
                                    returnGroups.push(groupNow);

                                }
                            }

                            // check whether we should resolve the current promise (when we have all the groups back)

                            var checkToResolve = function () {
                                try {
                                    awaitStores--; // count down the amount of stores before we resolve the promise
                                    if (awaitStores === 0) {
                                        console.log("resolving");
                                        console.log(returnGroups);
                                        store.get(projectKey).then(result => {
                                            if (result !== null && result !== undefined && result.groups !== undefined) {

                                                console.log("return groups is:");
                                                console.log(returnGroups);
                                                for (var i = 0; i < returnGroups.length; i++) {
                                                    var found = false;
                                                    for (var checkAgainst = 0; checkAgainst < result.groups.length; checkAgainst++) {
                                                        if (returnGroups[i].groupId === result.groups[checkAgainst].groupId) {
                                                            console.log("prevented double group on " + returnGroups[i]);
                                                            found = true;
                                                        }
                                                    }
                                                    if (found === false) {
                                                        result.groups.push(returnGroups[i]);
                                                    }
                                                }


                                                // store the new object
                                                store
                                                    .save(projectKey, {
                                                        groups: result.groups
                                                    }).then(data => {
                                                    console.log("groups is now:");
                                                    console.log(data);
                                                    console.log("getting just in case:");
                                                    store.get(projectKey).then(data => {
                                                        console.log("got groups:")
                                                        console.log(data.groups);
                                                    })

                                                })
                                                    .catch(error => {
                                                        console.log("Couldn't store group");
                                                    });
                                            } else {

                                                // if the project store is not yet found, find it.
                                                store
                                                    .save(projectKey, {
                                                        // initialize the
                                                        groups: returnGroups
                                                    })
                                                    .catch(error => {
                                                        console.log("Couldn't store group");
                                                        console.log(error);
                                                    });
                                            }
                                        });
                                        resolve(returnGroups);
                                    } else {
                                        console.log("Not resolving becuse awaitStores is " + awaitStores);
                                    }
                                } catch (err) {
                                    console.log("error");
                                    console.log(err);
                                }
                            };


                            // after the index is built, save them to local storage
                            for (var idx in data) {
                                console.log("Saving group id: " + idx)

                                var child = data[idx];

                                if (child !== null) {

                                    var key = 'project-' + child.projectId + "-group-" + child.id;
                                    // store the group by its key
                                    store
                                        .save(key, {
                                            group: child
                                        }).then(data => {
                                        console.log("checking to resolve333!");
                                        checkToResolve()
                                    })
                                }
                            }
                        })


                } else {
                    console.log("we're offline");
                    reject({
                        offline: true
                    });
                }
            }
        });
    },

    /**
     * Removes a group
     */
    removeGroup: function (projectId, groupId) {
        return new Promise(function (resolve, reject) {
            // this will throw, x does not exist
            var projectKey = 'project-' + projectId;
            store.get(projectKey).then(result => {
                if (result !== null && result !== undefined && result.groups !== undefined) {
                    console.log("Pre-removal-length" + result.groups.length);
                    // remove the group from memory.
                    var groupKey = 'project-' + projectId + "-group-" + groupId;
                    var index = -1;
                    for (var i = 0; i < result.groups.length; i++) {
                        console.log(groupKey);
                        if (result.groups[i].groupId === groupKey) {
                            index = i;
                        }
                    }

                    console.log("Removing project from project key: " + groupKey);


                    if (index > -1) {
                        result.groups.splice(index, 1);
                    }
                    console.log("Post-removal-length" + result.groups.length);
                    store
                        .save(projectKey, {
                            groups: result.groups
                        }).then(status => {
                        store
                            .delete(groupKey).then(status => {
                            console.log("Fully deleted group " + groupKey);
                            resolve();
                        }).catch(error => {
                            console.log("Error but resolving anyways");
                            console.log(error);
                            resolve();
                        })
                    })

                }
            });
        });
    },

    /**
     * Removes an obj from the groupCompletes
     */
    removeGroupSync: function (projectId, groupId) {
        return new Promise(function (resolve, reject) {
            // this will throw, x does not exist
            var projectKey = 'project-' + projectId;
            store.get(projectKey).then(result => {
                if (result !== null && result !== undefined && result.groups !== undefined) {
                    console.log("Pre-removal-length" + result.groups.length);
                    // remove the group from memory.
                    var groupKey = 'project-' + projectId + "-group-" + groupId;
                    var index = -1;
                    for (var i = 0; i < result.groups.length; i++) {
                        console.log(groupKey);
                        if (result.groups[i].groupId === groupKey) {
                            index = i;
                        }
                    }

                    console.log("Removing project from project key: " + groupKey);


                    if (index > -1) {
                        result.groups.splice(index, 1);
                    }
                    console.log("Post-removal-length" + result.groups.length);
                    store
                        .save(projectKey, {
                            groups: result.groups
                        }).then(status => {
                        store
                            .delete(groupKey).then(status => {
                            console.log("Fully deleted group " + groupKey);
                            resolve();
                        }).catch(error => {
                            console.log("Error but resolving anyways");
                            console.log(error);
                            resolve();
                        })
                    })

                }
            });
        });
    },

    /**
     * Whether the have the group in memory already
     * @param key
     * @returns {boolean}
     */

    isOfflineGroup(key) {
        for (var i = 0; i < this.offlineGroups.length; i++) {
            if (this.offlineGroups[i] === key) {
                console.log("found offline group!" + key);
                return true;
            }
        }
        return false;
    },

    /**
     * Whether the project has any offline groups
     * @param project
     * @returns {boolean}
     */
    hasOfflineGroups(project) {
        for (var i = 0; i < this.offlineGroups.length; i++) {
            if (this.offlineGroups[i].indexOf(project) !== -1) {
                return true;
            }
        }
        return false;
    },

    /**
     * Whether the project has any open downloads
     * @param project
     * @returns {boolean}
     */

    hasOpenDownloads(project) {
        var parent = this;
        console.log("Checking for open downloads on " + project);
        if (this.totalRequestsOutstanding2[project] === undefined) {
            return false;
        } else if (parent.totalRequestsOutstanding2[project] > 0) {
            return true;
        }
        return false;
    },

    /**
     * Remove an offline group
     * @param key
     * @returns {boolean}
     */
    removeOfflineGroup(key) {
        console.log("made it to remove offline group");
        var projectAndGroup = key.split('-group-');
        var projectId = projectAndGroup[0].replace("project-", "");
        var groupId = projectAndGroup[1] + "";
        console.log("Gonna remove " + projectAndGroup + " -> " + projectId + " ->" + groupId)
        for (var i = 0; i < this.offlineGroups.length; i++) {
            if (this.offlineGroups[i] === key) {
                console.log("FOUND!! remove " + projectAndGroup + " -> " + projectId + " ->" + groupId)
                this.offlineGroups.splice(i, 1);
                store.update('offlineGroups', {
                    offlineGroups: this.offlineGroups
                }).then(data => {
                    var path = RNFS.DocumentDirectoryPath + "/" + projectId + "/" + groupId;

                    RNFS.unlink(path)
                    // spread is a method offered by bluebird to allow for more than a
                    // single return value of a promise. If you use `then`, you will receive
                    // the values inside of an array
                        .spread((success, path) => {
                            console.log('FILE DELETED', success, path);
                        })
                        // `unlink` will throw an error, if the item to unlink does not exist
                        .catch((err) => {
                            console.log(err.message);
                        });
                })
                return true;
            }
        }
        return false;
    },

    /**
     * Remove all offline groups in a project
     * @param key
     * @returns {number}
     */
    removeOfflineProject(key) {
        var parent = this;
        console.log("removing project with key" + key);
        var found = 0;
        for (var i = 0; i < parent.offlineGroups.length; i++) {
            if (parent.offlineGroups[i].indexOf(key) !== -1) {
                found++;
                parent.removeOfflineGroup(parent.offlineGroups[i]);
            }
        }

        return found;

    },
    /**
     * Removes a project compltely
     */
    removeProject(key) {
        var parent = this;
        console.log("removing project with key" + key);
        store.delete(key);
    },
    /**
     * This promise gets the best group to return to the mapper at any given time. It will get new groups if necessary, and return the groups in storage if we're offline.
     * @param projectId
     * @returns {Promise}
     */
    getSingleGroup: function (projectId) {
        var parent = this;
        return new Promise(function (resolve, reject) {
            {

                /**
                 * Picks the best group
                 *
                 * If one of them is in progress, return that one.
                 * Otherwise return the first in the array.
                 *
                 * @param groups
                 * @returns group object
                 */

                var pickBestGroup = function (groups, projectId) {
                    var toReturn = null;
                    for (var key in groups) {
                        var group = groups[key];
                        console.log("Checking to see if " + group.groupId + " is an offline group");
                        if (parent.isOfflineGroup(group.groupId)) {
                            console.log("" + group.groupId + " is an offline group");
                            return group.groupId;
                        }

                        toReturn = group.groupId;
                    }

                    return toReturn;
                };


                /**
                 * Gets the actual group from memory..
                 * @param key
                 */

                var getGroup = function (key) {
                    store.get(key).then(result => {
                        if (result !== null && result !== undefined && result.group !== undefined) {
                            console.log("giving back:");
                            resolve(result);
                        } else {
                            console.log("Show error because the group was not found in memory");
                            var chunks = key.split("-"); // example key is project-1-group-2 so we can split and get [1] and [3]
                            var project = chunks[1];
                            var group = chunks[3];
                            parent.removeGroup(project, group).then(data => {
                                console.log("Removed a group..." + project + " - " + group)
                                reject();
                            });
                        }
                    });
                }

                // TODO delete old groups

                var projectKey = 'project-' + projectId;
                var idealLocalGroupCount = 3; //todo put this back at 5 or soo

                // get the groups that are available for rendering/processing, show the ones that are already available offline first
                store.get(projectKey).then(result => {
                    try {
                        console.log("uhh local store???");
                        if (!con.isOnline() || result !== null && result !== undefined && result.groups !== undefined && result.groups.length > 0 && pickBestGroup(result.groups, projectId) !== null) { // we have enough to work with, or we're offline, so we won't get more...

                            var groupCount = result.groups.length;
                            console.log("We have " + groupCount + " groups available for processing");

                            getGroup(pickBestGroup(result.groups, projectId));
                        } else { // we need more groups
                            console.log("Not enough groups, getting them");
                            var newGroupsToGet = idealLocalGroupCount;
                            if (result !== null && result !== undefined && result.groups !== undefined) {
                                newGroupsToGet = newGroupsToGet - result.groups.length; // we never want more than 5 in cache.
                            }
                            // project data is not available, get groups and return the best one for processing
                            parent.getTaskGroupsForProject(projectId, newGroupsToGet).then((data) => {
                                console.log("picking best group");
                                getGroup(pickBestGroup(data));

                            }).catch(function (error) {
                                console.log(error);
                            });
                        }
                    } catch (err) {
                        console.log("error???");
                        console.log(err);
                    }
                });


            }
        });
    },


}

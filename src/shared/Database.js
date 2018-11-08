/**
 * @author Pim de Witte (pimdewitte.me/pimdewitte95@gmail.com). Copyright MSF UK 2016.
 *
 * Database is the main class for communicating with firebase and AsyncStorage.
 */

import firebase from 'react-native-firebase';
import { Levels as levels } from './Levels';
import { store as reduxStore } from './store';

const RNFS = require('react-native-fs');
const ConnectionManager = require('./ConnectionManager');
const AuthManager = require('./AuthManager');


console.log(RNFS.DocumentDirectoryPath);

/* var PushNotification = require('react-native-push-notification');
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
}); */

const database = firebase.database();

const projectsRef = database.ref('projects');
const groupsRef = database.ref('groups');
let myUserRef;
const announcementRef = database.ref('announcement');

const store = require('react-native-simple-store');

const con = new ConnectionManager();
const auth = new AuthManager(firebase);

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
    syncAndDeIndex() {
        const parent = this;

        return new Promise(((resolve, reject) => {
            // syncAndStatus always attempts to report ALL objects. Therefore, we only have to listen for the errors to re-pupulate the stores.
            parent.syncAndStatus().then((results) => {
                console.log('i can haz results');

                const errorCount = results.task.error.length;
                const successCount = results.task.success.length;

                parent.updateContributions(successCount);
                store
                    .save('taskResults', {
                        // initialize the
                        tasks: results.task.error,
                    }).then((status) => {
                        store
                            .save('groupCompletes', {
                            // initialize the
                                groups: results.group.error,
                            }).then((status) => {
                                console.log('syncAndDeIndex check', status, successCount, errorCount);
                                if (errorCount > successCount) {
                                    // more errors than successes... nope
                                    reject({
                                        errorCount,
                                        successCount,
                                    });
                                } else {
                                    resolve({
                                        errorCount,
                                        successCount,
                                    });
                                }
                            });
                    });
            });
        }));
    },

    /**
     * Syncs and returns the status to syncAndDeIndex
     * @returns {Promise}
     */

    syncAndStatus() {
        return new Promise(((resolve, reject) => {
            let completeCount = 0;

            const resolveTypes = {
                task: {
                    success: [],
                    error: [],
                },
                group: {
                    success: [],
                    error: [],
                },
            };

            /**
             * Resolver function that resolves when all async actions have reported back their result (either success or error). The response will be resolved.
             * @param status
             * @param obj
             */
            const checkResolve = function (status, type, obj) {
                resolveTypes[type][status].push(obj);
                completeCount--;

                console.log(`count: ${completeCount}`);

                if (completeCount == 0) {
                    console.log('All data points reported. Resolving promise');
                    resolve(resolveTypes);
                }
            };

            console.log('syncAndStatus');
            if (con.isOnline()) {
                console.log('syncAndStatus is online');
                // get the current task results in memory that have not been synced yet
                store.get('taskResults').then((result) => {
                    console.log('store returned raskResults', result);
                    if (result !== null) {
                        for (let i = 0; i < result.tasks.length; i++) {
                            const task = result.tasks[i];
                            if (task.device !== undefined) {
                                console.log(`Attempting to sync task ${task.id}`);
                                var taskRef = database.ref(`results/${task.id}`);

                                // increase the amount of actions that need to happen for completion
                                completeCount++;
                                (function (task) { // capturing the group in a closure so that the callbacks use the right task variable
                                    taskRef.child(auth.getUser().uid).set({
                                        data: task,
                                    }).then((data) => {
                                        checkResolve('success', 'task', task);
                                    }).catch((data) => {
                                        checkResolve('error', 'task', task);
                                    });
                                }(task));
                            }
                        }
                    }
                });

                // sync the group complete count with firebase (The completed count is used to sort groups so that they can always be returned properly)
                store.get('groupCompletes').then((result) => {
                    if (result !== null) {
                        console.log('completes:', result);

                        for (let i = 0; i < result.groups.length; i++) {
                            const group = result.groups[i];
                            if (group.groupId !== undefined) {
                                completeCount += 1; // need 2 callbacks form groups, 1 for local sync, 1 for remote
                                console.log(`Attempting to sync group ${group.groupId} in project${group.projectId}`);
                                var groupRef = groupsRef.child(`${group.projectId}`).child(group.groupId);

                                (function (group) { // capturing the group in a closure
                                    groupRef.transaction((group) => {
                                        if (group) {
                                            group.completedCount += 1;
                                        }
                                        return group;
                                    }).then(data => checkResolve('success', 'group', group)).catch((error) => {
                                        checkResolve('error', 'group', group);
                                    });
                                }(group));
                            }
                        }
                    }
                });
                resolve(resolveTypes);
            } else {
                console.log("We're offline, not reporting rn");
                resolve(resolveTypes);
            }
        }));
    },

    tasksReady: {},

    taskLoop: null,

    /**
     * Delete a task to process from memory
     * @param id
     */

    deleteTask(id) {
        console.log(`deleting${id}`);
        delete this.tasksReady[id];
    },

    /**
     * Adds a task (aka tile) that is ready for processing to the queue.
     * Also, if new tasks are added while others are being processed, this is handled with the fact that it only removes objects from the array that were reported.
     * @param task
     */
    taskReadyForProcessing(task) {
        const parent = this;
        if (this.taskLoop === null) {
            this.taskLoop = setInterval(() => {
                console.log('processing tasks...');
                // console.log(parent.tasksReady);
                parent.processTasks(Object.keys(parent.tasksReady)).then((data) => {
                    console.log('Processed tasks');
                    console.log(data);
                    data.forEach((task) => {
                        delete parent.deleteTask(task);
                    });
                }).catch((error) => {
                    console.log("Task wasn't set ready for processing! Big alert!");
                });
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
    processTasks(tasks) {
        const parent = this;
        const tasksToProcess = tasks;
        const taskArray = [];
        tasksToProcess.forEach((task) => {
            taskArray.push(parent.tasksReady[task]);
        });
        return new Promise(((resolve, reject) => {
            if (parent.taskQueryBusy === true) {
                reject();
                return;
            }
            parent.taskQueryBusy = true;

            store.get('taskResults').then((result) => {
                if (result !== null && result !== undefined) {
                    taskArray.forEach((task) => {
                        // check if it already contains a task with the current id
                        // if so, overwrite that task
                        // otherwise, push a new task

                        if (task.result === 0) {
                            // find the
                        }

                        let taskFound = false;
                        let toDelete = -1;
                        for (let i = 0; i < result.tasks.length; i++) {
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
                            console.log(`pushing task to cache:${task.id}`);
                            result.tasks.push(task);
                        }
                    });

                    store
                        .save('taskResults', {
                            // initialize the
                            tasks: result.tasks,
                        }).then((status) => {
                        // we've now stored the object and referenced it in the project

                            parent.taskQueryBusy = false;
                            resolve(tasksToProcess);
                            parent.taskQueryBusy = false;
                        });
                } else {
                    // if the project store is not yet found, find it.
                    store
                        .save('taskResults', {
                            // initialize the
                            tasks: tasksToProcess,
                        }).then((status) => {
                        // we've now stored the object and referenced it in the project
                            parent.taskQueryBusy = false;
                            resolve(tasksToProcess); // simple, we resolved all of them.
                        })
                        .catch((error) => {
                            parent.taskQueryBusy = false;
                            console.log("Couldn't store task");
                        });
                }
            });
        }));
    },

    /**
     * These functions determine whether there is a level up that needs to be popped up.
     */

    pendingLvlUp: -1,

    getPendingLevelUp() {
        return this.pendingLvlUp;
    },

    setPendingLevelUp(val) {
        this.pendingLvlUp = val;
    },

    /**
     * Updates the mapped distance of the user locally and in firebase
     * @param addedDistance
     */
    updateMappedDistance(addedDistance) {
        const startedDistance = this.distance;

        const parent = this;
        console.log(`updating mapped distance by:${addedDistance}`);
        store.get('currentUser').then((result) => {
            let currentDistance = -1;
            let newDistance = -1;
            if (result !== null && result !== undefined && result.distance !== undefined) {
                currentDistance = result.distance;
                newDistance = currentDistance + addedDistance;
                console.log('checking lvl up');
                if (parent.getLevelForExp(newDistance) > parent.getLevelForExp(currentDistance)) {
                    parent.pendingLvlUp = parent.getLevelForExp(newDistance);
                }
                store.update('currentUser', {
                    distance: newDistance,
                }).then((data) => {
                    parent.refreshDistance();
                });

                // add the added distance in firebase (never override with local value bc it might reset)
                if (con.isOnline()) {
                    myUserRef.transaction((user) => {
                        if (user) {
                            user.distance += addedDistance;
                        }
                        return user;
                    });
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
        const level = this.getLevel();
        const checkAgainst = level + 1 > this.maxLevel ? this.maxLevel : level + 1;
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
            const parent = this;
            Object.keys(levels).forEach((level) => {
                if (exp > levels[parent.maxLevel]) {
                    toReturn = parent.maxLevel;
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
     * Calculate how much 1 tile is in square kilometers
     * @param zoomLevel
     * @returns {number}
     */

    getSquareKilometersForZoomLevelPerTile(zoomLevel) {
        if (zoomLevel === 23) {
            return 2.29172838e-5;
        } if (zoomLevel === 22) {
            return 9.11795814e-5;
        } if (zoomLevel == 21) {
            return 0.000364718326;
        } if (zoomLevel == 20) {
            return 0.00146082955;
        } if (zoomLevel == 19) {
            return 0.00584331821;
        } if (zoomLevel == 18) {
            return 0.0233732728;//(((0.5972 * 256) ^ 2) / (1000 ^ 2))
        } if (zoomLevel == 17) {
            return 0.0934774368;
        } if (zoomLevel == 16) {
            return 0.373941056;
        } if (zoomLevel == 15) {
            return 1.4957016;
        } if (zoomLevel == 14) {
            return 5.98280642;
        } if (zoomLevel == 13) {
            return 23.9314761;
        } else if (zoomLevel == 12) {
            return 95.7254037;
        }
    },
    /**
     * Updates the contributions of the user
     */

    updateContributions(addedContributions) {
        const parent = this;
        store.get('currentUser').then((result) => {
            let currentContributions = -1;
            let newContributions = -1;
            if (result !== null && result !== undefined && result.contributions !== undefined) {
                currentContributions = result.contributions;
                newContributions = currentContributions + addedContributions;
                store.update('currentUser', {
                    contributions: newContributions,
                }).then((data) => {
                    parent.refreshContributions();
                });

                // add the added contributions in firebase (never override with local value bc it might reset)
                if (con.isOnline()) {
                    if (myUserRef) {
                        // FIXME: this doesn't really solve the problem.
                        // We should use firebase to automatically sync client & DB
                        myUserRef.transaction((user) => {
                            if (user) {
                                user.contributions += addedContributions;
                            }
                            return user;
                        });
                    }
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
    addGroupComplete(project, group) {
        const parent = this;

        /**
         * Add the distance of this map to your current level
         */
        const projKey = `project-${project}-group-${group}`;
        // this.addToIgnoreList(projKey);
        store.get(projKey).then((result) => {
            if (result !== null && result !== undefined && result.group !== undefined) {
                const distancePerTile = parent.getSquareKilometersForZoomLevelPerTile(result.group.zoomLevel);
                console.log(`Distance per tile was:${distancePerTile}`);
                console.log(`group count was:${result.group.count}`);
                this.updateMappedDistance(Math.ceil(result.group.count * distancePerTile));
            }
        });


        return new Promise(((resolve, reject) => {
            const obj = {
                groupId: group,
                projectId: project,
            };

            // remove the group from the cache

            // add the group to the group completes object
            store.get('groupCompletes').then((result) => {
                if (result !== null && result !== undefined) {
                    result.groups.push(obj);

                    store
                        .save('groupCompletes', {
                            // initialize the
                            groups: result.groups,
                        }).then((status) => {
                        // we've now stored the object and referenced it in the project
                            console.log('Storing groups');
                            console.log(obj);
                            parent.removeGroup(project, group).then((data) => {
                                resolve();
                                const key = `project-${project}-group-${group}`;
                                parent.removeOfflineGroup(key);
                            });
                        });
                } else {
                    // if the project store is not yet found, find it.
                    store
                        .save('groupCompletes', {
                            // initialize the
                            groups: [obj],
                        }).then((status) => {
                        // we've now stored the object and referenced it in the project
                            console.log('Storing complete group');
                            console.log(obj);
                            parent.removeGroup(project, group).then((data) => {
                                resolve();
                            });
                        })
                        .catch((error) => {
                            console.log("Couldn't store group complete");
                        });
                }
            });
        }));
    },

    distance: -1,

    /**
     * After the user has his/her session, this will get the latest mapping data. If the local distance is greater, it'll update firebase and ues the local one
     * If offline, it'll also use the local one
     * If on firebase is larger, it'll use firebase's and turn yours to that one
     */
    refreshDistance() {
        const parent = this;
        store.get('currentUser').then((data) => {
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
        const parent = this;
        store.get('currentUser').then((data) => {
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
            username: '',
        }).then((data) => {
            auth.logOut();
        });
    },

    getDistance() {
        return this.distance;
    },

    getContributions() {
        return this.contributions;
    },

    /**
     * Gets the remote user object and compares it to the local one, updates any outdated values in both
     * @param remoteObj
     */
    compareAndUpdate() {
        myUserRef = database.ref(`/users/${auth.getUser().uid}`);
        console.log('compareAndUpdate user', myUserRef);

        const parent = this;
        myUserRef.once('value', (data) => {
            const remoteObj = data.val();
            console.log('remote data obj');
            console.log(remoteObj);
            store.get('currentUser').then((local) => {
                if (local !== null && local !== undefined && local.distance !== undefined && local.contributions !== undefined) {
                    // IMPORTANT PART!
                    const localDistance = local.distance;
                    const remoteDistance = remoteObj.distance;
                    const localContributions = local.contributions;
                    const remoteContributions = remoteObj.contributions;

                    console.log(`remote distance:${remoteDistance}`);
                    console.log(`local distance:${localDistance}`);

                    // compare and sync the necessary objects

                    // distance mapped
                    if (localDistance > remoteDistance) {
                        myUserRef.update({
                            distance: localDistance,
                        });
                        parent.refreshDistance();
                    } else if (remoteDistance > localDistance) {
                        store.update('currentUser', {
                            distance: remoteDistance,
                        }).then((data) => {
                            parent.refreshDistance();
                        });
                    } else {
                        parent.refreshDistance();
                    }

                    console.log(`remote contributions:${remoteContributions}`);
                    console.log(`local contributions:${localContributions}`);
                    // contributions
                    if (localContributions > remoteContributions) {
                        myUserRef.update({
                            contributions: localContributions,
                        });
                        parent.refreshContributions();
                    } else if (remoteContributions > localContributions) {
                        store.update('currentUser', {
                            contributions: remoteContributions,
                        }).then((data) => {
                            parent.refreshContributions();
                        });
                    } else {
                        parent.refreshContributions();
                    }
                } else {
                    store.update('currentUser', remoteObj).then((data) => {
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
        const parent = this;
        store.get('offlineGroups').then((data) => {
            console.log('setting offline groups', data);
            if (data !== null && data !== undefined && data.offlineGroups !== undefined) {
                parent.offlineGroups = data.offlineGroups;
            }
        });
    },

    /**
     * Whether we should open the popup
     */
    openPopup(state) {
        const parent = this;

        return new Promise(((resolve, reject) => {
            // this will throw, x does not exist


            store.get('popupWatched').then((result) => {
                if (result !== null && result !== undefined) {
                    resolve();
                } else {
                    reject();
                }
            });
        }));
    },

    stopPopup() {
        store.update('popupWatched', {
            watched: true,
        });
    },
    /**
     * Handles the initial loading of the app (what we consider login) to see if the user has already used Mapswipe before.
     * @returns {Promise}
     */
    offlineGroups: [],
    interval: null,

    setupConnection(state) {
        con.initializeWithState(state);
        this.refreshOfflineGroups();
    },

    /**
     * Gets the projects available to the user. If no projects are stored AND the user is offline, we return an error.
     *
     * @returns {Promise}
     */
    getProjects() {
        function sortObject(obj) {
            return Object.keys(obj).sort().reduce((result, key) => {
                result[key] = obj[key];
                return result;
            }, {});
        }

        console.log('getting projects');
        return new Promise(((resolve, reject) => {
            {
                if (con.isOnline()) {
                    console.log('getProjects online');
                    let pr = projectsRef.on('value', (snapshot) => {
                        console.log('getProjects snapshot', snapshot);
                        const projects = snapshot.val();
                        console.log('getProjects', projects);

                        const newCards = {
                            featuredCard: null,
                            otherCards: [],
                        };

                        let currentRow = [];
                        let projectCount = 0;
                        for (const p in projects) {
                            projectCount++;

                            const project = projects[p];
                            if (project !== undefined && project !== null && project.groupAverage !== undefined && project.state !== 3) {
                                currentRow.push(project);
                                if (newCards.featuredCard === null && currentRow[0].isFeatured) {
                                    newCards.featuredCard = currentRow[0];
                                    currentRow = [];
                                } else if (currentRow.length === 2 || projectCount >= projects.length) {
                                    newCards.otherCards.push({ cards: currentRow });
                                    currentRow = [];
                                }
                            }
                        }


                        store
                            .save('projects', {
                                cards: newCards,
                            })
                            .catch((error) => {
                                console.log('Threw error on saving new cards', error);
                            });
                        console.log('Resolving!');
                        resolve(newCards);
                    }, (dbError) => {
                        console.warn('Error while getting projects', dbError);
                    });
                    console.log('pr is', pr);
                } else {
                    console.log('Getting projects offline......');
                    store.get('projects').then((result) => {
                        if (result !== null && result !== undefined) {
                            resolve(result.cards);
                        } else {
                            reject();
                        }
                    });
                }
            }
        }));
    },
    /**
     * Gets the announcement from firebase
     *
     * @returns {Promise}
     */
    getAnnouncement() {
        return new Promise(((resolve, reject) => {
            {
                if (con.isOnline()) {
                    announcementRef.on('value', (snapshot) => {
                        resolve(snapshot.val());
                    });
                } else {
                    reject();
                }
            }
        }));
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
    startTileDownload(projectId, groups) {
        const parent = this;
        const keyGroup = [];
        console.log('Groups:');

        Object.keys(groups).forEach((groupKey) => {
            console.log(`adding to keygroup: ${groupKey}`);
            const key = `project-${projectId}-group-${groupKey}`;
            keyGroup.push(key);
        });
        Object.keys(groups).forEach((groupKey) => {
            console.log(`starting download for group ${groupKey}`);
            const groupRequestCache = {};
            const group = groups[groupKey];
            const key = `project-${projectId}-group-${groupKey}`;
            parent.isDownloading[key] = true;
            const projectKey = `project-${projectId}`;
            const projectDir = `${RNFS.DocumentDirectoryPath}/${projectId}`;
            const dir = `${projectDir}/${groupKey}`; // e.g. /1/45
            parent.totalRequestsOutstandingByGroup[key] = 0;
            if (parent.totalRequests[projectKey] === undefined) {
                parent.totalRequests[projectKey] = 0;
                parent.totalRequestsOutstanding2[projectKey] = 0;
            }
            RNFS.mkdir(projectDir).then((data) => {
                RNFS.mkdir(dir).then((data) => {
                    Object.keys(group.tasks).forEach((taskKey) => {
                        const tile = group.tasks[taskKey];


                        const fileName = `${dir}/${tile.id}.jpeg`;
                        parent.totalRequestsOutstandingByGroup[key]++;

                        parent.totalRequests[projectKey]++;
                        parent.totalRequestsOutstanding2[projectKey]++;


                        // self invoking function to ensure the state of the download when it finishes.
                        (function (tileUrl, fileName, parent, key, projectKey) {
                            RNFS.downloadFile({
                                fromUrl: tileUrl,
                                toFile: fileName,
                                background: true,
                            }).then((res) => {
                                parent.totalRequestsOutstanding2[projectKey]--;
                                parent.totalRequestsOutstandingByGroup[key]--;
                                // console.log("(success) Outstanding:" + parent.totalRequests[projectKey] + " /" + parent.totalRequestsOutstanding2[projectKey]);
                                if (parent.totalRequestsOutstanding2[projectKey] <= 0) {
                                    parent.isDownloading[key] = false;
                                    store.get('offlineGroups').then((data) => {
                                        if (data !== null && data !== undefined && data.offlineGroups !== undefined && data.offlineGroups.length > 0) {
                                            data.offlineGroups.concat(keyGroup);
                                            console.log(`added ${keyGroup} to offline groups`);

                                            store.update('offlineGroups', {
                                                offlineGroups: data.offlineGroups,
                                            }).then((data) => {
                                                parent.refreshOfflineGroups();
                                            });
                                        } else {
                                            console.log(`setting offline groups to just ${keyGroup}`);
                                            store.update('offlineGroups', {
                                                offlineGroups: keyGroup,
                                            }).then((data) => {
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
                                    console.log(`${key} has finished downloading`);
                                }
                            }).catch((error) => {
                                parent.totalRequestsOutstanding2[key]--;
                            });
                        }(tile.url, fileName, parent, key, projectKey));
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

    getTaskGroupsForProject(projectId, groupCount, taskAmount, avgGroupSize, downloadTiles) {
        const parent = this;
        return new Promise(((resolve, reject) => {
            {
                const projectKey = `project-${projectId}`;

                // we usfe this when we download large sets for offline use
                if (taskAmount !== undefined && avgGroupSize !== undefined) {
                    groupCount = Math.floor(Math.floor(taskAmount) / Math.floor(avgGroupSize));
                    console.log(`Groups set to ${groupCount} with avg group size: ${avgGroupSize} and tasks: ${taskAmount}`);
                }

                if (con.isOnline()) {
                    console.log('asking firebase for.. stuff');
                    const myGroups = groupsRef.child(`${projectId}`);

                    myGroups.orderByChild('completeCount').limitToFirst(groupCount)
                        .then(response => response.json())
                        .then((data) => {
                            const returnGroups = [];
                            if (downloadTiles === true) {
                                parent.startTileDownload(projectId, data);
                            }
                            let awaitStores = 0;

                            // first build the index so that returnGroups is filled in and gets added properly.
                            for (var idx in data) {
                                awaitStores++;
                                console.log(`Building index for group id: ${idx}`);

                                var child = data[idx];

                                if (child !== null) {
                                    var key = `project-${child.projectId}-group-${child.id}`;


                                    const groupNow = {
                                        groupId: key,
                                        projectId: child.projectId,
                                        progress: 0, // measured in xOffset, so that we can return to there.
                                        status: 0, // 0 = not started, 1 = started, 2 = finished

                                    };

                                    console.log('pushing to return groups:');
                                    console.log(groupNow);
                                    returnGroups.push(groupNow);
                                }
                            }

                            // check whether we should resolve the current promise (when we have all the groups back)

                            const checkToResolve = function () {
                                try {
                                    awaitStores--; // count down the amount of stores before we resolve the promise
                                    if (awaitStores === 0) {
                                        console.log('resolving');
                                        console.log(returnGroups);
                                        store.get(projectKey).then((result) => {
                                            if (result !== null && result !== undefined && result.groups !== undefined) {
                                                console.log('return groups is:');
                                                console.log(returnGroups);
                                                for (let i = 0; i < returnGroups.length; i++) {
                                                    let found = false;
                                                    for (let checkAgainst = 0; checkAgainst < result.groups.length; checkAgainst++) {
                                                        if (returnGroups[i].groupId === result.groups[checkAgainst].groupId) {
                                                            console.log(`prevented double group on ${returnGroups[i]}`);
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
                                                        groups: result.groups,
                                                    }).then((data) => {
                                                        console.log('groups is now:');
                                                        console.log(data);
                                                        console.log('getting just in case:');
                                                        store.get(projectKey).then((data) => {
                                                            console.log('got groups:');
                                                            console.log(data.groups);
                                                        });
                                                    })
                                                    .catch((error) => {
                                                        console.log("Couldn't store group");
                                                    });
                                            } else {
                                                // if the project store is not yet found, find it.
                                                store
                                                    .save(projectKey, {
                                                        // initialize the
                                                        groups: returnGroups,
                                                    })
                                                    .catch((error) => {
                                                        console.log("Couldn't store group");
                                                        console.log(error);
                                                    });
                                            }
                                        });
                                        resolve(returnGroups);
                                    } else {
                                        console.log(`Not resolving becuse awaitStores is ${awaitStores}`);
                                    }
                                } catch (err) {
                                    console.log('error');
                                    console.log(err);
                                }
                            };


                            // after the index is built, save them to local storage
                            for (var idx in data) {
                                console.log(`Saving group id: ${idx}`);

                                var child = data[idx];

                                if (child !== null) {
                                    var key = `project-${child.projectId}-group-${child.id}`;
                                    // store the group by its key
                                    store
                                        .save(key, {
                                            group: child,
                                        }).then((data) => {
                                            console.log('checking to resolve333!');
                                            checkToResolve();
                                        });
                                }
                            }
                        });
                } else {
                    console.log("we're offline");
                    reject({
                        offline: true,
                    });
                }
            }
        }));
    },

    /**
     * Removes a group
     */
    removeGroup(projectId, groupId) {
        return new Promise(((resolve, reject) => {
            // this will throw, x does not exist
            const projectKey = `project-${projectId}`;
            store.get(projectKey).then((result) => {
                if (result !== null && result !== undefined && result.groups !== undefined) {
                    console.log(`Pre-removal-length${result.groups.length}`);
                    // remove the group from memory.
                    const groupKey = `project-${projectId}-group-${groupId}`;
                    let index = -1;
                    for (let i = 0; i < result.groups.length; i++) {
                        console.log(groupKey);
                        if (result.groups[i].groupId === groupKey) {
                            index = i;
                        }
                    }

                    console.log(`Removing project from project key: ${groupKey}`);


                    if (index > -1) {
                        result.groups.splice(index, 1);
                    }
                    console.log(`Post-removal-length${result.groups.length}`);
                    store
                        .save(projectKey, {
                            groups: result.groups,
                        }).then((status) => {
                            store
                                .delete(groupKey).then((status) => {
                                    console.log(`Fully deleted group ${groupKey}`);
                                    resolve();
                                }).catch((error) => {
                                    console.log('Error but resolving anyways');
                                    console.log(error);
                                    resolve();
                                });
                        });
                }
            });
        }));
    },

    /**
     * Removes an obj from the groupCompletes
     */
    removeGroupSync(projectId, groupId) {
        return new Promise(((resolve, reject) => {
            // this will throw, x does not exist
            const projectKey = `project-${projectId}`;
            store.get(projectKey).then((result) => {
                if (result !== null && result !== undefined && result.groups !== undefined) {
                    console.log(`Pre-removal-length${result.groups.length}`);
                    // remove the group from memory.
                    const groupKey = `project-${projectId}-group-${groupId}`;
                    let index = -1;
                    for (let i = 0; i < result.groups.length; i++) {
                        console.log(groupKey);
                        if (result.groups[i].groupId === groupKey) {
                            index = i;
                        }
                    }

                    console.log(`Removing project from project key: ${groupKey}`);


                    if (index > -1) {
                        result.groups.splice(index, 1);
                    }
                    console.log(`Post-removal-length${result.groups.length}`);
                    store
                        .save(projectKey, {
                            groups: result.groups,
                        }).then((status) => {
                            store
                                .delete(groupKey).then((status) => {
                                    console.log(`Fully deleted group ${groupKey}`);
                                    resolve();
                                }).catch((error) => {
                                    console.log('Error but resolving anyways');
                                    console.log(error);
                                    resolve();
                                });
                        });
                }
            });
        }));
    },

    /**
     * Whether the have the group in memory already
     * @param key
     * @returns {boolean}
     */

    isOfflineGroup(key) {
        for (let i = 0; i < this.offlineGroups.length; i++) {
            if (this.offlineGroups[i] === key) {
                console.log(`found offline group!${key}`);
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
        for (let i = 0; i < this.offlineGroups.length; i++) {
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
        const parent = this;
        console.log(`Checking for open downloads on ${project}`);
        if (this.totalRequestsOutstanding2[project] === undefined) {
            return false;
        } if (parent.totalRequestsOutstanding2[project] > 0) {
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
        console.log('made it to remove offline group');
        const projectAndGroup = key.split('-group-');
        const projectId = projectAndGroup[0].replace('project-', '');
        const groupId = `${projectAndGroup[1]}`;
        console.log(`Gonna remove ${projectAndGroup} -> ${projectId} ->${groupId}`);
        for (let i = 0; i < this.offlineGroups.length; i++) {
            if (this.offlineGroups[i] === key) {
                console.log(`FOUND!! remove ${projectAndGroup} -> ${projectId} ->${groupId}`);
                this.offlineGroups.splice(i, 1);
                store.update('offlineGroups', {
                    offlineGroups: this.offlineGroups,
                }).then((data) => {
                    const path = `${RNFS.DocumentDirectoryPath}/${projectId}/${groupId}`;

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
                });
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
        const parent = this;
        console.log(`removing project with key${key}`);
        let found = 0;
        for (let i = 0; i < parent.offlineGroups.length; i++) {
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
        const parent = this;
        console.log(`removing project with key${key}`);
        store.delete(key);
    },
    /**
     * This promise gets the best group to return to the mapper at any given time. It will get new groups if necessary, and return the groups in storage if we're offline.
     * @param projectId
     * @returns {Promise}
     */
    getSingleGroup(projectId) {
        const parent = this;
        return new Promise(((resolve, reject) => {
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

                const pickBestGroup = function (groups, projectId) {
                    let toReturn = null;
                    for (const key in groups) {
                        const group = groups[key];
                        console.log(`Checking to see if ${group.groupId} is an offline group`);
                        if (parent.isOfflineGroup(group.groupId)) {
                            console.log(`${group.groupId} is an offline group`);
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

                const getGroup = function (key) {
                    store.get(key).then((result) => {
                        if (result !== null && result !== undefined && result.group !== undefined) {
                            console.log('giving back:');
                            resolve(result);
                        } else {
                            console.log('Show error because the group was not found in memory');
                            const chunks = key.split('-'); // example key is project-1-group-2 so we can split and get [1] and [3]
                            const project = chunks[1];
                            const group = chunks[3];
                            parent.removeGroup(project, group).then((data) => {
                                console.log(`Removed a group...${project} - ${group}`);
                                reject();
                            });
                        }
                    });
                };

                // TODO delete old groups

                const projectKey = `project-${projectId}`;
                const idealLocalGroupCount = 3; // todo put this back at 5 or soo

                // get the groups that are available for rendering/processing, show the ones that are already available offline first
                store.get(projectKey).then((result) => {
                    try {
                        console.log('uhh local store???');
                        if (!con.isOnline() || result !== null && result !== undefined && result.groups !== undefined && result.groups.length > 0 && pickBestGroup(result.groups, projectId) !== null) { // we have enough to work with, or we're offline, so we won't get more...
                            const groupCount = result.groups.length;
                            console.log(`We have ${groupCount} groups available for processing`);

                            getGroup(pickBestGroup(result.groups, projectId));
                        } else { // we need more groups
                            console.log('Not enough groups, getting them');
                            let newGroupsToGet = idealLocalGroupCount;
                            if (result !== null && result !== undefined && result.groups !== undefined) {
                                newGroupsToGet -= result.groups.length; // we never want more than 5 in cache.
                            }
                            // project data is not available, get groups and return the best one for processing
                            parent.getTaskGroupsForProject(projectId, newGroupsToGet).then((data) => {
                                console.log('picking best group');
                                getGroup(pickBestGroup(data));
                            }).catch((error) => {
                                console.log(error);
                            });
                        }
                    } catch (err) {
                        console.log('error???');
                        console.log(err);
                    }
                });
            }
        }));
    },


};

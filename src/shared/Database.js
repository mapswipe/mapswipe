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

export default {

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
     * These functions determine whether there is a level up that needs to be popped up.
     */

    pendingLvlUp: -1,

    getPendingLevelUp() {
        return this.pendingLvlUp;
    },

    setPendingLevelUp(val) {
        this.pendingLvlUp = val;
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
     * Returns the firebase timestamp
     * @returns {rf.TIMESTAMP|{[.sv]}|sf.TIMESTAMP}
     */
    getTimestamp() {
        return firebase.database.ServerValue.TIMESTAMP;
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

                    myGroups.orderByChild('completedCount').limitToFirst(1).once('value')
                        .then(response => response.val())
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
     * Removes a project completely
     */
    removeProject(key) {
        console.log(`removing project with key${key}`);
    },

};

export function getSqKmForZoomLevelPerTile(zoomLevel) {
    if (zoomLevel === 23) {
        return 2.29172838e-5;
    } if (zoomLevel === 22) {
        return 9.11795814e-5;
    } if (zoomLevel === 21) {
        return 0.000364718326;
    } if (zoomLevel === 20) {
        return 0.00146082955;
    } if (zoomLevel === 19) {
        return 0.00584331821;
    } if (zoomLevel === 18) {
        return 0.0233732728; // (((0.5972 * 256) ^ 2) / (1000 ^ 2))
    } if (zoomLevel === 17) {
        return 0.0934774368;
    } if (zoomLevel === 16) {
        return 0.373941056;
    } if (zoomLevel === 15) {
        return 1.4957016;
    } if (zoomLevel === 14) {
        return 5.98280642;
    } if (zoomLevel === 13) {
        return 23.9314761;
    } else if (zoomLevel === 12) {
        return 95.7254037;
    }
}

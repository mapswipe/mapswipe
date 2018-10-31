import React from 'react';
import { Platform, Dimensions } from 'react-native';

import { store } from './store';
import { authStatusAvailable } from './actions/index';

class AuthManager {
    /**
     * Constructor is called every time the object is initialized
     * @param firebase  the firebase connection
     */

    constructor(firebase) {
        this.firebase = firebase;
        this.hasReceivedLoginStatus = false;

        // get current auth object from the store
        // if no auth object found, or the current auth object is invalid, we will request a new one
    }

    /**
     * Creates an account in firebase
     * @param email
     * @param username
     * @param password
     * @returns {Promise}
     */

    createAccount(email, username, password) {
        const that = this;
        return new Promise(((resolve, reject) => {
            {
                that.firebase.auth().onAuthStateChanged((user) => {
                    if (user) {
                        that.setUsername(username);
                        resolve();
                    } else {
                        console.log('not signed in..');
                    }
                });

                console.log(`authing with:${email} - ` + ` - ${username} - ` + ` ${password}`);
                that.firebase.auth().createUserWithEmailAndPassword(email, password).catch((error) => {
                    // Handle Errors here.
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    reject(errorMessage);
                });
            }
        }));
    }

    /**
     * Signs in
     * @param email
     * @param password
     * @returns {Promise}
     */

    signIn(email, password) {
        const that = this;
        return new Promise(((resolve, reject) => {
            {
                that.firebase.auth().onAuthStateChanged((user) => {
                    if (user) {
                        resolve();
                    } else {
                        console.log('not signed in..');
                    }
                });

                that.firebase.auth().signInWithEmailAndPassword(email, password).catch((error) => {
                    // Handle Errors here.
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    reject(errorMessage);
                });
            }
        }));
    }

    /**
     * Reset your password
     * @param email
     * @returns {Promise}
     */
    resetPass(email) {
        const that = this;
        return new Promise(((resolve, reject) => {
            {
                that.firebase.auth().sendPasswordResetEmail(email).then(() => {
                    console.log('reset pass resolving');
                    resolve();
                }, (error) => {
                    console.log('reset pass threw error');
                    console.log(error);
                    reject(error.message);
                });
            }
        }));
    }

    /**
     * Gets the current user object the user is logged in as
     * @returns {firebase.User|null|*}
     */

    getUser() {
        return this.firebase.auth().currentUser;
    }

    /**
     * Returns whether the user is logged in or not
     * @returns {boolean}
     */
    isLoggedIn() {
        const user = this.firebase.auth().currentUser;
        console.log(`user logged in said: ${user != null}`);
        return user != null;
    }

    /**
     * Log the use rout
     */

    logOut() {
        console.log('logging out');

        this.firebase.auth().signOut().then(() => {
            console.log('Logged out');
        }, (error) => {
            // An error happened.
        });
    }

    /**
     * Set the username of the user after registration
     * @param username
     */
    setUsername(username) {
        const user = this.firebase.auth().currentUser;
        user.updateProfile({
            displayName: username,
        }).then(() => {
            console.log(user.displayName);
        }, (error) => {
            // An error happened.
        });
    }


    /**
     * Whether we have received a log in status from firebase
     * @returns {boolean}
     */
    receivedLoginStatus() {
        return this.hasReceivedLoginStatus;
    }

    /**
     * Adds listeners so we can set the receivedLoginStatus
     */

    addListeners() {
        console.log('added listeners');
        const that = this;
        this.firebase.auth().onAuthStateChanged((user) => {
            that.hasReceivedLoginStatus = true;
            store.dispatch(authStatusAvailable(user));
            // FIXME: remove all this logging
            if (user) {
                console.log("Listener: we're signed in");
            } else {
                console.log('Listener: not signed in..');
            }
        });
    }
}

module.exports = AuthManager;

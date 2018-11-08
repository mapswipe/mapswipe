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
     * Gets the current user object the user is logged in as
     * @returns {firebase.User|null|*}
     */

    getUser() {
        const user = this.firebase.auth().currentUser;
        console.log('getUser', user);
        return user;
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
     * Whether we have received a log in status from firebase
     * @returns {boolean}
     */
    receivedLoginStatus() {
        return this.hasReceivedLoginStatus;
    }
}

module.exports = AuthManager;

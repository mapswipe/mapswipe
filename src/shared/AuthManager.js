import React from "react";
import {Platform, Dimensions} from "react-native";

class AuthManager {

    /**
     * Constructor is called every time the object is initialized
     * @param firebase  the firebase connection
     */

    constructor(firebase) {
        this.firebase = firebase;
        this.hasReceivedLoginStatus = false;
        console.warn("Auth manager initialized", firebase);

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
        var that = this;
        return new Promise(function (resolve, reject) {
            {

                that.firebase.auth().onAuthStateChanged(function (user) {
                    if (user) {
                        that.setUsername(username);
                        resolve();
                    } else {
                        console.log("not signed in..");
                    }
                });

                console.log("authing with:" + email + " - " + " - " + username + " - " + " " + password);
                that.firebase.auth().createUserWithEmailAndPassword(email, password).catch(function (error) {
                    // Handle Errors here.
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    reject(errorMessage);
                });
            }
        })
    }

    /**
     * Signs in
     * @param email
     * @param password
     * @returns {Promise}
     */

    signIn(email, password) {
        var that = this;
        return new Promise(function (resolve, reject) {
            {

                that.firebase.auth().onAuthStateChanged(function (user) {
                    if (user) {
                        resolve();
                    } else {
                        console.log("not signed in..");
                    }
                });

                that.firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
                    // Handle Errors here.
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    reject(errorMessage);
                });
            }
        })
    }

    /**
     * Reset your password
     * @param email
     * @returns {Promise}
     */
    resetPass(email) {
        var that = this;
        return new Promise(function (resolve, reject) {
            {

                that.firebase.auth().sendPasswordResetEmail(email).then(function () {
                    console.log("reset pass resolving");
                    resolve();
                }, function (error) {
                    console.log("reset pass threw error");
                    console.log(error);
                    reject(error.message)
                });
            }
        })
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
        var user = this.firebase.auth().currentUser;
        console.log("user logged in said: " + (user != null));
        return user != null;
    }

    /**
     * Log the use rout
     */

    logOut() {
        console.log("logging out");

        this.firebase.auth().signOut().then(function () {
            console.log("Logged out");
        }, function (error) {
            // An error happened.
        });
    }

    /**
     * Set the username of the user after registration
     * @param username
     */
    setUsername(username) {
        var user = this.firebase.auth().currentUser;
        user.updateProfile({
            displayName: username
        }).then(function () {
            console.log(user.displayName);
        }, function (error) {
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
        console.log("adde listeners");
        var that = this;
        this.firebase.auth().onAuthStateChanged(function (user) {
            that.hasReceivedLoginStatus = true;
            if (user) {
                console.log("we're signed in");
                console.log((that.isLoggedIn()) + " login status");
            } else {
                console.log("not signed in..");
            }
        });
    }

}

module.exports = AuthManager;

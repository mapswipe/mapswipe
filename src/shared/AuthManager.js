// @flow

class AuthManager {
    /**
     * Constructor is called every time the object is initialized
     * @param firebase  the firebase connection
     */

    constructor(firebase: Object) {
        this.firebase = firebase;
        this.hasReceivedLoginStatus = false;

        // get current auth object from the store
        // if no auth object found, or the current auth object is invalid, we will request a new one
    }

    firebase: Object;

    hasReceivedLoginStatus: boolean;

    /**
     * Gets the current user object the user is logged in as
     * @returns {firebase.User|null|*}
     */

    getUser() {
        const user = this.firebase.auth().currentUser;
        return user;
    }

    /**
     * Returns whether the user is logged in or not
     * @returns {boolean}
     */
    isLoggedIn() {
        const user = this.firebase.auth().currentUser;
        return user != null;
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

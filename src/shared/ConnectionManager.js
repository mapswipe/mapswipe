import {Platform, Dimensions, NetInfo} from "react-native";

class ConnectionManager {


    /**
     * Whether the user is online or not, currently does not take into account bad cellphone receiption
     * @returns {boolean}
     */
    isOnline() {
        // FIXME: force it for now
        return true;
      //return this.networkState.indexOf('none') === -1 && this.networkState.indexOf('NONE') === -1;
    }

    /**
     * Whether the user is on wifi
     * @returns {boolean}
     */
    isOnWifi() {
      // FIXME: use real data here
        return true;
      //return this.networkState.toLowerCase().indexOf('wifi') !== -1;
    }

    /**
     * Constructor is called when the class is initialized
     */
    constructor() {
        console.log("Initialized connection manager");
    }

    initializeWithState(networkState) {

        this.networkState = networkState;
        var parent = this;

        console.log("Connection manager initialized");

        var handler = function (reach) {
            parent.networkState = reach;

        };

        NetInfo.addEventListener(
            'connectionChange',
            handler
        );
    }

}

module.exports = ConnectionManager;

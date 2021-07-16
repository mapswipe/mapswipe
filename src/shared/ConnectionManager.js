// @flow
import NetInfo from '@react-native-community/netinfo';

class ConnectionManager {
    constructor() {
        this.networkState = 'unknown';
        const parent = this;

        console.log('Connection manager initialized');

        NetInfo.addEventListener(state => {
            parent.networkState = state.type;
        });
    }

    networkState: string;

    /**
     * Whether the user is online or not,
     * currently does not take into account bad cellphone receiption
     * @returns {boolean}
     */
    isOnline(): boolean {
        return this.networkState !== 'none';
    }

    /**
     * Whether the user is on wifi
     * @returns {boolean}
     */
    isOnWifi(): boolean {
        return this.networkState === 'wifi';
    }
}

const cm: ConnectionManager = new ConnectionManager();

export default cm;

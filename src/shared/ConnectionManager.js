import { NetInfo } from 'react-native';

class ConnectionManager {
    constructor() {
        this.networkState = 'unknown';
        const parent = this;

        console.log('Connection manager initialized');

        const handler = (connectionInfo) => {
            parent.networkState = connectionInfo.type;
        };

        NetInfo.addEventListener(
            'connectionChange',
            handler,
        );
    }

    /**
     * Whether the user is online or not,
     * currently does not take into account bad cellphone receiption
     * @returns {boolean}
     */
    isOnline() {
        return this.networkState !== 'none';
    }

    /**
     * Whether the user is on wifi
     * @returns {boolean}
     */
    isOnWifi() {
        return this.networkState === 'wifi';
    }
}

const cm = new ConnectionManager();

export default cm;

import AsyncStorage from '@react-native-async-storage/async-storage';
import { healthCheckEndpoint } from './constants';

const CSRF_KEY = 'csrf_token';
const CSRF_COOKIE_NAME_KEY = 'csrf_cookie_name';

export async function fetchCsrfToken() {
    try {
        const response = await fetch(healthCheckEndpoint, {
            method: 'GET',
            credentials: 'include',
        });

        const setCookie = response.headers.get('set-cookie');

        if (setCookie) {
            // Match MAPSWIPE-...-CSRFTOKEN
            const match = setCookie.match(/(MAPSWIPE-\w+-CSRFTOKEN)=([^;]+)/);

            if (match && match[2]) {
                const cookieName = match[1];
                const csrfToken = match[2];
                await AsyncStorage.setItem(CSRF_COOKIE_NAME_KEY, cookieName);
                await AsyncStorage.setItem(CSRF_KEY, csrfToken);
                return csrfToken;
            }
            return null;
        }
    } catch (err) {
        console.error('Failed to fetch CSRF token', err);
        return null;
    }
    return null;
}

export async function getCsrfToken() {
    return AsyncStorage.getItem(CSRF_KEY);
}

export async function getCsrfCookieName() {
    return AsyncStorage.getItem(CSRF_COOKIE_NAME_KEY);
}

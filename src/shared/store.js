import { createStore } from 'redux'
import reducers from './reducers/index'

export const store = createStore(
    reducers,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
);

export default function setupStore() {
    return store;
}

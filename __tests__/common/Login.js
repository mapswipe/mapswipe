import React from 'react';
import { Provider } from 'react-redux';
import { render, wait } from 'native-testing-library';
import Login from '../../src/shared/views/Login';
import { createNewStore } from '../../src/shared/store';

test('Renders sign up screen before auth ready', async () => {
    // this only renders the loading icon, as auth is not ready yet
    const l = <Provider store={createNewStore()}><Login /></Provider>;
    const { asJSON, baseElement, queryByTestId } = render(l);
    await wait(() => queryByTestId('loading-icon'));
    expect(queryByTestId('loading-icon')).toBeTruthy();
    expect(asJSON(baseElement)).toMatchSnapshot();
});

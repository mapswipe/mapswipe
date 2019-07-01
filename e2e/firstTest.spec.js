/* global by, device, element, waitFor */
describe('Example', () => {
    let ciUsername;
    let ciEmail;
    let ciPassword;

    beforeAll(async () => {
        // create a random user account that we'll use across the tests
        const timestamp = new Date().getTime();
        ciUsername = `ci_user_${timestamp}`;
        ciEmail = `ci_user_${timestamp}@example.com`;
        ciPassword = `password_${timestamp}`;
    });

    beforeEach(async () => {
        // restart the app between each test case
        await device.reloadReactNative();
    });

    it('should open on the signup screen', async () => {
        await expect(element(by.id('signup_screen'))).toBeVisible();
    });

    it('should switch to login and password reset screens', async () => {
        await expect(element(by.id('signup_screen'))).toBeVisible();
        await element(by.id('signup_screen')).scrollTo('bottom');
        await expect(element(by.id('signup_to_login_button'))).toBeVisible();
        await element(by.id('signup_to_login_button')).tap();
        await expect(element(by.id('login_screen'))).toBeVisible();
        await element(by.id('login_screen')).scrollTo('bottom');
        await element(by.id('login_to_password_button')).tap();
        await expect(element(by.id('forgot_password_screen'))).toBeVisible();
    });

    const signup = async (username, email, password) => {
        // fill in the signup form and tap "sign up"
        await expect(element(by.id('signup_screen'))).toBeVisible();
        await element(by.id('signup_screen')).scroll(150, 'down');
        await element(by.id('signup_username')).typeText(username);
        await element(by.id('signup_email')).typeText(email);
        await element(by.id('signup_screen')).scroll(100, 'down');
        await element(by.id('signup_password')).typeText(password);
        await element(by.id('signup_password')).tapReturnKey();
        await element(by.id('signup_screen')).scrollTo('bottom');
        await element(by.id('signup_button')).tap();
        // atIndex below is added to deal with the fact that 2 <Text> elements are
        // somehow matched. This may be a bug in scrollable-tab-view or linked
        // to the updated rendering happening each time firebase updates the local
        // data. In any case, this allows the test to pass
        await expect(element(by.id('recommended_cards_view')).atIndex(1)).toBeVisible();
    };

    const login = async (email, password) => {
        // fill in the signup form and tap "sign up"
        await expect(element(by.id('signup_screen'))).toBeVisible();
        await element(by.id('signup_screen')).scrollTo('bottom');
        await element(by.id('signup_to_login_button')).tap();
        await element(by.id('login_email')).typeText(email);
        await element(by.id('login_screen')).scroll(150, 'down');
        await element(by.id('login_password')).typeText(password);
        await element(by.id('login_password')).tapReturnKey();
        await element(by.id('login_screen')).scrollTo('bottom');
        await element(by.id('login_button')).tap();
        await waitFor(element(by.id('recommended_cards_view'))).toBeVisible().withTimeout(15000);
    };

    it('should create an account', async () => {
        await signup(ciUsername, ciEmail, ciPassword);
    });

    it('should login and see list of projects', async () => {
        await login(ciEmail, ciPassword);
    });

    afterAll(async () => {
        // erase all accounts created during the tests
    });
});

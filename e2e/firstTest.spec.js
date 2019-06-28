describe('Example', () => {
    beforeEach(async () => {
        console.log('beforeEach');
        console.log('here', device);
        //await device.reloadReactNative();
    });

    it('should open on the signup screen', async () => {
        await expect(element(by.id('signup_screen'))).toBeVisible();
    });
    /*
  it('should show hello screen after tap', async () => {
    await element(by.id('hello_button')).tap();
    await expect(element(by.text('Hello!!!'))).toBeVisible();
  });

  it('should show world screen after tap', async () => {
    await element(by.id('world_button')).tap();
    await expect(element(by.text('World!!!'))).toBeVisible();
  });
  */
});

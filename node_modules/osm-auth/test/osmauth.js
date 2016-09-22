describe('osmauth', function() {

    beforeEach(function() {
        localStorage.clear();
    });

    describe('.options', function() {
        it('gets and sets new options', function() {
            var keys = {
                oauth_secret: '9WfJnwQxDvvYagx1Ut0tZBsOZ0ZCzAvOje3u1TV0',
                oauth_consumer_key: 'WLwXbm6XFMG7WrVnE8enIF6GzyefYIN6oUJSxG65'
            };

            var auth = osmAuth(keys);
            expect(auth.options()).to.eql(keys);

            auth.options({url: 'foo'});
            expect(auth.options().url).to.eql('foo');
        });
    });

    describe('pre authorization', function() {
        it('is not initially authorized', function() {
             var auth = osmAuth({
                 oauth_secret: '9WfJnwQxDvvYagx1Ut0tZBsOZ0ZCzAvOje3u1TV0',
                 oauth_consumer_key: 'WLwXbm6XFMG7WrVnE8enIF6GzyefYIN6oUJSxG65'
             });
             expect(auth.authenticated()).to.eql(false);
         });

         it('can be preauthorized', function() {
             var auth = osmAuth({
                 oauth_secret: '9WfJnwQxDvvYagx1Ut0tZBsOZ0ZCzAvOje3u1TV0',
                 oauth_consumer_key: 'WLwXbm6XFMG7WrVnE8enIF6GzyefYIN6oUJSxG65',
                 oauth_token: 'foo',
                 oauth_token_secret: 'foo'
             });
             expect(auth.authenticated()).to.eql(true);
         });
     });
});

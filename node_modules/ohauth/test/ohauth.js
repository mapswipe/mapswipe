if (typeof require !== 'undefined') {
    expect = require('expect.js');
    ohauth = require('../');
}

describe('ohauth', function() {
    describe('#qsString', function() {
        it('turns an object into a querystring', function() {
            expect(ohauth.qsString({ foo: 1 })).to.eql('foo=1');
        });
        it('escapes special characters', function() {
            expect(ohauth.qsString({ "!'*()": "!'*()" })).to.eql('%21%27%2A%28%29=%21%27%2A%28%29');
        });
    });

    describe('#stringQs', function() {
        it('turns a querystring into an object', function() {
            expect(ohauth.stringQs('foo=1')).to.eql({ foo: 1 });
        });
        it('handles special characters', function() {
            expect(ohauth.stringQs('%21%27%2A%28%29=%21%27%2A%28%29')).to.eql({ "!'*()": "!'*()" });
        });
    });

    describe('#nonce', function() {
        it('generates a 6-character nonce', function() {
            expect(ohauth.nonce().length).to.eql(6);
        });
    });

    describe('#authHeader', function() {
        it('encodes an auth header', function() {
            expect(ohauth.authHeader({ foo: 'bar' })).to.eql('foo="bar"');
        });
    });

    describe('#timestamp', function() {
        it('generates a numeric timestamp', function() {
            expect(ohauth.timestamp()).to.be.an('number');
        });
        it('generates an integer timestamp', function() {
            expect(ohauth.timestamp() % 1).to.eql(0);
        });
    });

    describe('#percentEncode', function() {
        it('encodes spaces', function() {
            expect(ohauth.percentEncode('foo bar')).to.eql('foo%20bar');
        });
    });

    describe('#headerGenerator', function() {
        it('generates a header function', function() {
            expect(ohauth.headerGenerator({})).to.be.a(Function);
            expect(ohauth.headerGenerator({})('GET', 'http://foo.com/')).to.be.a.string;
        });
    });
});

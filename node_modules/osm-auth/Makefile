all: osmauth.min.js

osmauth.js: index.js package.json
	node_modules/.bin/browserify index.js -s osmAuth > osmauth.js

osmauth.min.js: osmauth.js
	node_modules/.bin/uglifyjs osmauth.js -c > osmauth.min.js

clean:
	rm osmauth.*

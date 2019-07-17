function fixXcodeSimulatorSearchString() {
    const fs = require('fs');
    const filePath = 'node_modules/react-native/local-cli/runIOS/findMatchingSimulator.js';
    fs.readFile(filePath, 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }

        let result = data.replace(/startsWith/g, "includes");
        fs.writeFile(filePath, result, 'utf8', function (error) {
            if (error) return console.log(error);
        });
    });
}

console.log('Remove scripts/postinstall.js if the iOS simulator works');
// fixXcodeSimulatorSearchString();

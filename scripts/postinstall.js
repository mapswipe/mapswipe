function fixXcodeSimulatorSearchString() {
    const fs = require('fs');
    const filePath = 'node_modules/react-native/local-cli/runIOS/findMatchingSimulator.js';
    fs.readFile(filePath, 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }


        let result = data.replace(/!version.startsWith('iOS')/g, "!version.includes('iOS')");
        result = result.replace(/!version.startsWith('tvOS')/g, "!version.includes('tvOS')");
        fs.writeFile(filePath, result, 'utf8', function (error) {
            if (error) return console.log(error);
        });
    });
}


fixXcodeSimulatorSearchString();

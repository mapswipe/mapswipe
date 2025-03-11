#!/usr/bin/env node
// Prompts the user for input to construct their own ./config.json

const fs = require('fs');

function prompt(question) {
    return new Promise((resolve, reject) => {
        const { stdin, stdout } = process;
        stdin.resume();
        stdout.write(question);
        stdin.on('data', data => {
            console.log(data);
            const key = data.toString().trim();
            if (key.length < 1) {
                const err = `input ${key} was too short to be a key`;
                reject(err);
                return;
            }
            resolve(key);
        });
        stdin.on('error', err => reject(err));
    });
}

function writeConfig(data) {
    return new Promise(function (resolve, reject) {
        fs.writeFile(
            `${__dirname}/config.json`,
            JSON.stringify(data),
            function (err) {
                if (err) reject(err);
                else resolve(data);
            },
        );
    });
}

console.log(`
Before running, ensure you have the following files in place

- android/app/google-services.json
- ios/cfg/GoogleService-Info.plist
`);

const firebaseConfig = require('./android/app/google-services.json');

const config = {};

const projectID = firebaseConfig.project_info.project_id;
// senderID is almost always the project number
config.senderID = firebaseConfig.project_info.project_number;

config.firebaseConfig = {
    databaseURL: firebaseConfig.project_info.firebase_url,
    storageBucket: `${projectID}.firebaseapp.com`,
    authDomain: `${projectID}.firebaseapp.com`,
};

config.senderID = firebaseConfig.project_info.project_number;

prompt(`Please paste your web API key from the Firebase Console

Visit https://console.firebase.google.com/ and go to
Gear > Project Settings > General (Under "Your Project" section)

API Key: `)
    .then(data => {
        config.firebaseConfig.apiKey = data;
        return writeConfig(config);
    })
    .then(data => {
        console.log('Wrote configuration to config.json');
        process.exit();
    })
    .catch(err => {
        console.log(`config.json generation failed because: ${err}`);
        process.exit(1);
    });

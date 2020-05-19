#!/usr/bin/env node
const {StreamChat} = require('stream-chat');

const {config} = require('../config');
const API_KEY = config.API_KEY;
const SECRET = config.SECRET;
const BASE_URL = config.BASE_URL;
const client = new StreamChat(API_KEY, SECRET)
if (BASE_URL) {
    client.setBaseURL(BASE_URL);
}

const [,, ...args] = process.argv;
const userId = args[0];
const userName = args[1];
const role = args[2];
const image = args[3];
const token = client.createToken(userId);

const newUser = {
    id: userId,
}

if (userName) {
    newUser.name = userName;
}

const randomSeed = getRandomInt(1, 1000);

if (image) {
    newUser.image = image;
} else {
    newUser.image = `https://picsum.photos/seed/${randomSeed}/100/100`;
}

if (role) {
    newUser.role = role;
}

client.updateUsers([newUser]).then(user => {
    console.log(`Token for ${userId} is ${token}`);
    console.log(user)
    process.exit();
});

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
 }
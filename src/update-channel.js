#!/usr/bin/env node
const {StreamChat} = require('stream-chat');

const {config} = require('../config');
const API_KEY = config.API_KEY;
const SECRET = config.SECRET;
const client = new StreamChat(API_KEY, SECRET)

const {generateName} = require('./utils');

const [,, ...args] = process.argv;
const channelId = args[0];

const channel = client.channel('messaging', channelId);
const randomSeed = getRandomInt(1, 1000);
const image = `https://picsum.photos/seed/${randomSeed}/100/100`;

channel.update({
    name: generateName(),
    image,
    frozen: true
}).then(response => {
    console.log(response);
    process.exit();
})

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
  }
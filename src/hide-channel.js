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
const channelId = args[0];

const channel = client.channel('messaging', channelId);

channel.hide('vishal').then(response => {
    console.log(response);
    process.exit();
})
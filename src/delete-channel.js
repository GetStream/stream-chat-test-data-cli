#!/usr/bin/env node
const {StreamChat} = require('stream-chat');
const {config} = require('../config');
const API_KEY = config.API_KEY;
const SECRET = config.SECRET;
const client = new StreamChat(API_KEY, SECRET)

const [,, ...args] = process.argv;
const channelId = args[0];
const client = new StreamChat('q95x9hkbyd6p', 'bp5m2eqxybrhn89ausrzmjatg56v67rd74pstmdppsy2jxp7x4s4eqn4chnq83bg')

const channel = client.channel('messaging', channelId);

channel.delete().then(response => {
    console.log(response);
    process.exit();
})
#!/usr/bin/env node
const {StreamChat} = require('stream-chat');
const {config} = require('../config');
const API_KEY = config.API_KEY;
const SECRET = config.SECRET;
const client = new StreamChat(API_KEY, SECRET)

const [,, ...args] = process.argv;
const channelId = args[0];
const moderator = args[1];

const channel = client.channel('messaging', channelId);

channel.addModerators(
    [moderator],
    {
    text: `${moderator} is now moderator!`,
        user_id: 'vishal'
    }).then(response => {
    console.log(response);
    console.log(response.members[1].user)
    process.exit();
})
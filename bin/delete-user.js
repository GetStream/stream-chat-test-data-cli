#!/usr/bin/env node
const { program } = require('commander');
const fs = require('fs');


const { StreamChat } = require('stream-chat');

program.option('-c, --config <config>', 'Config file in root directory', 'dev.config.js');
program.option('-i, --id <id>', 'Id of user');

program.parse(process.argv);

let config;
if (!fs.existsSync(`${process.cwd()}/${program.config}`)) {
  config = require(`../${program.config}`);
} else {
  config = require(`${process.cwd()}/${program.config}`);
}

const userId = program.id;

const client = new StreamChat(config.apiKey, config.secret, {
  logger: (type, msg, extra) => {
    console.log(type, msg, extra)
  }
});
if (config.baseUrl) {
  client.setBaseURL(config.baseUrl);
}

const token = client.createToken(userId);

client.deleteUser(userId, {
  hard_delete: false,
  mark_messages_deleted: false
}).then((response) => {
  console.log(response);
  process.exit();
});

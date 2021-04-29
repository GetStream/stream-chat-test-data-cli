#!/usr/bin/env node
const { program } = require('commander');
const fs = require('fs');

const chalk = require('chalk');

const { StreamChat } = require('stream-chat');

program.option('-c, --config <config>', 'Config file in root directory', 'dev.config.js');
program.option('-i, --channelId <channelId>', 'Channel id');
program.option('-u, --userId <userId>', 'user id from which channel needs to be hidden');

program.parse(process.argv);

let config;
if (!fs.existsSync(`${process.cwd()}/${program.config}`)) {
  config = require(`../${program.config}`);
} else {
  config = require(`${process.cwd()}/${program.config}`);
}

const { apiKey, secret, channelType, baseUrl } = config;
const channelId = program.channelId;
const userId = program.userId;

if (!apiKey || !secret) {
  console.log('Please add API_KEY and SECRET to config.js');
  process.exit(0);
}

if (!userId) {
  console.log(
    chalk.bgRed(
      'Please provide userId, for whome channel needs to be hidden. Use --help for all available args',
    ),
  );
  process.exit(0);
}

const client = new StreamChat(apiKey, secret, {
  timeout: 20000,
});

if (baseUrl) {
  client.setBaseURL(baseUrl);
}

const channel = client.channel(channelType, channelId);

channel.hide(userId).then((response) => {
  console.log(
    chalk.green(`\n✓ Channel "${channelId}" hidden succesfully for user "${userId}" !\n`),
  );
  process.exit();
});

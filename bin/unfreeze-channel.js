#!/usr/bin/env node
const { program } = require('commander');
const fs = require('fs');

const chalk = require('chalk');

const { StreamChat } = require('stream-chat');

program.option('-c, --config <config>', 'Config file in root directory', 'dev.config.js');
program.option('-i, --channelId <channelId>', 'Channel id');
program.option(
  '-u, --userId <userId>',
  'user id from which channel needs to be un-hidden',
);

program.parse(process.argv);

let config;
if (!fs.existsSync(`${process.cwd()}/${program.config}`)) {
  config = require(`../${program.config}`);
} else {
  config = require(`${process.cwd()}/${program.config}`);
}

const { apiKey, secret, baseUrl, channelType } = config;
const channelId = program.channelId;
const userId = program.userId;

if (!apiKey || !secret) {
  console.log('Please add API_KEY and SECRET to config.js');
  process.exit(0);
}

if (!channelId) {
  console.log(chalk.bgRed('Please provide channelId. Use --help for all available args'));
  process.exit(0);
}

const client = new StreamChat(apiKey, secret, {
  timeout: 20000,
});

if (baseUrl) {
  client.setBaseURL(baseUrl);
}

const channel = client.channel(channelType, channelId);

channel.update({ frozen: false }).then((response) => {
  console.log(chalk.bgGreen(`\n✓ Channel "${channelId}" has been unfrozen!\n`));
  process.exit();
});

#!/usr/bin/env node
const { program } = require('commander');
const fs = require('fs');

const chalk = require('chalk');

const { StreamChat } = require('stream-chat');

program.option('-c, --config <config>', 'Config file in root directory', 'dev.config.js');
program.option('-i, --channelId <channelId>', 'Channel id that needs to be deleted');

program.parse(process.argv);

let config;
if (!fs.existsSync(`${process.cwd()}/${program.config}`)) {
  config = require(`../${program.config}`);
} else {
  config = require(`${process.cwd()}/${program.config}`);
}

const channelId = program.channelId;
const channelType = config.channelType;

if (!config.apiKey || !config.secret) {
  throw Error('Please add API_KEY and SECRET to config.js');
}

const client = new StreamChat(config.apiKey, config.secret, {
  timeout: 20000,
});

if (config.baseUrl) {
  client.setBaseURL(config.baseUrl);
}

const channel = client.channel(channelType, channelId);

channel.delete().then((response) => {
  console.log(chalk.green(`\nChannel ${channelId} deleted succesfully!\n`));
  process.exit();
});

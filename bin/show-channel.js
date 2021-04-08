#!/usr/bin/env node
const { program } = require('commander');
const chalk = require('chalk');

const { StreamChat } = require('stream-chat');

program.option('-c, --config <config>', 'Config file in root directory', 'dev.config.js');
program.option('-i, --channelId <channelId>', 'Channel id');
program.option(
  '-u, --userId <userId>',
  'user id from which channel needs to be un-hidden',
);

program.parse(process.argv);

const { apiKey, secret, baseUrl, channelType } = require(`../${program.config}`);
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

channel.show(userId).then((response) => {
  console.log(chalk.bgGreen(`\n✓ Channel.show() for "${channelId}" is succesfull!\n`));
  process.exit();
});

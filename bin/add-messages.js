#!/usr/bin/env node
const { program } = require('commander');
const fs = require('fs');

const chalk = require('chalk');

const { StreamChat } = require('stream-chat');
const { addMessages } = require('./utils/add-messages');

program.description(`
Added bunch of messages to a channel. Please provide channelId and number of messages as arguments.
Also if you want to increase the unread count of channel, then you may add \`excludeUser\` argument,
so no message will be added from this user. And thus final unread count of channel will be equal to \`number\` (provided in arguments)
`);
program.option('-c, --config <config>', 'Config file in root directory', 'dev.config.js');
program.option('-i, --channelId <channelId>', 'Channel id');
program.option(
  '-n, --number <number>',
  'Number of messages to add. By default `numberOfMessagesPerChannel` from your config file will be used',
);
program.option('-e, --excludeUser <number>', 'Number of messages to add');
program.option('-u, --sentByUser <number>', 'Number of messages to add');

program.parse(process.argv);

const channelId = program.channelId;
let config;
if (!fs.existsSync(`${process.cwd()}/${program.config}`)) {
  config = require(`../${program.config}`);
} else {
  config = require(`${process.cwd()}/${program.config}`);
}

const channelType = config.channelType;
const numberOfMessages = program.number || config.numberOfMessagesPerChannel;
const sentByUser = program.sentByUser;
const excludeUser = program.excludeUser;

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

const run = async () => {
  await channel.query();
  if (config.truncateBeforeAddingNewMessages) {
    await channel.truncate();
  }

  await addMessages(
    channel,
    { ...config, numberOfMessagesPerChannel: numberOfMessages },
    excludeUser,
    sentByUser,
  );
  console.log(chalk.green(`\n✓ Added ${numberOfMessages} messages!!`));
  process.exit();
};

run();

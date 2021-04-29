#!/usr/bin/env node
const { program } = require('commander');
const fs = require('fs');

const chalk = require('chalk');

const { StreamChat } = require('stream-chat');

program.option('-c, --config <config>', 'Config file in root directory', 'dev.config.js');
program.option('-i, --channelId <channelId>', 'Channel id');
program.option('-m, --moderatorId <moderatorId>', 'user id to be made moderator');

program.parse(process.argv);

const channelId = program.channelId;
const moderator = program.moderatorId;

let config;
if (!fs.existsSync(`${process.cwd()}/${program.config}`)) {
  config = require(`../${program.config}`);
} else {
  config = require(`${process.cwd()}/${program.config}`);
}

const {
  apiKey,
  baseUrl,
  channelType,
  secret,
  serverSideUser,
} = config;

if (!apiKey || !secret) {
  throw Error('Please add API_KEY and SECRET to config.js');
}

const client = new StreamChat(apiKey, secret, {
  timeout: 20000,
});

if (baseUrl) {
  client.setBaseURL(baseUrl);
}

const channel = client.channel(channelType, channelId);

const run = async () => {
  await channel.addModerators([moderator], {
    text: `${moderator} is now moderator!`,
    user_id: serverSideUser,
  });

  console.log(chalk.green(`\n✓ Added "${moderator}" as moderator`));
  process.exit();
};

run();

#!/usr/bin/env node
const { program } = require('commander');
const fs = require('fs');

const chalk = require('chalk');

const { StreamChat } = require('stream-chat');
const { capFirst } = require('./utils');

program.option('-c, --config <config>', 'Config file in root directory', 'dev.config.js');
program.option('-i, --channelId <channelId>', 'Channel id');
program.option('-m, --userId <userId>', 'user id to be removed');

program.parse(process.argv);

let config;
if (!fs.existsSync(`${process.cwd()}/${program.config}`)) {
  config = require(`../${program.config}`);
} else {
  config = require(`${process.cwd()}/${program.config}`);
}

const { apiKey, secret, baseUrl, channelType, serverSideUser } = config;
const channelId = program.channelId;
const memberToBeRemoved = program.userId;

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
  console.log('\n');
  await channel.removeMembers([memberToBeRemoved], {
    text: `${memberToBeRemoved} has been removed`,
    user_id: serverSideUser,
  });

  console.log(
    chalk.green(`✓ Member "${memberToBeRemoved}" removed from channel "${channelId}"`),
  );
};

run();

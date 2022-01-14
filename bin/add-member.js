#!/usr/bin/env node
const { program } = require('commander');
const fs = require('fs');

const chalk = require('chalk');
const { capFirst } = require('./utils/index');
const { StreamChat } = require('stream-chat');

program.option(
  '-c, --config <configFile>',
  'Config file in root directory',
  'dev.config.js',
);
program.option('-i, --channelId <channelId>', 'Channel id');
program.option('-m, --userId <userId>', 'user id to be added');

program.parse(process.argv);

const channelId = program.channelId;
const newMember = program.userId;

let config;
if (!fs.existsSync(`${process.cwd()}/${program.config}`)) {
  config = require(`../${program.config}`);
} else {
  config = require(`${process.cwd()}/${program.config}`);
}

const { apiKey, secret, baseUrl, serverSideUser, channelType } = config;
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
  const { users } = await client.queryUsers({ id: { $in: [newMember] } });
  if (!users || users.length === 0) {
    await client.upsertUser({ id: newMember, name: capFirst(newMember) });
    console.log(chalk.green(`\n✓ Created user "${newMember}"`));
  }

  await channel.addMembers([newMember], {
    text: `${newMember} has been added`,
    user_id: serverSideUser,
  });

  console.log(chalk.green(`✓ Member "${newMember}" added to channel "${channelId}"`));
};

run();

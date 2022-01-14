#!/usr/bin/env node
const { program } = require('commander');
const fs = require('fs');

const { StreamChat } = require('stream-chat');

program.option('-c, --config <config>', 'Config file in root directory', 'dev.config.js');
program.option(
  '-i, --channelId <channelId>',
  'Channel id from which image eneeds to be removed',
);
program.option('-u, --url <url>', 'Url of the image, to be deleted');

program.parse(process.argv);

let config;
if (!fs.existsSync(`${process.cwd()}/${program.config}`)) {
  config = require(`../${program.config}`);
} else {
  config = require(`${process.cwd()}/${program.config}`);
}

const channelType = config.channelType;
const channelId = program.channelId;

if (!config.apiKey || !config.secret) {
  throw Error('Please add API_KEY and SECRET to config.js');
}

const client = new StreamChat(config.apiKey, config.secret, {
  timeout: 20000,
});

if (config.baseUrl) {
  client.setBaseURL(config.baseUrl);
}

const url = program.url;

const channel = client.channel(channelType, channelId);

channel.deleteImage(url).then((response) => {
  console.log(response);
  process.exit();
});

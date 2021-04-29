#!/usr/bin/env node
const { program } = require('commander');
const fs = require('fs');


const { StreamChat } = require('stream-chat');
const { getRandomInt } = require('./utils');

program.option('-c, --config <config>', 'Config file in root directory', 'dev.config.js');
program.option('-i, --id <id>', 'Id of user');
program.option('-n, --name <name>', 'Name of user');
program.option('-i, --image <image>', 'Avatar image for user');
program.option('-s, --status <status>', 'Status for user');

program.parse(process.argv);

let config;
if (!fs.existsSync(`${process.cwd()}/${program.config}`)) {
  config = require(`../${program.config}`);
} else {
  config = require(`${process.cwd()}/${program.config}`);
}

const userId = program.id;
const userName = program.name;
const role = program.role;
const image = program.image;
const status = program.status;

const client = new StreamChat(config.apiKey, config.secret);
if (config.baseUrl) {
  client.setBaseURL(config.baseUrl);
}

const token = client.createToken(userId);

const newUser = {
  id: userId,
};

if (userName) {
  newUser.name = userName;
}

const randomSeed = getRandomInt(1, 1000);

if (image) {
  newUser.image = image;
} else {
  newUser.image = `https://picsum.photos/seed/${randomSeed}/100/100`;
}

if (role) {
  newUser.role = role;
}
if (status) {
  newUser.status = status;
}

client.upsertUsers([newUser]).then((user) => {
  console.log(`Token for ${userId} is ${token}`);
  console.log(user);
  process.exit();
});

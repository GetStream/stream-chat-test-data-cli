#!/usr/bin/env node
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { program } = require('commander');
const fs = require('fs');

const chalk = require('chalk');

const https = require('https');
const { StreamChat } = require('stream-chat');

const { getRandomInt } = require('./utils/getRandomInt');

program.description(
  `Bulk of members will be generated and added to your channel. Please specify channelId and number of members to add.
  This is usefull when you want to test a channel with >100 members.
  `,
);

program.option('-c, --config <config>', 'Config file in root directory', 'dev.config.js');
program.option('-i, --channelId <channelId>', 'Channel id');
program.option('-n, --number <number>', 'Number of members to be added');

program.parse(process.argv);

const channelId = program.channelId;
const numberOfMembers = program.number;

let config;
if (!fs.existsSync(`${process.cwd()}/${program.config}`)) {
  config = require(`../${program.config}`);
} else {
  config = require(`${process.cwd()}/${program.config}`);
}

const { apiKey, baseUrl, channelType, secret, serverSideUser } = config;

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

//The url we want is: 'www.random.org/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'
const options = {
  hostname: 'api.namefake.com',
  path: '/english-united-states/random',
  headers: {
    'Content-Type': 'application/json',
  },
};

const users = [];

const makeRequest = (i) =>
  new Promise((resolve) => {
    const waiter = setTimeout(resolve, 3000);
    const req = https.request(options, (res) => {
      res.on('data', (d) => {
        const result = JSON.parse(d.toString());
        const randomSeed = getRandomInt(1, 1000);
        const newUser = {
          id: result.uuid,
          name: result.name,
          image: `https://picsum.photos/seed/${randomSeed}/100/100`,
        };
        users.push(newUser);
        console.log(newUser);
        resolve();
        clearTimeout(waiter);
      });
    });

    req.on('error', (error) => {
      console.log(error);
      resolve();
    });

    req.end();
  });

function generateUsers() {
  const promises = [];
  for (let i = 0; i < numberOfMembers; i++) {
    promises.push(makeRequest(i));
  }

  console.log('\nAdding following users to channel:\n');
  console.log(`========================================\n`);

  Promise.all(promises)
    .then((r) => client.upsertUsers(users))
    .then(() =>
      channel.addMembers(
        users.map((u) => u.id),
        {
          text: `New members has been added`,
          user_id: 'vishal',
        },
      ),
    )
    .then((response) => {
      console.log(chalk.green(`\n\n========================================`));
      console.log(
        chalk.bgGreen(
          `\n\n✓ Total number members in channel - ${response.members.length}`,
        ),
      );
      process.exit();
    });
}

generateUsers();

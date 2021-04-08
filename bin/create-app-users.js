#!/usr/bin/env node
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { program } = require('commander');
const chalk = require('chalk');

const { StreamChat } = require('stream-chat');
const https = require('https');
const { getRandomInt } = require('./utils');

program.description(
  `Adds bulk of users will be generated and added to your app. Please specify number of users to generate.`,
);
program.option('-c, --config <config>', 'Config file in root directory', 'dev.config.js');
program.option('-n, --number <number>', 'Number of users to generate', 0);

program.parse(process.argv);
const config = require(`../${program.config}`);
const numberOfUsers = program.number;

const client = new StreamChat(config.apiKey, config.secret);
if (config.baseUrl) {
  client.setBaseURL(config.baseUrl);
}

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

  for (let i = 0; i < numberOfUsers; i++) {
    promises.push(makeRequest(i));
  }

  if (promises.length === 0) {
    return;
  }

  Promise.all(promises)
    .then((r) => client.upsertUsers(users))
    .then((response) => {
      console.log(
        chalk.bgGreen(`\nCreated ${Object.keys(response.users).length} users:\n`),
      );

      console.log(`========================================\n\n`);
      for (const uid in response.users) {
        const user = response.users[uid];
        const token = client.createToken(uid);
        console.log(`User with token - ${token}`);
        console.log(user);
      }
    })
    .then(() => {
      process.exit();
    });
}

generateUsers();

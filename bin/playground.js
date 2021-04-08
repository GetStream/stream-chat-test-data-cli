#!/usr/bin/env node
const { program } = require('commander');
const { StreamChat } = require('stream-chat');
const chalk = require('chalk');

program.description(
  'This is a playground or starter script. Use this space to test some custom js code!!',
);
program.option('-c, --config <config>', 'Config file in root directory', 'dev.config.js');
program.parse(process.argv);

const config = require(`../${program.config}`);

const client = new StreamChat(config.apiKey, config.secret);
if (config.baseUrl) {
  client.setBaseURL(config.baseUrl);
}

const run = () => {
  console.log(chalk.magenta('\nWelcome to playground !!\n'));
  console.log(`
  ┈┈╱╲┈┈┈╱╲┈┈╭━╮┈
  ┈╱╱╲╲__╱╱╲╲┈╰╮┃┈
  ┈▏┏┳╮┈╭┳┓▕┈┈┃┃┈
  ┈▏╰┻┛▼┗┻╯▕┈┈┃┃┈
  ┈╲┈┈╰┻╯┈┈╱▔▔┈┃┈
  ┈┈╰━┳━━━╯┈┈┈┈┃┈
  ┈┈┈┈┃┏┓┣━━┳┳┓┃┈
  ┈┈┈┈┗┛┗┛┈┈┗┛┗┛┈
  `);
  console.log('============================\n');
  console.log(chalk.green('\n Yup its working ... \n'));
  // ========================================================
  // ========================================================
  //
  // WELCOME TO PLAYGROUND> WRITE YOUR CUSTOM CODE HERE :)
  //
  // ========================================================\
  // ========================================================
  // const userClient = new StreamChat(config.apiKey);
  // if (config.baseUrl) {
  //   userClient.setBaseURL(config.baseUrl);
  // }
  // await userClient.connectUser({id: ''}, 'token');
};
run();

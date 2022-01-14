#!/usr/bin/env node
const { program } = require('commander');
const fs = require('fs');
const cliProgress = require('cli-progress');

const chalk = require('chalk');

const { StreamChat } = require('stream-chat');
const { addMessages } = require('./utils/add-messages');
const { createRandomUsers } = require('./utils/create-random-users');

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
program.option(
  '-r, --randomUsers <number>',
  'Number of random users to send messages from',
);
program.option(
  '-m, --membersOnly <boolean>',
  'Messages will be sent only from members of channel',
);
program.option(
  '-e, --excludeUser <string>',
  "Messages won't be added from use with this id",
);
program.option('-u, --sentByUser <string>', 'Messages will be sent by user with this id');

program.parse(process.argv);

const channelId = program.channelId;
let config;
if (!fs.existsSync(`${process.cwd()}/${program.config}`)) {
  config = require(`../${program.config}`);
} else {
  config = require(`${process.cwd()}/${program.config}`);
}

const channelType = config.channelType;
const numberOfMessages =
  program.number || config.messageConfig.numberOfMessagesPerChannel;
const randomUsers = program.randomUsers;
const sentByUser = program.sentByUser;
const membersOnly = program.membersOnly;
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

const run = async () => {
  let sentByUsers = [];
  if (randomUsers) {
    console.log(
      chalk.cyanBright(
        `\nCreating ${randomUsers} number of random users to send messages from: \n`,
      ),
    );
    sentByUsers = await createRandomUsers(client, randomUsers);
  } else if (sentByUser) {
    sentByUsers = [sentByUser];
  }

  const channelIds = channelId.split(',');
  const channelQueryPromises = [];

  // create new container
  const multibar = new cliProgress.MultiBar(
    {
      clearOnComplete: false,
      hideCursor: true,
    },
    cliProgress.Presets.shades_grey,
  );

  channelIds.forEach((id) => {
    const exec = async () => {
      const channel = client.channel(channelType, id);
      await channel.query();
      if (config.truncateBeforeAddingNewMessages) {
        await channel.truncate();
      }

      const updatedConfig = {
        ...config,
      };
      updatedConfig.messageConfig.numberOfMessagesPerChannel = numberOfMessages;
      await addMessages({
        channel,
        config: updatedConfig,
        excludeUser,
        sentByUsers,
        membersOnly,
        multibar,
      });
    };

    channelQueryPromises.push(exec());
  });

  await Promise.all(channelQueryPromises);
  multibar.stop();
  console.log(chalk.green(`\n✓ Added ${numberOfMessages} messages!!`));
  process.exit();
};

run();

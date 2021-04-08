#!/usr/bin/env node

const { program } = require('commander');
const { StreamChat } = require('stream-chat');
const chalk = require('chalk');
const { addMessages } = require('./utils/add-messages');
const { delay, getInput, getRandomInt } = require('./utils');

program.description(
  'This script will loop over all the channels that exist on your app, and will reset the messages on them\n' +
    'Its going to do this by calling `client.queryChannels` in loop to fetch all the channels in your app, then then reseting data on them one by one\n' +
    'So it may take a while!!\n',
);

program.option('-c, --config <config>', 'Config file in root directory', 'dev.config.js');
program.parse(process.argv);

const config = require(`../${program.config}`);

const client = new StreamChat(config.apiKey, config.secret);
if (config.baseUrl) {
  client.setBaseURL(config.baseUrl);
}

const run = async () => {
  console.log(
    chalk.yellow(
      '====================================================\n',
      'Just to give you a tiny warning, this script will loop over all the channels that exist on your app, and will reset the messages on them\n',
      'Its going to do this by calling `client.queryChannels` in loop to fetch all the channels in your app, then then reseting data on them one by one\n',
      'So it may take a while!!\n',
      '====================================================\n',
    ),
  );

  const answer = await getInput('Would you like to proceed? [Yes/No] ');
  if (answer && answer.toLowerCase() === 'no') {
    console.log('\nCiao!! :)\n');
    return;
  }

  const allChannels = [];
  let hasMoreChannels = true;
  const limit = 30;
  let offset = 0;

  console.log(
    chalk.cyanBright(
      'Step 1: Lets start by querying all the channels, so that we have list of channel ids to reset\n',
    ),
  );
  while (hasMoreChannels) {
    try {
      const channels = await client.queryChannels(
        {
          type: config.channelType,
        },
        {
          last_message_at: -1,
        },
        {
          offset,
          limit,
          watch: false,
          state: true,
        },
      );

      if (channels.length === limit) {
        hasMoreChannels = true;
      } else {
        hasMoreChannels = false;
      }
      offset = offset + channels.length;
      allChannels.push(...channels.map((c) => c.id));

      console.log('✓ Total channels received so far: ', allChannels.length);
      await delay(1000);
    } catch (e) {
      console.log(
        chalk.bgRed(
          '\nOOPS looks like something broke, let me try again in 5 seconds. Could just be a rate limit!!\n',
        ),
      );
      await delay(5000);
    }
  }

  console.log(chalk.cyanBright('\nStep 2: Lets resetcreate users mentioned in config\n'));

  await createAppUsers();

  console.log(chalk.cyanBright('\nStep 3: Lets reset messages on these channels now\n'));
  for (let i = 0; i < allChannels.length; i++) {
    const channel = client.channel(config.channelType, allChannels[i]);

    if (config.truncateBeforeAddingNewMessages) {
      await channel.truncate();
    }
    const appUserIds = config.appUsers.map((u) => (typeof u === 'object' ? u.id : u));
    if (channel.cid.indexOf('!members-') === -1) {
      const channelMemberIds = Object.keys(channel.state.members);

      const newMembers = [];
      for (const id of appUserIds) {
        if (channelMemberIds.indexOf(appUserIds) > -1) {
          continue;
        }

        newMembers.push(id);
      }

      if (newMembers.length > 0) {
        await channel.addMembers(newMembers, {
          text: `New members have been added`,
          user_id: config.serverSideUser,
        });
      }
    }

    console.log(chalk.magentaBright('Channel - ', channel.id));

    await addMessages(channel, config);
    console.log('\n');
  }

  console.log(chalk.green('✓ We are done :) '));
};

const createAppUsers = async () => {
  if (!config.createUsers) {
    return;
  }

  const isServerSideUserPartOfAppUsers =
    config.appUsers.findIndex((u) => {
      if (typeof u === 'object') {
        return u.id === config.serverSideUser;
      }

      return u === config.serverSideUser;
    }) > -1;

  const usersToCreate = config.appUsers;

  if (!isServerSideUserPartOfAppUsers) {
    usersToCreate.push(config.serverSideUser);
  }

  const usersToUpsert = [];
  for (let i = 0; i < usersToCreate.length; i++) {
    const userOrID = usersToCreate[i];
    const userID = typeof userOrID === 'string' ? userOrID : userOrID.id;
    const randomSeed = getRandomInt(1, 50);

    let newUser = {};
    if (typeof userOrID === 'object') {
      newUser = {
        id: userID,
        name: userID.charAt(0).toUpperCase() + userID.slice(1),
        image: `https://randomuser.me/api/portraits/thumb/men/${randomSeed}.jpg`,
        ...userOrID,
      };
    } else {
      newUser = {
        id: userID,
        name: userID.charAt(0).toUpperCase() + userID.slice(1),
        image: `https://randomuser.me/api/portraits/thumb/men/${randomSeed}.jpg`,
      };
    }

    usersToUpsert.push(newUser);
  }
  const response = await client.upsertUsers(usersToUpsert);

  console.log(chalk.cyanBright('\nCreated following users: \n'));
  usersToUpsert.forEach((u) => {
    const token = client.createToken(u.id);

    console.log('User with token: ', token);
    console.log(u);
    console.log('\n');
  });
};

run();

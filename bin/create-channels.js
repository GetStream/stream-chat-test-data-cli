#!/usr/bin/env node
const { program } = require('commander');
const fs = require('fs');

const chalk = require('chalk');

const { StreamChat } = require('stream-chat');
const { delay, generateName, generateMessage, getRandomInt } = require('./utils');
const { addMessages } = require('./utils/add-messages');

program.description(`
  Creates channels in bulk amount. Channels are created using id prefix (channelIdPrefix) mentioned in config.
  If you execute this command multiple times, same channels will be updated with messages. If you want to
  generate new set of channels, simply change the channelIdPrefix - so that channels will be requested with
  different id. Channels get generated with following id:

  \`\`\`js
  const channelId = \`$\{config.channelIdPrefix || 'default'}-channel-$\{i}\`; // i is the loop index
  \`\`\`
`);
program.option('-c, --config <config>', 'Config file in root directory', 'dev.config.js');
program.parse(process.argv);

let config;
if (!fs.existsSync(`${process.cwd()}/${program.config}`)) {
  config = require(`../${program.config}`);
} else {
  config = require(`${process.cwd()}/${program.config}`);
}


if (!config.apiKey || !config.secret) {
  throw Error('Please add API_KEY and SECRET to config.js');
}

const client = new StreamChat(config.apiKey, config.secret, {
  timeout: 20000,
});

if (config.baseUrl) {
  client.setBaseURL(config.baseUrl);
}

// Create one-on-one conversations with all the users.
const createOneOnOneConversations = async () => {
  if (!config.createOneToOneConversations) {
    return;
  }
  const appUsers = config.appUsers.map((u) => (typeof u === 'object' ? u.id : u));
  for (let i = 0; i < appUsers.length; i++) {
    for (let s = 0; s < appUsers.length; s++) {
      try {
        if (s <= i) continue;
        // create a new progress bar instance and use shades_classic theme
        const channel = await getChannelByMembers([appUsers[i], appUsers[s]]);
        console.log(
          `\n\n Created channel with members - ${appUsers[i]} and ${appUsers[s]} \n`,
        );

        await addMessages(channel, config);
      } catch (error) {
        console.warn(
          "\n SOMETHING FAILED .. mostly timeout issue. Don't worry, let it run. These things happen in life!! \n ",
        );
        await delay(5000);
        continue;
      }
    }
  }
};

const createChannels = async () => {
  for (let i = 0; i < config.numberOfGroupChannel; i++) {
    try {
      const channelId = `${config.channelIdPrefix || 'default'}-channel-${i}`;
      const channelName = getChannelName(i);

      const channel = await getChannelByID(channelId, channelName);
      const appUserIds = config.appUsers.map((u) => (typeof u === 'object' ? u.id : u));
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

      await addMessages(channel, config);
    } catch (error) {
      console.warn(error);
      console.warn(
        "\n SOMETHING FAILED .. mostly timeout issue. Don't worry, let it run. These things happen in life!! \n ",
      );

      await delay(5000);
      continue;
    }
  }
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

const getChannelByMembers = async (members) => {
  const channel = client.channel(config.channelType, {
    created_by_id: config.serverSideUser,
    members,
    ...(config.customProperties || {}),
  });

  await channel.query();

  if (config.truncateBeforeAddingNewMessages) {
    await channel.truncate();
  }

  return channel;
};

const getChannelName = (channelIndex) =>
  channelIndex > config.channelNames.length - 1
    ? generateName(config.language)
    : config.channelNames[channelIndex];

const getChannelByID = async (channelId, channelName) => {
  const channelMembers = config.appUsers.map((u) => (typeof u === 'object' ? u.id : u));
  const channel = client.channel(config.channelType, channelId, {
    created_by_id: config.serverSideUser,
    members: channelMembers,
    name: channelName,
    image: `https://picsum.photos/seed/${getRandomInt(0, 100)}/100/100`,
    ...(config.customProperties || {}),
  });

  await channel.query();

  if (config.truncateBeforeAddingNewMessages) {
    await channel.truncate();
  }

  console.log(`\n\n Created channel "${channelName}" with id - "${channelId} "\n`);

  return channel;
};

const run = async () => {
  await createAppUsers();
  await createChannels();
  await createOneOnOneConversations();
};

run();

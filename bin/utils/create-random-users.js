const chalk = require('chalk');

const cliProgress = require('cli-progress');
const { getRandomInt } = require('./getRandomInt');
const { generateUUIDv4 } = require('./generateUUIDv4');
const { generateName } = require('.');

function ConsoleTableUser(id, token) {
  this.STREAM_USER_ID = id;
  this.STREAM_USER_TOKEN = token;
}

const createRandomUsers = async (client, count) => {
  const usersToUpsert = [];
  for (let i = 0; i < count; i++) {
    const userID = generateUUIDv4();
    const randomSeed = getRandomInt(1, 50);

    const newUser = {
      id: userID,
      name: generateName(),
      image: `https://randomuser.me/api/portraits/thumb/men/${randomSeed}.jpg`,
    };

    usersToUpsert.push(newUser);
  }
  const response = await client.upsertUsers(usersToUpsert);

  const table = [];
  usersToUpsert.forEach((u) => {
    const token = client.createToken(u.id);
    table.push(new ConsoleTableUser(u.id, token));
  });
  console.table(table);

  return usersToUpsert.map((u) => u.id);
};

module.exports = {
  createRandomUsers,
};

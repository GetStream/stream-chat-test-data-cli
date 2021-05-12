const cliProgress = require('cli-progress');
const { delay, generateMessage, getRandomInt } = require('./index');

const addMessages = async (channel, config, excludeUser = '', sentByUser = '') => {
  const bar1 = new cliProgress.SingleBar(
    {
      format: 'Sending messages [{bar}] {percentage}% | {value}/{total}',
    },
    cliProgress.Presets.shades_classic,
  );

  bar1.start(config.numberOfMessagesPerChannel, 0);
  const channelMembers = Object.keys(channel.state.members);
  const membersWithoutExcludeBy = channelMembers.filter((m) => m !== excludeUser);
  for (let j = 1; j <= config.numberOfMessagesPerChannel; j++) {
    try {
      const text = getMessageText(j, config);
      const attachments = getAttachments(j, config);

      const sentBy = sentByUser || membersWithoutExcludeBy[getRandomInt(0, membersWithoutExcludeBy.length)];
      const { message } = await channel.sendMessage({
        text,
        attachments,
        user_id: sentBy,
      });

      await addReactions(channel, message, j, config, excludeUser);
      await addReplies(channel, message, j, config, excludeUser);

      bar1.update(j);
    } catch (e) {
      console.log('WAITING SINCE SEND MESSAGE FAILED', e);
      await delay(5000);
      continue;
    }
  }
  bar1.stop();
};

const addReactions = async (channel, message, messageIndex, config, excludeUser) => {
  if (config.reactionFrequency !== -1 && messageIndex % config.reactionFrequency === 0) {
    const numberOfReactions = getRandomInt(1, 5);
    const channelMembers = Object.keys(channel.state.members);
    const membersWithoutExcludeBy = channelMembers.filter((m) => m !== excludeUser);

    for (let l = 0; l < numberOfReactions; l++) {
      const reaction = config.reactions[getRandomInt(0, config.reactions.length)];
      const sentBy =
        membersWithoutExcludeBy[getRandomInt(0, membersWithoutExcludeBy.length)];

      const rx = await channel.sendReaction(message.id, {
        type: reaction,
        user_id: sentBy,
      });
    }
  }
};

const addReplies = async (channel, message, messageIndex, config, excludeUser = '') => {
  try {
    if (
      config.threadReplyFrequency !== -1 &&
      messageIndex % config.threadReplyFrequency === 0
    ) {
      const numberOfReplies = getRandomInt(1, 5);
      const channelMembers = Object.keys(channel.state.members);
      const membersWithoutExcludeBy = channelMembers.filter((m) => m !== excludeUser);
  
      for (let l = 0; l < numberOfReplies; l++) {
        const replyText = generateMessage(config.language);
        const sentBy =
          membersWithoutExcludeBy[getRandomInt(0, membersWithoutExcludeBy.length)];
  
        await channel.sendMessage({
          text: replyText,
          parent_id: message.id,
          user_id: sentBy,
          show_in_channel: false,
        });
      }
    }
  } catch (e) {
    // If replies are not enabled, then skip it simply
  }
};

const getAttachments = (messageIndex, config) => {
  if (
    config.attachmentFrequency === -1 ||
    messageIndex % config.attachmentFrequency !== 0
  )
    return [];

  const attachments = [];
  const numberOfAttachments = getRandomInt(
    1,
    config.maxNumberOfAttachmentsPerMessage + 1,
  );

  for (let k = 0; k < numberOfAttachments; k++) {
    const randomSeed = getRandomInt(1, 100);
    attachments.push({
      type: 'image',
      thumb_url: `https://picsum.photos/seed/${randomSeed}/200/200`,
      asset_url: `https://picsum.photos/seed/${randomSeed}/200/200`,
    });
  }

  return attachments;
};

const getMessageText = (messageIndex, config) => {
  let text = generateMessage(config.language);

  if (config.urlFrequency !== -1 && messageIndex % config.urlFrequency === 0) {
    text = text + ' ' + config.urls[getRandomInt(1, config.urls.length + 1)];
  }

  return text;
};

module.exports = {
  addMessages,
  getAttachments,
  getMessageText,
  addReactions,
  addReplies,
};

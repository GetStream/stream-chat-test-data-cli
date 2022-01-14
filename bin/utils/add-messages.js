const cliProgress = require('cli-progress');
const { getRandomInt } = require('./getRandomInt');
const { delay, generateMessage } = require('./index');

const addMessages = async ({
  channel,
  config,
  excludeUser = '',
  sentByUsers = [],
  membersOnly = false,
  multibar,
}) => {
  const bar1 = multibar.create(config.messageConfig.numberOfMessagesPerChannel, 0);

  const channelMembers = Object.keys(channel.state.members);
  const appUsers = config.appUsers.map((u) => (typeof u === 'object' ? u.id : u));
  const messageUsers =
    sentByUsers.length > 0 ? sentByUsers : membersOnly ? channelMembers : appUsers;
  const messageUsersWithoutExcludeBy = messageUsers.filter((m) => m !== excludeUser);
  for (let j = 1; j <= config.messageConfig.numberOfMessagesPerChannel; j++) {
    try {
      let text = getMessageText(j, config);
      const attachments = getAttachments(j, config);

      if (attachments.length === 1 && attachments[0].type === 'giphy') {
        text = '';
      }

      const sentBy =
        messageUsersWithoutExcludeBy[
          getRandomInt(0, messageUsersWithoutExcludeBy.length)
        ];
      const { message } = await channel.sendMessage({
        text,
        attachments,
        user_id: sentBy,
      });

      addReactions(channel, message, j, config, sentByUsers, excludeUser, membersOnly);
      addReplies(channel, message, j, config, sentByUsers, excludeUser, membersOnly);
      bar1.increment();
      await delay(
        getRandomInt(config.messageConfig.minDelay, config.messageConfig.maxDelay),
      );
    } catch (e) {
      console.log('WAITING SINCE SEND MESSAGE FAILED', e);
      await delay(5000);
      continue;
    }
  }
};

// TODO: Convert following param to object
const addReactions = (
  channel,
  message,
  messageIndex,
  config,
  sentByUsers = [],
  excludeUser = '',
  membersOnly = false,
) => {
  if (frequencyCheck(config.reactionConfig.frequency, messageIndex)) {
    const numberOfReactions = getRandomInt(1, 5);
    const channelMembers = Object.keys(channel.state.members);
    const appUsers = config.appUsers.map((u) => (typeof u === 'object' ? u.id : u));
    const messageUsers =
      sentByUsers.length > 0 ? sentByUsers : membersOnly ? channelMembers : appUsers;
    const messageUsersWithoutExcludeBy = messageUsers.filter((m) => m !== excludeUser);

    for (let l = 0; l < numberOfReactions; l++) {
      const reaction =
        config.reactionConfig.reactions[
          getRandomInt(0, config.reactionConfig.reactions.length)
        ];
      const sentBy =
        messageUsersWithoutExcludeBy[
          getRandomInt(0, messageUsersWithoutExcludeBy.length)
        ];

      setTimeout(() => {
        channel.sendReaction(message.id, {
          type: reaction,
          user_id: sentBy,
        });
      }, getRandomInt(config.reactionConfig.minDelay, config.reactionConfig.maxDelay));
    }
  }
};

// TODO: Convert following param to object
const addReplies = (
  channel,
  message,
  messageIndex,
  config,
  sentByUsers = [],
  excludeUser = '',
  membersOnly = false,
) => {
  try {
    if (frequencyCheck(config.threadReplyConfig.frequency, messageIndex)) {
      const numberOfReplies = getRandomInt(1, 5);
      const channelMembers = Object.keys(channel.state.members);
      const appUsers = config.appUsers.map((u) => (typeof u === 'object' ? u.id : u));
      const messageUsers =
        sentByUsers.length > 0 ? sentByUsers : membersOnly ? channelMembers : appUsers;
      const messageUsersWithoutExcludeBy = messageUsers.filter((m) => m !== excludeUser);

      for (let l = 0; l < numberOfReplies; l++) {
        const replyText = generateMessage(config.language);
        const sentBy =
          messageUsersWithoutExcludeBy[
            getRandomInt(0, messageUsersWithoutExcludeBy.length)
          ];

        setTimeout(() => {
          channel.sendMessage({
            text: replyText,
            parent_id: message.id,
            user_id: sentBy,
            show_in_channel: false,
          });
        }, getRandomInt(config.threadReplyConfig.minDelay, config.threadReplyConfig.maxDelay));
      }
    }
  } catch (e) {
    // If replies are not enabled, then skip it simply
  }
};
const frequencyCheck = (frequency, index) => {
  if (frequency === -1) {
    return false;
  }

  if (
    frequency !== 'random' &&
    index % frequency !== 0
  ) {
    return false;
  }

  if (frequency === 'random') {
    const shouldIncludeAttachment = getRandomInt(0, 2);

    if (!shouldIncludeAttachment) {
      return false;
    }
  }

  return true;
};

const getAttachments = (messageIndex, config) => {
  const attachmentConfig = config.attachmentConfig;

  if (!frequencyCheck(attachmentConfig.frequency, messageIndex)) {
    return [];
  }

  const attachmentType =
    attachmentConfig.types[getRandomInt(0, attachmentConfig.types.length)];
  const attachmentsOfChosenType = attachmentConfig.attachments.filter(
    (a) => a.type === attachmentType,
  );

  if (attachmentType === 'giphy') {
    return [attachmentsOfChosenType[getRandomInt(0, attachmentsOfChosenType.length)]];
  }

  return getRandomSubset(attachmentsOfChosenType, 10);
};

// function to get random subset of array
const getRandomSubset = (arr, size) => {
  const shuffled = arr.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, size);
};

const getMessageText = (messageIndex, config) => {
  let text = generateMessage(config.language);

  if (frequencyCheck(config.messageConfig.urlFrequency, messageIndex)) {
    text =
      text +
      ' ' +
      config.messageConfig.urls[getRandomInt(1, config.messageConfig.urls.length + 1)];
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

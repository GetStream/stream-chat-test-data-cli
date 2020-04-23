#!/usr/bin/env node

const {config} = require('../config');
const API_KEY = config.API_KEY;
const SECRET = config.SECRET;

if (!API_KEY || !SECRET) {
    throw Error('Please add API_KEY and SECRET to config.js');
}

/**
 * Group channels will be created with these users as members
 * First user of this user will be the creator of channel (since we are using server token for generating channels).
 */
const USERS = config.USERS;
/**
 * If true, users will be first created (if they don't exist in app).
 * Name will be same as userID, with first letter capitalized
 * Some random user avatar will be added for user.
 * */
const CREATE_USERS = config.CREATE_USERS;

const CHANNEL_TYPE = config.CHANNEL_TYPE;
/** Total number of group channels to create */
const NUMBER_OF_GROUP_CHANNELS = config.NUMBER_OF_GROUP_CHANNELS;
/**
 * Channel names will be some random combination of adjective and verb. but if you want to have your own channel names,
 * specify then here.
 * If NUMBER_OF_GROUP_CHANNELS is greater than length of FIXED_CHANNEL_NAMES, then for remainder of channels, name will
 * be auto generated.
 */
const FIXED_CHANNEL_NAMES = config.FIXED_CHANNEL_NAMES;

/** If true, script will also create one-to-one conversation between all users. */
const CREATE_ONE_ON_ONE_CONVERSATIONS = config.CREATE_ONE_ON_ONE_CONVERSATIONS;

const NUMBER_OF_MESSAGES_PER_CHANNEL = config.NUMBER_OF_MESSAGES_PER_CHANNEL;
/** So number of attachments will vary between 1 and MAX_NUMBER_OF_ATTACHMENTS_PER_MESSAGE */
const MAX_NUMBER_OF_ATTACHMENTS_PER_MESSAGE = config.MAX_NUMBER_OF_ATTACHMENTS_PER_MESSAGE;

/** Custom field for channels */
const EXAMPLE = config.EXAMPLE;

/** Following reactions will be randomly added to messages. */
const reactions = config.reactions;

/** Messages will contain following urls once in a while */
const urls = config.urls;

const language = config.language; 
const {StreamChat} = require('stream-chat');
const cliProgress = require('cli-progress');
const {generateName, generateMessage, getRandomInt} = require('./utils');

const client = new StreamChat(API_KEY, SECRET, {});
const users = USERS;

createUsers()
.then(r => {
    return createChannels();
})
.then(r => {
    if (CREATE_ONE_ON_ONE_CONVERSATIONS) {
        return createOneOnOneConversations();
    }
    return;
})
.then(r => {
}, error => {
    console.log(error);
})

async function createUsers () {
    if (!CREATE_USERS) {
        return Promise.resolve();
    }

    return new Promise(resolve => {
        users.forEach(async userID => {
            const token = client.createToken(userID);
            const randomSeed = getRandomInt(1, 50);
            const newUser = {
                id: userID,
                name: userID.charAt(0).toUpperCase() + userID.slice(1),
                image: `https://randomuser.me/api/portraits/thumb/men/${randomSeed}.jpg`
            }
            
            await client.updateUsers([newUser]).then(user => {
                console.log(`Created user - ${userID} with token - ${token}`);
                console.log(newUser)
            });
        })
        resolve();
    })
}
async function createOneOnOneConversations () {
    for (let i = 0; i < USERS.length; i++) {
        for (let s = 0; s < USERS.length; s++) {
            try {
                if (s <= i) continue
                // create a new progress bar instance and use shades_classic theme
                const bar1 = new cliProgress.SingleBar({
                    format: 'Sending messages [{bar}] {percentage}% | {value}/{total}'
                }, cliProgress.Presets.shades_classic);
    
                const channel = client.channel(CHANNEL_TYPE, {
                    created_by_id: users[0],
                    members: [users[i], users[s]]
                });
                const result = await channel.watch();
                const resultTruncate = await channel.truncate();
                await channel.update({
                    example: EXAMPLE,
                })

                console.log(`\n\n Created channel with members - ${users[i]} and ${users[s]} \n`);
                bar1.start(NUMBER_OF_MESSAGES_PER_CHANNEL, 0);
                for (let j = 1; j <= NUMBER_OF_MESSAGES_PER_CHANNEL; j++) {
                    let text = generateMessage(language);
                    const attachments = [];
                    const numberOfAttachments = getRandomInt(1, MAX_NUMBER_OF_ATTACHMENTS_PER_MESSAGE + 1);
                    try {
                        // Every 10th msg should have attachment.
                        if (j % 10 === 0) {
                            for (let k = 0; k < numberOfAttachments; k++ ) {
                                const randomSeed = getRandomInt(1, 100)
                                attachments.push({
                                    type: 'image',
                                    thumb_url: `https://picsum.photos/seed/${randomSeed}/200/200`,
                                    asset_url: `https://picsum.photos/seed/${randomSeed}/200/200`,
                                })
                            }
                        } 
                        if (j % 7 === 0) {
                            text = text + ' ' + urls[getRandomInt(1, urls.length + 1)];
                        }

                        const {message} = await channel.sendMessage({
                            text: text,
                            attachments,
                            user_id: users[getRandomInt(0, 2) === 0 ? i : s]
                        })

                        if (j % 4 === 0) {
                            const numberOfReactions = getRandomInt(1, 5);
    
                            for (let l = 0; l < numberOfReactions; l++) {
                                const reaction = reactions[getRandomInt(0, reactions.length)]
                                const user = users[getRandomInt(0, 2) === 0 ? i : s];
                                const rx = await channel.sendReaction(message.id, {
                                    type: reaction,
                                    user_id: user
                                });
                            }
                        }
                        if (j % 9 === 0) {
                            const numberOfReplies = getRandomInt(1, 5);
                            for (let l = 0; l < numberOfReplies; l++) {
                                const replyText = generateMessage(language);
                                const replyResponse = await channel.sendMessage({
                                    text: replyText,
                                    parent_id: message.id,
                                    user_id: users[getRandomInt(0, 2) === 0 ? i : s],
                                    show_in_channel: false,
                                });
                            }
                        }
    
                        bar1.update(j);
                    } catch(e) {
                        console.log('WAITING SINCE SEND MESSAGE FAILED', e);
                        await delay(5000);
                        continue;
                    }
                }
                bar1.stop();
                } catch (error) {
                    console.warn('\n SOMETHING FAILED .. mostly timeout issue. Don\'t worry, let it run. These things happen in life!! \n ');
                    await delay(5000);
                    continue;
                }
        }
        }

}

async function createChannels () {
    for (let i = 0; i < NUMBER_OF_GROUP_CHANNELS; i++) {
        try {
            // create a new progress bar instance and use shades_classic theme
            const bar1 = new cliProgress.SingleBar({
                format: 'Sending messages [{bar}] {percentage}% | {value}/{total}'
            }, cliProgress.Presets.shades_classic);

            const channelId = `channel-ex-${EXAMPLE}-${i}`;
            const channel = client.channel(CHANNEL_TYPE, channelId, {
                created_by_id: users[0],
                members: users
            });
            const result = await channel.watch();
            const resultTruncate = await channel.truncate();
            const channelName = (i > FIXED_CHANNEL_NAMES.length - 1) ? generateName(language) : FIXED_CHANNEL_NAMES[i];
            await channel.update({
                name: channelName,
                example: EXAMPLE,
                image: `https://picsum.photos/seed/${i}/100/100`,
            })
            console.log(`\n\n Created channel "${channelName}" with id - "${channelId} "\n`);
            bar1.start(NUMBER_OF_MESSAGES_PER_CHANNEL, 0);
            for (let j = 1; j <= NUMBER_OF_MESSAGES_PER_CHANNEL; j++) {
                let text = generateMessage(language);
                const attachments = [];
                const numberOfAttachments = getRandomInt(1, MAX_NUMBER_OF_ATTACHMENTS_PER_MESSAGE + 1);
                try {
                    // Every 10th msg should have attachment.
                    if (j % 10 === 0) {
                        for (let k = 0; k < numberOfAttachments; k++ ) {
                            const randomSeed = getRandomInt(1, 100);
                            attachments.push({
                                type: 'image',
                                thumb_url: `https://picsum.photos/seed/${randomSeed}/200/200`,
                                asset_url: `https://picsum.photos/seed/${randomSeed}/200/200`,
                            })
                        }
                    } 
                    if (j % 7 === 0) {
                        text = text + ' ' + urls[getRandomInt(1, urls.length + 1)];
                    }

                    const {message} = await channel.sendMessage({
                        text: text,
                        attachments,
                        user_id: users[getRandomInt(0, users.length)]
                    })
                    if (j % 4 === 0) {
                        const numberOfReactions = getRandomInt(1, 5);

                        for (let l = 0; l < numberOfReactions; l++) {
                            const reaction = reactions[getRandomInt(0, reactions.length)]
                            const user = users[getRandomInt(0, users.length)];
                            const rx = await channel.sendReaction(message.id, {
                                type: reaction,
                                user_id: user
                            });
                        }
                    }
                    if (j % 9 === 0) {
                        const numberOfReplies = getRandomInt(1, 5);
                        for (let l = 0; l < numberOfReplies; l++) {
                            const replyText = generateMessage(language);
                            const replyResponse = await channel.sendMessage({
                                text: replyText,
                                parent_id: message.id,
                                user_id: users[getRandomInt(0, users.length)],
                                show_in_channel: false,
                            });
                        }
                    }

                    bar1.update(j);
                } catch(e) {
                    console.log('WAITING SINCE SEND MESSAGE FAILED', e);
                    await delay(5000);
                    continue;
                }
            }
            bar1.stop();
            } catch (error) {
                console.log('WAITING SINCE SOMETHING FAILED', error);
                await delay(5000);
                continue;
            }
        }
}

const delay = (t) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, t);
    });
}
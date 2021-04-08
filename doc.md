# Command docs

> - These are auto-generated docs using [script](https://github.com/GetStream/stream-chat-test-data-cli/blob/master/bin/generate-doc.js) or `yarn build`. Please don't modify them directly.
> - All the following commands accept --config or -c argument. Its a config file which contains your app config (apiKey, secret etc)

---

## `create-channels --help`

### Description

**Source**: [bin/create-channels.js](https://github.com/GetStream/stream-chat-test-data-cli/blob/master/bin/create-channels.js)

Creates channels in bulk amount. Channels are created using id prefix (channelIdPrefix) mentioned in config.
If you execute this command multiple times, same channels will be updated with messages. If you want to
generate new set of channels, simply change the channelIdPrefix - so that channels will be requested with
different id. Channels get generated with following id:

```js
const channelId = `${config.channelIdPrefix || 'default'}-channel-${i}`; // i is the loop index
```

### Options

```sh
  -c, --config <config>  Config file in root directory (default:
                         "dev.config.js")
```

---

## `reset-channels --help`

### Description

**Source**: [bin/reset-channels.js](https://github.com/GetStream/stream-chat-test-data-cli/blob/master/bin/create-channels.js)

Alias of create-channels

### Options

```sh
  -c, --config <config>  Config file in root directory (default:
                         "dev.config.js")
```

---

## `reset-all-channels --help`

### Description

**Source**: [bin/reset-all-channels.js](https://github.com/GetStream/stream-chat-test-data-cli/blob/master/bin/reset-all-channels.js)

This script will loop over all the channels that exist on your app, and will reset the messages on them
Its going to do this by calling `client.queryChannels` in loop to fetch all the channels in your app, then then reseting data on them one by one
So it may take a while!!

### Options

```sh
  -c, --config <config>  Config file in root directory (default:
                         "dev.config.js")
```

---

## `create-app-users --help`

### Description

**Source**: [bin/create-app-users.js](https://github.com/GetStream/stream-chat-test-data-cli/blob/master/bin/create-app-users.js)

Adds bulk of users will be generated and added to your app. Please specify number of users to generate.

### Options

```sh
  -c, --config <config>  Config file in root directory (default:
                         "dev.config.js")
  -n, --number <number>  Number of users to generate (default: 0)
```

---

## `create-channel-members --help`

### Description

**Source**: [bin/create-channel-members.js](https://github.com/GetStream/stream-chat-test-data-cli/blob/master/bin/create-channel-members.js)

Bulk of members will be generated and added to your channel. Please specify channelId and number of members to add.
This is usefull when you want to test a channel with >100 members.

### Options

```sh
  -c, --config <config>        Config file in root directory (default:
                               "dev.config.js")
  -i, --channelId <channelId>  Channel id
  -n, --number <number>        Number of members to be added
```

---

## `add-messages --help`

### Description

**Source**: [bin/add-messages.js](https://github.com/GetStream/stream-chat-test-data-cli/blob/master/bin/add-messages.js)

Added bunch of messages to a channel. Please provide channelId and number of messages as arguments.
Also if you want to increase the unread count of channel, then you may add `excludeUser` argument,
so no message will be added from this user. And thus final unread count of channel will be equal to `number` (provided in arguments)

### Options

```sh
  -c, --config <config>        Config file in root directory (default:
                               "dev.config.js")
  -i, --channelId <channelId>  Channel id
  -n, --number <number>        Number of messages to add. By default
                               `numberOfMessagesPerChannel` from your config
                               file will be used
  -e, --excludeUser <number>   Number of messages to add
```

---

## `create-user --help`

### Description

**Source**: [bin/create-user.js](https://github.com/GetStream/stream-chat-test-data-cli/blob/master/bin/create-user.js)

### Options

```sh
  -c, --config <config>  Config file in root directory (default:
                         "dev.config.js")
  -i, --id <id>          Id of user
  -n, --name <name>      Name of user
  -i, --image <image>    Avatar image for user
  -s, --status <status>  Status for user
```

---

## `hide-channel --help`

### Description

**Source**: [bin/hide-channel.js](https://github.com/GetStream/stream-chat-test-data-cli/blob/master/bin/hide-channel.js)

### Options

```sh
  -c, --config <config>        Config file in root directory (default:
                               "dev.config.js")
  -i, --channelId <channelId>  Channel id
  -u, --userId <userId>        user id from which channel needs to be hidden
```

---

## `show-channel --help`

### Description

**Source**: [bin/show-channel.js](https://github.com/GetStream/stream-chat-test-data-cli/blob/master/bin/show-channel.js)

### Options

```sh
  -c, --config <config>        Config file in root directory (default:
                               "dev.config.js")
  -i, --channelId <channelId>  Channel id
  -u, --userId <userId>        user id from which channel needs to be un-hidden
```

---

## `delete-channel --help`

### Description

**Source**: [bin/delete-channel.js](https://github.com/GetStream/stream-chat-test-data-cli/blob/master/bin/delete-channel.js)

### Options

```sh
  -c, --config <config>        Config file in root directory (default:
                               "dev.config.js")
  -i, --channelId <channelId>  Channel id that needs to be deleted
```

---

## `add-member --help`

### Description

**Source**: [bin/add-member.js](https://github.com/GetStream/stream-chat-test-data-cli/blob/master/bin/add-member.js)

### Options

```sh
  -c, --config <configFile>    Config file in root directory (default:
                               "dev.config.js")
  -i, --channelId <channelId>  Channel id
  -m, --userId <userId>        user id to be added
```

---

## `add-moderator --help`

### Description

**Source**: [bin/add-moderator.js](https://github.com/GetStream/stream-chat-test-data-cli/blob/master/bin/add-moderator.js)

### Options

```sh
  -c, --config <config>            Config file in root directory (default:
                                   "dev.config.js")
  -i, --channelId <channelId>      Channel id
  -m, --moderatorId <moderatorId>  user id to be made moderator
```

---

## `remove-member --help`

### Description

**Source**: [bin/remove-member.js](https://github.com/GetStream/stream-chat-test-data-cli/blob/master/bin/remove-member.js)

### Options

```sh
  -c, --config <config>        Config file in root directory (default:
                               "dev.config.js")
  -i, --channelId <channelId>  Channel id
  -m, --userId <userId>        user id to be removed
```

---

## `delete-image --help`

### Description

**Source**: [bin/delete-image.js](https://github.com/GetStream/stream-chat-test-data-cli/blob/master/bin/delete-image.js)

### Options

```sh
  -c, --config <config>        Config file in root directory (default:
                               "dev.config.js")
  -i, --channelId <channelId>  Channel id from which image eneeds to be removed
  -u, --url <url>              Url of the image, to be deleted
```

---

## `playground --help`

### Description

**Source**: [bin/playground.js](https://github.com/GetStream/stream-chat-test-data-cli/blob/master/bin/playground.js)

This is a playground or starter script. Use this space to test some custom js code!!

### Options

```sh
  -c, --config <config>  Config file in root directory (default:
                         "dev.config.js")
```

---

const config = {
    API_KEY: '',
    SECRET: '',

    /**
    * Group channels will be created with these users (id) as members
    * First user of this list will be the creator of channel (since we are using server token for generating channels).
    * 
    * If the users don't exsit, then `CREATE_USERS` as true, so that the script will create/generate these
    * users first, before proceeding to channel creation.
    */
    USERS: ['vishal', 'tommaso', 'jaap'],
    /**
     * If true, users will be first created (if they don't exist in app).
     * Name will be same as userID, with first letter capitalized
     * Some random user avatar will be added for user.
     */
    CREATE_USERS: true,

    CHANNEL_TYPE: 'messaging',
    /** Total number of group channels to create */
    NUMBER_OF_GROUP_CHANNELS: 5,
    /**
     * Channel names will be some random combination of adjective and verb.
     * but if you want to have your own channel names then specify then here.
     * If NUMBER_OF_GROUP_CHANNELS is greater than length of FIXED_CHANNEL_NAMES, then for remainder of channels, name will
     * be auto generated.
     */
    FIXED_CHANNEL_NAMES: [/** stream_chat, amsterdam_office */],

    /** If true, script will also create one-to-one conversation between all users. */
    CREATE_ONE_ON_ONE_CONVERSATIONS: true,

    NUMBER_OF_MESSAGES_PER_CHANNEL: 30,
    /** So number of attachments will vary between 1 and MAX_NUMBER_OF_ATTACHMENTS_PER_MESSAGE */
    MAX_NUMBER_OF_ATTACHMENTS_PER_MESSAGE: 6,

    /** Custom field for channels */
    EXAMPLE: 'testing',

    /** Following reactions will be randomly added to messages. */
    reactions: [
        'like',
        'love',
        'haha',
        'wow',
        'sad',
        'angry',
    ],

    /** Messages will contain following urls once in a while */
    urls: [
        'https://www.youtube.com/watch?v=MhCEdIqFCck',
        'https://getstream.io',
        'https://vimeo.com/65436011',
        'https://www.youtube.com/watch?v=ciNHn38EyRc'
    ],
    language: 'en',
}
module.exports = {
    config
};

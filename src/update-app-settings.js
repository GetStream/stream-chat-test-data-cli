#!/usr/bin/env node
const {StreamChat} = require('stream-chat');
const fs = require('fs');

const [,, ...args] = process.argv;
// const client = new StreamChat('892s22ypvt6m', '5cssrefv55rs3cnkk38kfjam2k7c2ykwn4h79dqh66ym89gm65cxy4h9jx4cypd6')
const {config} = require('../config');
const API_KEY = config.API_KEY;
const SECRET = config.SECRET;
const BASE_URL = config.BASE_URL;
const client = new StreamChat(API_KEY, SECRET)
if (BASE_URL) {
    client.setBaseURL(BASE_URL);
}

// client.setBaseURL('http://192.168.0.84:3030');
client.updateAppSettings({
    apn_config: {
        auth_key: fs.readFileSync(
            '/Users/vishalnarkhede/Documents/push-notification/AuthKey_9SXV646U4K.p8',
            'utf-8',
        ),
        key_id: '9SXV646U4K',
        auth_type: 'token',
        development: true,
        bundle_id: 'org.reactjs.native.example.SampleRNChatApp',
        team_id: 'EHV7XZLAHA',
        notification_template: `{"aps" :{"mutable-content":1,"alert":{"title":"{{ sender.name }}","subtitle":"New direct message from {{ sender.name }}","body":"{{ message.text }}"},"badge":{{ unread_count }},"category":"NEW_MESSAGE"}}`
    },
}).then((response) => {
    return client.getAppSettings()
}).then((response) => {
    console.log(response.app.push_notifications);
    process.exit();
});
// client.updateAppSettings({
//     apn_config: {
//         p12_cert: fs.readFileSync(
//             '/Users/vishalnarkhede/projects/CertificatesVOIP.p12',
//         ),
//         auth_type: 'certificate',
//         team_id: 'EHV7XZLAHA', 
//         development: false,
//         // bundle_id: 'org.reactjs.native.example.SampleRNChatApp',
//         notification_template: `{"aps":{"alert":{"title":"{{ sender.name }}","subtitle":"New direct message from {{ sender.name }}","body":"{{ message.text }}"},"badge":{{ unread_count }},"category":"NEW_MESSAGE"}}`
//     },
// }).then((response) => {
//     return client.getAppSettings()
// }).then((response) => {
//     console.log(response.app.push_notifications);
//     process.exit();
// });
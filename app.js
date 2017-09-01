require('dotenv').config();

const express = require('express');
const WebClient = require('@slack/client').WebClient;
const Imap = require('imap');
const fs = require('fs');
const SimpleParser = require('mailparser').simpleParser;
const util = require('./util/util');
const imapUtil = require('./util/imap');

const variables = require('./util/requiredEnvironmentVariables.json');

if (!util.areAllEnvironmentVariablesSet(process.env, variables)) {
    throw 'Not all required environment variables are set!';
}

if (!fs.existsSync('tmp')) {
    fs.mkdirSync('tmp');
}

const markEmailsAsRead = process.env.DEBUG !== 'true';
const PORT = process.env.SLACK_PORT || 8010;
const imapOptions = {
    user: process.env.IMAP_USERNAME,
    password: process.env.IMAP_PASSWORD,
    host: process.env.IMAP_SERVER,
    port: process.env.IMAP_PORT,
    tls: true
};

const client = new WebClient(process.env.SLACK_TOKEN);
const imap = new Imap(imapOptions);
const app = express();

console.log(`Marking emails as read: ${markEmailsAsRead}`);

app.get('/', (request, response) => {
    imapUtil.openInbox(imap, () => {
        imapUtil.fetchUnseenEmails(imap, markEmailsAsRead, (mails) => {
            if (mails.length === 0) {
                response.end('No new mails!');
                return;
            }

            mails.forEach(mail => {
                SimpleParser(mail).then(mail => {
                    let address = '';
                    mail.to.value.forEach(add => {
                        if (add.address.indexOf('dhbw') === 0) {
                            address = add.address;
                        }
                    });
                    const channel = util.extractChannelFromAddress(address);

                    const sendMessage = (attachmentsString) => {
                        const subject = mail.subject;
                        const from = mail.from.text;

                        const markdownMessage = util.markdownify(mail.textAsHtml);
                        const slackMessage = `<!channel> Mail *${subject}* from _${from}_:\n${markdownMessage}${attachmentsString}`;
                        console.log('Sending message to Slack...');
                        client.chat.postMessage(channel, slackMessage, (error, result) => {
                            if (typeof error !== 'undefined') {
                                throw error;
                            }

                            response.end(`Posted message "${markdownMessage}" to Slack channel ${channel} with result "${JSON.stringify(result)}"`);
                        });
                    };

                    if (mail.attachments.length > 0) {
                        imapUtil.getAttachmentsFromMail(mail.attachments, client, (attachments) => {
                            const attachmentList = attachments.map(attachment => {
                                return `<${attachment.link}|${attachment.name}>`;
                            });
                            const attachmentString = `\n\nAttachments: \n• ${attachmentList.join('\n• ')}`;
                            sendMessage(attachmentString);
                        });
                    } else {
                        sendMessage('');
                    }
                });
            });
        });
    });
});

imap.once('ready', () => {
    console.log('Imap connection established!');
    app.listen(PORT, () => {
        console.log(`App is listening on ${PORT}`);
    });
});

imap.once('error', (error) => {
    throw error;
});

imap.connect();

process.on('SIGINT', () => {
    console.log('Closing IMAP connection...');
    imap.end();
    console.log('Closed!\n');
    process.exit();
});

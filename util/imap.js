const fs = require('fs');

const openInbox = (imap, callback) => {
  imap.openBox('INBOX', false, (error, box) => {
    if (typeof error !== 'undefined') {
      throw error;
    }

    callback(box);
  });
};

const fetchUnseenEmails = (imap, markEmailsAsRead, callback) => {
  imap.search(['UNSEEN'], (error, results) => {
    if (typeof error !== 'undefined') {
      throw error;
    }

    if (results.length === 0) {
      callback([]);
      return;
    }

    const messages = imap.fetch(results, {
      markSeen: markEmailsAsRead,
      bodies: ''
    });

    let mails = [];

    const mailFinished = (mail) => {
      mails.push(mail);
      if (mails.length === results.length) {
        callback(mails);
      }
    };

    messages.on('message', (message) => {
      message.on('body', (stream) => {
        let data = '';
        stream.on('data', chunk => {
          data += chunk;
        });
        stream.on('end', () => {
          mailFinished(data);
        });
      });
    });
  });
};

const getAttachmentsFromMail = (mailAttachments, client, callback) => {
  let attachments = [];
  let currentElement = 0;
  mailAttachments.forEach((attachment) => {
    fs.writeFile(`tmp/${attachment.filename}`, attachment.content, (error) => {
      if(error !== null) {
        throw error;
      }

      client.files.upload(attachment.filename, {
        file: fs.createReadStream(`tmp/${attachment.filename}`)
      }, (error, result) => {
        fs.unlink(`tmp/${attachment.filename}`, (error) => {
          if(error !== null) {
            throw error;
          }
        });

        if (typeof error !== 'undefined') {
          throw error;
        }

        client.files.sharedPublicURL(result.file.id, (error, result) => {
          if (typeof error !== 'undefined') {
            throw error;
          }

          attachments.push({
            name: attachment.filename,
            link: result.file.permalink_public
          });
          if (++currentElement === mailAttachments.length) {
            callback(attachments);
          }
        });
      });
    });
  });
};

module.exports = {
  openInbox,
  fetchUnseenEmails,
  getAttachmentsFromMail
};
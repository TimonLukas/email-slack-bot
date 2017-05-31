const toMarkdown = require('to-markdown');
const stripTags = require('striptags');

const areAllEnvironmentVariablesSet = (environment, variables) => {
  let areAllThere = true;
  variables.forEach(variable => {
    if (typeof environment[variable] === 'undefined') {
      areAllThere = false;
    }
  });

  return areAllThere;
};

const markdownify = (html) => {
  const parsed = toMarkdown(html);
  const lines = parsed.split('\n').filter(line => {
    return line.trim().length > 0;
  }).map(line => {
    return stripTags(line).length > 0 ? line + '\n' : line;
  }).join("");

  // There is a zero-width space in front of the "join" thingys!
  const bReplaced = lines.split('**').join('​*​');
  const iReplaced = bReplaced.split('_').join('​_​');
  const imagesReplaced = iReplaced.replace(/\(data:image[\s\S]*?\)/, '');

  return stripTags(imagesReplaced);
};

const filterEmptyParts = (part) => {
  if (part !== '') {
    return part;
  }
};

const extractChannelFromAddress = (address) => {
  const emailParts = address.split('@').filter(filterEmptyParts);
  if (emailParts.length !== 2) {
    throw new Error(`An email address must have data before and after the @, and only have one @!. Provided: ${address}`);
  }

  const channelPart = emailParts[0];
  const channelParts = channelPart.split('+').filter(filterEmptyParts);
  if (channelParts.length < 2) {
    throw new Error(`An email must have a plus sign with a channel name coming after it. Provided: ${address}`);
  }

  return channelParts.slice(1).join('+');
};

module.exports = {
  areAllEnvironmentVariablesSet,
  markdownify,
  extractChannelFromAddress
};
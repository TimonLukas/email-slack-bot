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

  // There is a zero-width space in front of the "join" thingys!
  const bReplaced = parsed.split('**').join('​*​');
  const iReplaced = bReplaced.split('_').join('​_​');
  return stripTags(iReplaced);
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
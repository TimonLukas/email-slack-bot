const chai = require('chai');
const should = chai.should();

const util = require('./../util/util');
const imap = require('./../util/imap');

const data = require('./data.json');

describe('util', () => {
  describe('#extractChannelFromAddress', () => {
    it('should correctly extract the channel name from any given email', (done) => {
      data.util.extractChannelFromAddress.correct.forEach(testCase => {
        util.extractChannelFromAddress(testCase.address).should.be.equal(testCase.result);
      });

      done();
    });

    it('should throw an error if a malformed email is provided', (done) => {
      data.util.extractChannelFromAddress.wrong.forEach(testCase => {
        (() => {
          util.extractChannelFromAddress(testCase);
        }).should.throw();
      });

      done();
    });
  });
});
const chai = require('chai');
const should = chai.should();

const util = require('./../util/util');
const imap = require('./../util/imap');

/**
 * @param {Function} fn
 * @param params
 * @returns {function()}
 */
const wrap = (fn, ...params) => {
  return (() => {
    fn(...params);
  });
};

describe('util', () => {
  describe('#extractChannelFromAddress', () => {
    it('should correctly extract the channel name from any given email', done => {
      util.extractChannelFromAddress('abcd+test@mail.com').should.be.equal('test');
      util.extractChannelFromAddress('abcd+mocha+chai@mail.com').should.be.equal('mocha+chai');
      util.extractChannelFromAddress('asdf+asdf@asdf.com').should.be.equal('asdf');
      done();
    });

    it('should throw an error if a malformed email is provided', done => {
      wrap(util.extractChannelFromAddress, 'abcd@mail.com').should.throw('plus');
      wrap(util.extractChannelFromAddress, 'abcd@mail@test.com').should.throw('@');
      done();
    });
  });

  describe('#areAllEnvironmentVariablesSet', () => {
    it('should return true if everything needed is declared', done => {
      util.areAllEnvironmentVariablesSet({
        'foo': 'EXAMPLE',
        'bar': 'EXAMPLE',
        'baz': 'EXAMPLE'
      }, ['foo', 'bar', 'baz']).should.be.equal(true);
      util.areAllEnvironmentVariablesSet({
        'foo': 'EXAMPLE',
        'bar': 'EXAMPLE',
        'baz': 'EXAMPLE'
      }, ['foo', 'bar']).should.be.equal(true);
      done();
    });

    it('should return false if not everything needed is declared', done => {
      util.areAllEnvironmentVariablesSet({
        'foo': 'EXAMPLE',
        'bar': 'EXAMPLE'
      }, ['foo', 'bar', 'baz']).should.be.equal(false);
      util.areAllEnvironmentVariablesSet({
        'foo': 'EXAMPLE',
        'baz': 'EXAMPLE'
      }, ['foo', 'bar']).should.be.equal(false);
      done();
    });

    it('should respect the case', done => {
      util.areAllEnvironmentVariablesSet({
        'foo': 'EXAMPLE',
        'bar': 'EXAMPLE'
      }, ['FOO', 'BaR']).should.be.equal(false);
      util.areAllEnvironmentVariablesSet({
        'Foo': 'EXAMPLE',
        'Bar': 'EXAMPLE'
      }, ['foo', 'bar']).should.be.equal(false);
      done();
    });
  });
});
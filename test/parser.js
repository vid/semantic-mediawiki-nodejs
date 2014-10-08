// #parser tests
//
// adapted from http://stackoverflow.com/questions/6532276/regex-to-match-mediawiki-template-and-its-parameters

/* jslint node: true */
/* global describe, it */


'use strict';
var parser = require('../lib/parser.js');

var expect = require('expect.js');

describe('wikiTemplate', function() {
  it('should parse empty templates', function() {
    var res = parser.parseTemplates('{{name}}');
    expect(res.length).to.be(1);
    expect(res).to.eql([{id: 'name'}]);
  });

  it('should ignore text outside from template', function() {
    var res = parser.parseTemplates(' abc {{name}} x y');
    expect(res.length).to.be(1);
    expect(res).to.eql([{id: 'name'}]);
  });

  it('should parse simple param', function() {
    var res = parser.parseTemplates('{{template | p1= 2}}');
    expect(res.length).to.be(1);
    expect(res).to.eql([{id: 'template', p1: '2'}]);
  });

  it('should parse a list of arguments', function() {
    var res = parser.parseTemplates('{{name | a= [[1|two]]}}');
    expect(res.length).to.be(1);
    expect(res).to.eql([{id: 'name', a: ['1', 'two']}]);
  });

  it('should parse param after list', function() {
    var res = parser.parseTemplates('{{name | a= [[1|two|3]] | p2= true}}');
    expect(res.length).to.be(1);
    expect(res).to.eql([{id: 'name', a: ['1', 'two', '3'], p2: 'true'}]);
  });

  it('should parse multiple template', function() {
    var res = parser.parseTemplates('{{first | a= [[1|two|3]] }} odd test {{second | b= 2}}');
    expect(res.length).to.be(2);
    expect(res).to.eql([{id: 'first', a: ['1', 'two', '3']}, {id: 'second', b: '2'}]);
  });

  it('should parse nested templates', function() {
    var res = parser.parseTemplates('{{name | a= {{nested | p1= 1}} }}');
    expect(res.length).to.be(1);
    expect(res).to.eql([{id: 'name', a: {id: 'nested', p1: '1'}}]);
  });
});

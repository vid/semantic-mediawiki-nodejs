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
    expect(res).to.eql([{_template: 'name'}]);
  });

  it('should ignore text outside from template', function() {
    var res = parser.parseTemplates(' abc {{name}} x y');
    expect(res).to.eql([{_template: 'name'}]);
  });

  it('should parse simple param', function() {
    var res = parser.parseTemplates('{{template | p1= 2}}');
    expect(res).to.eql([{_template: 'template', p1: '2'}]);
  });

  it('should parse a list of arguments', function() {
    var res = parser.parseTemplates('{{name | a= [[1|two]]}}');
    expect(res).to.eql([{_template: 'name', a: ['1', 'two']}]);
  });

  it('should parse param after list', function() {
    var res = parser.parseTemplates('{{name | a= [[1|two|3]] | p2= true}}');
    expect(res).to.eql([{_template: 'name', a: ['1', 'two', '3'], p2: 'true'}]);
  });

  it('should parse multiple template', function() {
    var res = parser.parseTemplates('{{first | a= [[1|two|3]] }} odd test {{second | b= 2}}');
    expect(res).to.eql([{_template: 'first', a: ['1', 'two', '3']}, {_template: 'second', b: '2'}]);
  });

  it('should parse nested templates', function() {
    var res = parser.parseTemplates('{{name | a= {{nested | p1= 1}} }}');
    expect(res).to.eql([{_template: 'name', a: {_template: 'nested', p1: '1'}}]);
  });
});

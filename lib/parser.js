// # parse
//
// Parse mediawiki templates.
//
// adapted from http://stackoverflow.com/questions/6532276/regex-to-match-mediawiki-template-and-its-parameters

/*jslint node: true */

var NO_TPL = 0, // outside any template - ignoring...
    IN_TPL = 1, // inside template
    IN_LIST = 3; // inside list of arguments

exports.parseTemplates = function(src) {
  var tokens = src.split(/(\{\{|\}\}|\||=|\[\[|\]\])/),
      i = -1, end = tokens.length - 1,
      token, next, state = NO_TPL,
      work = [], workChain = [], stateChain = [];

  function trim(value) {
    return value.replace(/^\s*/, '').replace(/\s*$/, '');
  }

  // get next non empty token
  function getNext(next) {
    while (!next && i < end) next = trim(tokens[++i]);
    return next;
  }

  // go into template / list of arguments
  function goDown(newState, newWork, newWorkKey) {
    stateChain.push(state);
    workChain.push(work);

    if (newWorkKey) {
      work[newWorkKey] = newWork;
    } else {
      work.push(newWork);
    }

    work = newWork;
    state = newState;
  }

  // jump up from template / list of arguments
  function goUp() {
    work = workChain.pop();
    state = stateChain.pop();
  }

  // state machine
  while ((token = getNext())) {
    switch(state) {

      case IN_TPL:
        switch(token) {
          case '}}': goUp(); break;
          case '|': break;
          default:
            next = getNext();
            if (next != '=') throw "invalid";
            next = getNext();
            if (next == '[[') {
              goDown(IN_LIST, [], token);
            } else if (next == '{{') {
              goDown(IN_TPL, {id: getNext()}, token);
            } else {
              work[token] = next;
            }
        }
        break;

      case IN_LIST:
        switch(token) {
          case ']]': goUp(); break;
          case '|': break;
          default: work.push(token);
        }
        break;

      case NO_TPL:
        if (token == '{{') {
          next = getNext();
          goDown(IN_TPL, {id: next});
        }
        break;
    }
  }

  return work;
};

// @ts-ignore
import examples from "../../constants/examples.yaml";

const yaml = require('js-yaml');

let examplesText = `
StateMachine:
  Contains aba:
    name: name
    charset: a, b
    states: S, K, A-B, R
    init: S
    accept: R
    transitions:
      - S . S
      - S $ K
      - K a A
      - A b B
      - B a R
      - R . R
  Even number:
    name: name
    charset: 0, 1
    states: S, A, R
    init: S
    accept: A
    transitions:
        - S . S
        - S 0 A
        - S 1 R

PushdownMachine:
  Example:
    name: name
    charset: a, b
    states: A-C
    init: A
    accept: B
    transitions:
      - A a a/b B
      - B b b/a C

TuringMachine:
  Palindrome:
    name: name
    init: start
    charset: a, b
    states:
      - start
      - haveA, haveB
      - matchA, matchB
      - back
      - accept, reject
    accept: accept
    transitions:
      - start a/_ > haveA
      - start b/_ > haveB
      - start _/& > accept

      - haveA ./& > haveA
      - haveA _/& < matchA

      - haveB ./& > haveB
      - haveB _/& < matchB

      - matchA a/_ < back
      - matchA b/& > reject
      - matchA _/& > accept

      - matchB a/& > reject
      - matchB b/_ < back
      - matchB _/& > accept

      - back ./& < back
      - back _/& > start

Grammar:
  Example:
    name: name
    charset: a, b
    variables: S, A, B
    init: S
    rules:
      - S -> aA|bB
      - A -> aA|a
      - B -> bB|b
`

export function loadExamples(): Map<string, Map<string, string>> {
    let parsed = yaml.load(examplesText);

    //each property to key and each child to second key, and value to value
    let out = new Map<string, Map<string, string>>();
    for (let key in parsed) {
        let value = parsed[key];

        let inner = new Map<string, string>();

        for (let innerKey in value) {
            let innerValue = yaml.dump(value[innerKey], {
                condenseFlow: 2
            });
            innerValue = innerValue.replace(/^/gm, '  ');
            innerValue = innerValue.replace(/\s+$/, '');
            inner.set(innerKey, `${key}:\n${innerValue}`);
        }

        out.set(key, inner);
    }
    return out;
}
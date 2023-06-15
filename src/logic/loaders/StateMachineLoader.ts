import {StateMachine} from "../expressions/StateMachine";
import {toArray} from "../common";

const yaml = require('js-yaml');

function parseTransition(opts: Array<Array<string>>, a: Array<string>, out: Map<string, Map<string, Set<string>>>, i: number = 0, inputs: Array<string> = []) {
    if (i === 3) {
        out?.get(inputs[0])?.get(inputs[1])?.add(inputs[2] === "&" ? inputs[0] : inputs[2]);
    } else if (a[i] === '.') {
        opts[i].forEach(o => {
            parseTransition(opts, a, out, i + 1, inputs.concat(o));
        })
    } else {
        parseTransition(opts, a, out, i + 1, inputs.concat(a[i]))
    }
}

export function loadStateMachine(machineText: string): StateMachine | null {
    let parsed = yaml.load(machineText);
    if (parsed !== undefined && parsed.hasOwnProperty('StateMachine')) {
        parsed = parsed['StateMachine'];

        let toArray = (x: string | Array<string>) => {
            let out: Array<string> = [];

            if (typeof x === 'string') {
                out = x.split(',').filter(t => t != "").map(t => t.trim());
            } else {
                out = x;
            }

            out = out.filter(t => t != null);
            out = out.flatMap(t => t.split(",").filter(t => t != "")).map(t => t.trim());

            out = out.filter(s => s != null);

            out = out.flatMap((t: string) => {
                if (t.includes('-')) {
                    let fromToArray: Array<string> = t.split('-');
                    let from = fromToArray[0].charCodeAt(0);
                    let to = fromToArray[1].charCodeAt(0);

                    return Array(to - from + 1).fill(0).map((_, i) => String.fromCharCode(from + i))
                }
                return t;
            })

            return out;
        }

        let charsetText = toArray('' + parsed['charset']);
        let statesText = toArray('' + parsed['states']);
        let acceptText = toArray('' + parsed['accept']);
        let transitionsText = toArray(parsed['transitions']);

        let transitions = new Map<string, Map<string, Set<string>>>();

        statesText.forEach((state: string) => {
            transitions.set(state, new Map<string, Set<string>>());
            charsetText.forEach((c: string) => {
                transitions.get(state)?.set(c, new Set<string>());
            })
            transitions.get(state)?.set('$', new Set<string>());
        })

        transitionsText.forEach((t: string) => {
            let a = t.split(' ');
            if (a.length != 3) return null;

            parseTransition([statesText, charsetText, statesText], a, transitions);


        })

        return new StateMachine(parsed['name'], charsetText, statesText, parsed['init'], acceptText, transitions);
    }

    return null;
}

export function saveStateMachine(obj: StateMachine): string {
    let coded: any = {};
    coded.name = obj.name;
    coded.charset = toArray(obj.charset).join(', ');
    coded.states = toArray(obj.states).join(', ');
    coded.init = obj.init;
    coded.accept = toArray(obj.accept).join(', ');
    coded.transitions = [];
    obj.transitions.forEach((value, from) => {
        value.forEach((states, c) => {
            states.forEach(s => {
                coded.transitions.push(`${from} ${c} ${s}`);
            })
        })
    })
    return yaml.dump({'StateMachine': coded}, {
        condenseFlow: 2
    }).replaceAll("'", "");
}
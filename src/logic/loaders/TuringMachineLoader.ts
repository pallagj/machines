import {ITask, TuringMachine} from "../expressions/TuringMachine";
import {toArray} from "../common";
const yaml = require('js-yaml');

function parseTransition(
    opts: Array<Array<string>>,
    a: Array<string>,
    out: Map</* from */string, Map</* char */string, Set<ITask>>>,
    i: number = 0,
    inputs: Array<string> = []) {

    /*
        A a/b > B
        0 1 2 3 4
     */


    if (i === 5) {
        out?.get(inputs[0])?.get(inputs[1])?.add(<ITask>{
            nextState: inputs[4] === "&" ? inputs[0] : inputs[4],
            move: inputs[3],
            write: inputs[2] === "&" ? inputs[1]: inputs[2]
        });
    } else if (a[i] === '.') {
        opts[i].forEach(o => {
            parseTransition(opts, a, out, i + 1, inputs.concat(o));
        })
    } else {
        parseTransition(opts, a, out, i + 1, inputs.concat(a[i]))
    }

}

export function loadTuringMachine(machineText: string): TuringMachine | null {

    let parsed = yaml.load(machineText);
    if (parsed !== undefined && parsed.hasOwnProperty('TuringMachine')) {
        parsed = parsed['TuringMachine'];

        let toArray = (x: string | Array<string>) => {
            let out: Array<string> = [];

            if (typeof x === 'string') {
                out = x.split(',').filter(t=>t != "").map(t => t.trim());
            } else {
                out = x;
            }

            out = out.filter(t=>t!=null);
            out = out.flatMap(t => t.split(",").filter(t=>t != "")).map(t => t.trim());

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

        let charsetText = toArray(parsed['charset']);
        let statesText = toArray(parsed['states']);
        let acceptText = toArray(parsed['accept']);
        let transitionsText = toArray(parsed['transitions']);

        let transitions = new Map</* from */string, Map</* char */string, Set<ITask>>>();

        statesText.forEach((state: string) => {
            transitions.set(state, new Map</* char */string, Set<ITask>>());
            charsetText.forEach((c: string) => {
                transitions.get(state)?.set(c, new Set<ITask>());
            })
            transitions.get(state)?.set("_", new Set<ITask>());
        })

        transitionsText.forEach((t: string) => {
            let a = t.split(' ');
            if (a.length != 4) return null;

            a = [
                a[0],
                a[1].split("/")[0],
                a[1].split("/")[1],
                a[2],
                a[3]
            ];

            parseTransition([statesText, charsetText, charsetText, [">", "<", "="], statesText], a, transitions);


        })

        return new TuringMachine(parsed['name'], new Set(charsetText), new Set(statesText), parsed['init'], new Set(acceptText), transitions);
    }

    return null;
}

export function saveTuringMachine(obj:TuringMachine):string {
    let coded:any = {};
    coded.name = obj.name;
    coded.charset = toArray(obj.charset).join(', ');
    coded.states = toArray(obj.states).join(', ');
    coded.init = obj.init;
    coded.accept = toArray(obj.accept).join(', ');
    coded.transitions = [];
    obj.transitions.forEach((value, from) =>{
        value.forEach((tasks, c) => {
            tasks.forEach((task) => {
                coded.transitions.push(`${from} ${c}/${task.write} ${task.move} ${task.nextState}`);
            })
        })
    })
    return yaml.dump({'TuringMachine': coded}, {
        condenseFlow: 2
    }).replaceAll("'", "");
}
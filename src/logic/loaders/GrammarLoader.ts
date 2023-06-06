import {toArray} from "../common";
import {Grammar} from "../expressions/Grammar";
const yaml = require('js-yaml');

export function loadGrammar(grammarText: string): Grammar | null {

    let parsed = yaml.load(grammarText);
    if (parsed !== undefined && parsed.hasOwnProperty('Grammar')) {
        parsed = parsed['Grammar'];

        let toArray = (x: string | Array<string>, interval:boolean = true) => {
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
                if (t.includes('-') && interval) {
                    let fromToArray: Array<string> = t.split('-');
                    let from = fromToArray[0].charCodeAt(0);
                    let to = fromToArray[1].charCodeAt(0);

                    return Array(to - from + 1).fill(0).map((_, i) => String.fromCharCode(from + i))
                }
                return t;
            })

            return out;
        }

        let name = parsed['name'];
        let init = parsed['init'];
        let charsetText = toArray(parsed['charset']);
        let variablesText = toArray(parsed['variables']);
        let rulesText = toArray(parsed['rules'], false);

        let rules = new Map<string, string[]>();

        rulesText.forEach(rule => {
            rule = rule.replaceAll(" ", "");
            let s = /(.*)->(.*)/.exec(rule);
            if(s !== null) {
                rules.set(s[1], s[2].split("|"));
            }
        })


        return new Grammar(name, init, variablesText, charsetText, rules);
    }

    return null;
}

export function saveGrammar(obj:Grammar):string {
    let coded:any = {};

    coded.name = obj.name;
    coded.init = obj.init;
    coded.charset = toArray(obj.charset).join(', ');
    coded.variables = toArray(obj.variables).join(', ');
    coded.rules = [];
    obj.rules.forEach((value, key) => {
        let s = key + " -> ";

        for(let i=0; i<value.length; i++) {
            if(i !== 0) s += " | ";
            s += value[i];
        }

        coded.rules.push(s);
    })

    return yaml.dump({'Grammar': coded}, {
        condenseFlow: 2
    }).replaceAll("'", "");
}
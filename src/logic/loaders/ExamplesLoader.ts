// @ts-ignore
import examples from "../../examples.yaml";

const yaml = require('js-yaml');

let examplesText: string | null = null;
export let examplesPromise = fetch(examples)
    .then(r => r.text())
    .then(text => {
        examplesText = text;
        return loadExamples();
    });


export function loadExamples(): Map<string, Map<string, string>> | null {
    if (examplesText == null) {
        return null;
    }

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
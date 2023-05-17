import {StateMachine} from "./StateMachine";
import {hasIntersect, toArray} from "../common";
import {PushdownMachine} from "./PushdownMachine";

export class Grammar {
    name: string = "";
    init: string = ""
    variables: Set<string> = new Set<string>();
    charset: Set<string> = new Set<string>();
    rules: Map<string, string[]> = new Map<string, string[]>();

    constructor(name: string, init: string, variables: Array<string>, charset: Array<string>, rules: Map<string, string[]>) {
        this.name = name;
        this.init = init;
        this.variables = new Set<string>(variables);
        this.charset = new Set<string>(charset);
        this.rules = rules;
    }

    classify(): {class: number, epsfree: boolean} {
        //TODO: S nem fordulhat elő bal ? jobb oldalt...
        let testClass = (testVariable: (variable: string) => boolean, testSub: (variable: string) => boolean) => {
            let test: boolean = true;
            let epsfree: boolean = true;

            this.rules.forEach((value, key) => {
                if (!testVariable(key)) {
                    test = false;
                }
                value.forEach(value => {
                    if(value.includes("ε")) {
                        if(value.length > 1)
                            epsfree = false;
                        else if(this.init !== key)
                            epsfree = false;
                    }

                    if (!testSub(value)) {
                        test = false;
                    }
                })
            })

            return {result: test, epsfree: epsfree};
        }

        //3
        let c3 = testClass(
            v => this.variables.has(v),
            s => (
                    s.length === 2
                    && this.charset.has(s[0])
                    && this.variables.has(s[1])
                )
                || (
                    s.length === 1
                    && this.charset.has(s)
                ));
        if (c3.result) {
            return {class: 3, epsfree: c3.epsfree};
        }

        let c2 = testClass(v => this.variables.has(v), s => {
            if (s.length === 0) return false;

            s.split("").forEach(c => {
                if (!this.charset.has(c) && !this.variables.has(c)) {
                    return false;
                }
            })

            return true;
        });
        if (c2.result) {
            return {class: 2, epsfree: c2.epsfree};
        }

        let result = {class: 1, epsfree: true};

        this.rules.forEach((value, key) => {
            value.forEach(v => {
                let correct = false;

                key.split("").forEach((c, index) => {
                    if (this.variables.has(c)) {
                        let beta = key.substring(0, index);
                        let gamma =key.substring(index + 1);

                        if(v.startsWith(beta)
                            && v.endsWith(gamma)
                            && v.length > beta.length + gamma.length) {

                            correct = true;
                        }
                    }
                })

                if(!correct) {
                    result.class = 0;
                }
            })
        })


        return result;
    }

    getStateMachine() {
        if (this.classify().class !== 3) return null;

        let m = new StateMachine(this.name, toArray(this.charset), toArray(this.variables), this.init, [], new Map());

        m.states.add("Accept")
        m.accept.add("Accept");


        this.rules.forEach((values, key) => {
            values.forEach(value => {
                if (value.length === 2) {
                    m.addTransition(m.transitions, key, value[0], value[1], false);
                } else {
                    m.addTransition(m.transitions, key, value, "Accept", false);
                }

            })
        })

        return m;
    }

    getPushdownMachine(): PushdownMachine | null {
        if (this.classify().class !== 2) return null;

        let m = new PushdownMachine(this.name, this.charset, new Set(["S", "A"]), "S", new Set(), new Map());


        this.rules.forEach((values, key) => {
            values.forEach(value => {
                m.addTransition("S", "ε", {read: key, write: value, nextState: "S"})
            })
        })

        m.charset.forEach(c => {
            m.addTransition("S", c, {read: c, write: "ε", nextState: "S"})
        })


        m.addTransition("S", "ε", {read: "Z", write: "Z", nextState: "A"})

        return m;
    }

    epsfree(): void {
        let c = this.classify();

        if(c.class === 3 && !c.epsfree) {

        }
    }

    //TODO: eps, lehet levezetés hossz szerint megkötni
    words(n: number, list: Array< {word: string, path: string}>, word = this.init, path = this.init){
        if(word.length > n)
            return;


        if(word.length === n && !hasIntersect(new Set(word.split("")), this.variables)) {
            list.push({word: word, path: path});
            return;
        }


        this.rules.forEach((rights, left) => {
            if(word.includes(left)) {
                rights.forEach(right => {
                    let newWord = word.replace(left, right);

                    this.words(n, list, newWord, path + "→"+newWord);
                })
            }
        });
    }

}
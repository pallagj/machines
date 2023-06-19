import {difference, hasIntersect, intersect, toArray, union} from "../common";
import {Grammar} from "./Grammar";
import {IMachine, MachineState} from "../IMachine"

export interface ITransition {
    from: string;
    to: string;
    text: string
}

class AllUnorderedPairs {
    private pairs: Map<string, number> = new Map<string, number>();

    constructor(states: Set<string>) {
        states.forEach(p => {
            states.forEach(q => {
                if (p < q) this.pairs.set(`${p}-${q}`, 0);
            });
        });
    }

    set(p: string, q: string, value: number) {
        if (p > q) {
            let t = p;
            p = q;
            q = t;
        }
        this.pairs.set(`${p}-${q}`, value);
    }

    get(p: string, q: string): number | null {
        if (p > q) {
            let t = p;
            p = q;
            q = t;
        }
        return this.pairs.get(`${p}-${q}`) ?? null;
    }

    forEach(callback: (p: string, q: string, value: number) => void) {
        this.pairs.forEach((value, pair) => {
            let [p, q] = pair.split("-");
            callback(p, q, value);
        });
    }

    forEachAtValue(expectValue: number, callback: (p: string, q: string) => void) {
        this.pairs.forEach((value, pair) => {
            if (expectValue === value) {
                let [p, q] = pair.split("-");
                callback(p, q);
            }
        });
    }

    clone() {
        let clonedPairs = new Map<string, number>();
        this.pairs.forEach((value, pair) => {
            clonedPairs.set(pair, value);
        });

        let cloned = new AllUnorderedPairs(new Set<string>());
        cloned.pairs = clonedPairs;
        return cloned;
    }

    delete(p: string, q: string) {
        if (p > q) {
            let t = p;
            p = q;
            q = t;
        }
        this.pairs.delete(`${p}-${q}`);
    }
}

class ListForPairs {
    list = new Map<string, Set<string>>();

    put(p: string, q: string, p1: string, q1: string) {
        if (p > q) {
            let t = p;
            p = q;
            q = t;
        }
        if (p1 > q1) {
            let t = p1;
            p1 = q1;
            q1 = t;
        }
        if (this.list.has(`${p}-${q}`)) {
            this.list.set(`${p}-${q}`, new Set([`${p1}-${q1}`]));
        } else {
            this.list.get(`${p}-${q}`)?.add(`${p1}-${q1}`);
        }
    }

    get(p: string, q: string): Set<string[]> | null {
        if (p > q) {
            let t = p;
            p = q;
            q = t;
        }
        let list = this.list.get(`${p}-${q}`);
        return list ? new Set(toArray(list).map(pair => pair.split("-"))) : null;
    }

    forEachOnPair(p: string, q: string, callback: (p: string, q: string) => void) {
        if (p > q) {
            let t = p;
            p = q;
            q = t;
        }
        let pairs = this.list.get(`${p}-${q}`);
        if (pairs) {
            toArray(pairs).forEach(pair => {
                let [p1, q1] = pair.split("-");
                callback(p1, q1);
            });
        }
    }

    has(p: string, q: string) {
        if (p > q) {
            let t = p;
            p = q;
            q = t;
        }
        return this.list.has(`${p}-${q}`);
    }
}

export class StateMachine implements IMachine {
    name: string;
    charset: Set<string>;
    states: Set<string>;
    init: string
    accept: Set<string>;
    transitions: Map</* from */string, Map</* char */string, Set</* to */string>>>;
    lastChar = "";
    //Simulation
    private currentStates: Set<string>;
    private input: string;
    private index: number;
    private mState: "rejected" | "accepted" | "working" | "stopped";

    constructor(name: string, charset: Array<string>, states: Array<string>, init: string, accept: Array<string>, transitions: Map<string, Map<string, Set<string>>>) {
        this.name = name;
        this.charset = new Set(charset);
        this.states = new Set(states);
        this.init = init;
        this.accept = new Set(accept);
        this.transitions = transitions;

        this.currentStates = new Set([this.init]);
        this.addEpsStates();
        this.input = "";
        this.index = 0;
        this.mState = "working";
    }

    static createMachine(numberOfStates: number, numberOfChars: number): StateMachine {
        console.log(`Creating machine with ${numberOfStates} states and ${numberOfChars} chars`)
        let states = Array.from({length: numberOfStates}, (_, i) => String.fromCharCode(65 + i));
        let charset = Array.from({length: numberOfChars}, (_, i) => String.fromCharCode(97 + i));
        let accept = [states[states.length - 1]];

        let transitions = new Map<string, Map<string, Set<string>>>();

        states.forEach((state: string) => {
            transitions.set(state, new Map<string, Set<string>>());
            charset.forEach((c: string) => {
                transitions.get(state)?.set(c, new Set<string>([states[Math.floor(Math.random() * states.length)]]));
            })
        });

        return new StateMachine("m", charset, states, states[0], accept, transitions);
    }

    getAsGrammar(state = this.init): Grammar | null {
        let rules: Map<string, string[]> = new Map();

        this.transitions.forEach((values, key) => {
            values.forEach((sets, key2) => {
                let rights: string[] = [];
                sets.forEach(s => {
                    rights.push(key2 + s)
                })
                rules.set(key, rights);
            })
        })

        return new Grammar(this.name, this.init, toArray(this.states), toArray(this.charset), rules);
    }

    reset() {
        this.currentStates = new Set([this.init]);
        this.addEpsStates();
        this.index = 0;
        this.mState = "working";
        this.input = "";
    }

    addEpsStates(startStates: Set<string> = this.currentStates) {
        startStates.forEach((state) => {
            this.addEpsStatesHelper(startStates, state, true);
        })
    }

    addEpsStatesHelper(startStates: Set<string>, state: string, init: boolean = false) {
        if (!init) {
            if (startStates.has(state)) return;

            startStates.add(state);
        }

        let states = this?.transitions?.get(state)?.get('$');

        states?.forEach(newEpsState => {
            this.addEpsStatesHelper(startStates, newEpsState)
        })

    }

    nextState(from_to: string = "") {
        if (this.mState === "rejected" || this.mState === "accepted") return;

        let newStates: Set<string> = new Set();
        this.lastChar = this.input.charAt(this.index);

        //$ states to currentStates
        this.addEpsStates();

        if (from_to !== "") {
            let [from, to] = from_to.split(":");

            this?.transitions?.get(from)?.forEach((states, c) => {
                if(states.has(to) && (c === "$" || c === this.lastChar)) {
                    newStates = new Set<string>(to);
                    this.lastChar = c
                }
            });
        } else {
            this.currentStates.forEach((state) => {
                let states = this?.transitions?.get(state)?.get(this.lastChar);
                if (states !== undefined) newStates = union(newStates, states);
            })
        }

        if (newStates.size === 0) {
            this.mState = "rejected";
        } else {
            this.currentStates = newStates;
            this.addEpsStates();

            if (this.index === this.input.length - 1) {
                this.mState = hasIntersect(newStates, this.accept) ? "accepted" : "rejected";
            }

            if(this.lastChar !== "$")
                this.index++;
        }
    }

    getCurrentStates(): Set<string> {
        return this.currentStates;
    }

    getMachineState(): "rejected" | "accepted" | "working" | "stopped" {
        return this.mState;
    }

    getTapeIndex(index: number): number {
        return this.index;
    }

    getTapeValue(index: number): string {
        return this.input;
    }

    delta(from: string, c: string): string {
        return this.transitions.get(from)?.get(c)?.values().next().value;
    }

    getTransitions() {
        let out: Map<string, Map<string, Set<{ label: string, selected: boolean }>>> = new Map();

        this?.transitions.forEach((v0, from) => {
            v0.forEach((vl, c) => {
                vl.forEach((to) => {
                    if (!out.has(from)) {
                        out.set(from, new Map());
                    }

                    if (!out?.get(from)?.has(to)) {
                        out?.get(from)?.set(to, new Set());
                    }

                    out?.get(from)?.get(to)?.add({label: c.replace('$', 'ε'), selected: this.input[this.index] === c})
                });
            });
        });

        return out;
    }

    getTransitionsTable(): Array<{ state: string, items: Array<string> }> {
        let out = new Array<{ state: string, items: Array<string> }>();

        this.states.forEach((state) => {
            let outCharset = new Array<string>();

            this.charset.forEach((c) => {
                let item: string = "";
                let targetStates = this.transitions?.get(state)?.get(c);

                targetStates?.forEach((targetState) => {
                    item += ((item === "" ? "" : ", ") + targetState);
                })

                outCharset.push(item);
            })

            out.push({state: state, items: outCharset});
        });

        return out;
    }

    setTapeValue(index: number, input: string): void {
        this.input = input;
        this.reset();
    }

    run(): void {
        while (this.mState === "working") {
            this.nextState();
        }
    }

    isSteppable(): boolean {
        return true;
    }

    clone(): StateMachine {
        let name = this.name + "'";
        let init = this.init;
        let charset = Array.from(this.charset);

        let accept = Array.from(this.accept);
        let trans = new Map</* from */string, Map</* char */string, Set</* to */string>>>();

        this.transitions.forEach((v0, k0) => {
            trans.set(k0, new Map());
            v0.forEach((v1, k1) => {
                trans?.get(k0)?.set(k1, new Set());
                v1.forEach(v => {
                    trans?.get(k0)?.get(k1)?.add(v);
                })
            })
        })

        let states = Array.from(this.states);

        let newMachine = new StateMachine(name, charset, states, init, accept, trans);

        newMachine.currentStates = new Set<string>(this.currentStates);
        newMachine.addEpsStates()
        newMachine.index = this.index;
        newMachine.mState = this.mState;
        newMachine.input = this.input;

        return newMachine;
    }

    hasEps(): boolean {
        return Array.from(this.transitions.values()).some(innerMap => Array.from(innerMap.keys()).includes("$"));
    }

    isComplete(): boolean {
        return Array.from(this.transitions.values()).every(innerMap => difference(this.charset, new Set(innerMap.keys())).size === 0//Array.from(innerMap.keys()).includes("$")
        );
    }

    determination(): StateMachine {
        if (this.hasEps()) throw Error("Machine has ε!")
        if (!this.isComplete()) throw Error("Machine is not complete!")
        let name = "det" + this.name;
        let init = this.init;
        let charset = Array.from(this.charset);

        let accept: string[] = [];
        let trans = new Map</* from */string, Map</* char */string, Set</* to */string>>>();
        let states: string[] = [];

        let newM = new StateMachine(name, charset, states, init, accept, trans);

        this.detHelp(newM, new Set<string>(init));

        return newM;
    }

    minimize(): StateMachine {
        if (this.hasEps()) throw Error("Machine has ε!")
        if (!this.isComplete()) throw Error("Machine is not complete!")
        if (!this.isDeterministic()) throw Error("Machine is not deterministic!")

        let m = this.clone();

        if (m.accept.size === 0) {
            m.states.clear();
            m.states.add(m.init)
            m.transitions.clear();
            m.transitions.set(m.init, new Map());
            m.charset.forEach(c => {
                m.transitions?.get(m.init)?.set(c, new Set([m.init]))
            })
            return m;
        }

        let parts: Set<string>[] = [];
        let lastSize = 0;
        parts.push(m.accept);
        parts.push(difference(m.states, m.accept));

        while (lastSize !== parts.length) {
            m.charset.forEach(c => {
                let seperatedList: Map<number, Set<string>>[] = [];
                parts.forEach(part => {
                    let seperated = new Map<number, Set<string>>;
                    part.forEach(state => {
                        m?.transitions?.get(state)?.get(c)?.forEach((targetState) => {
                            parts.forEach((part2, index) => {
                                if (part2.has(targetState)) {
                                    if (seperated.has(index)) seperated.get(index)?.add(state); else seperated.set(index, new Set([state]));
                                }
                            })
                        })
                    })
                    seperatedList.push(seperated);
                })
                lastSize = parts.length;
                parts = [];
                seperatedList.forEach((value) => {
                    value.forEach((set) => {
                        parts.push(set);
                    })
                })
            })
        }

        let stateToNewState = new Map<string, string>();
        let newStates = new Set<string>();
        let newAccept = new Set<string>();
        parts.forEach(states => {
            states.forEach(state => {
                stateToNewState.set(state, toArray(states).join(""));
            });
            newStates.add(toArray(states).join(""));

            if (intersect(m.accept, states).size > 0) {
                newAccept.add(toArray(states).join(""));
            }
        })
        m.states = newStates;
        m.init = stateToNewState.get(m.init) || m.init;
        m.accept = newAccept;
        m.name = "min" + m.name;
        let newTransitions = new Map<string, Map<string, Set<string>>>();
        m.transitions.forEach((value, from) => {
            value.forEach((value, c) => {
                value.forEach(to => {
                    this.addTransition(newTransitions, stateToNewState.get(from) || from, c, stateToNewState.get(to) || to, false);
                })
            })
        })
        m.transitions = newTransitions;
        return m;
    }


    /*
    it is deterministic!!
    it is complete!!
     */
    union(otherMachine: StateMachine, operation: string, epsilon: boolean = false): StateMachine {
        if(epsilon ||(!this.isComplete() || !otherMachine.isComplete() || !this.isDeterministic() || !otherMachine.isDeterministic()) && operation === "union") {
            let m1 = this.clone();
            let m2 = otherMachine.clone();

            this.makeUniqueStates(m1, m2);

            m1.charset = union(m1.charset, m2.charset);
            m1.states = union(m1.states, m2.states);
            m2.transitions.forEach((value, from) => {
                m1.transitions.set(from, value);
            })
            m1.accept = union(m1.accept, m2.accept);

            let newInit = m1.newStateName(m1.states);
            this.addTransition(m1.transitions, newInit, "$", m1.init, false);
            this.addTransition(m1.transitions, newInit, "$", m2.init, false);
            m1.init = newInit;

            return m1.available().clean()//.epsfree().clean();
        }

        if (this.hasEps()) throw Error("First machine has ε!")
        if (!this.isComplete()) throw Error("First machine is not complete!")
        if (!this.isDeterministic()) throw Error("First machine is not deterministic!")

        if (otherMachine.hasEps()) throw Error("Second machine has ε!")
        if (!otherMachine.isComplete()) throw Error("Second machine is not complete!")
        if (!otherMachine.isDeterministic()) throw Error("Second machine is not deterministic!")

        let m1 = this.clone();
        let m2 = otherMachine.clone();

        m2.charset = union(m1.charset, m2.charset);
        m2 = m2.complete(m1.newStateName(m2.states, "Z"))


        m1.charset = union(m1.charset, m2.charset);
        m1 = m1.complete(m1.newStateName(m1.states, "Z"))

        //m1.makeUniqueStates(m1, m2);

        let name = "U" + m1.name + m2.name;
        let init: string = m1.init + m2.init;
        let charset = Array.from(union(m1.charset, m2.charset));

        let accept: string[] = [];
        let trans: Map<string, Map<string, Set<string>>> = new Map();
        let states = [m1.init + m2.init];

        let newM = new StateMachine(name, charset, states, init, accept, trans);


        let addNewState = (s1: string, s2: string) => {
            if (operation === "union") {
                if (m1.accept.has(s1) || m2.accept.has(s2)) {
                    newM.accept.add(s1 + s2);
                }
            }

            if (operation === "intersect") {
                if (m1.accept.has(s1) && m2.accept.has(s2)) {
                    newM.accept.add(s1 + s2);
                }
            }

            if (operation === "difference") {
                if (m1.accept.has(s1) && !m2.accept.has(s2)) {
                    newM.accept.add(s1 + s2);
                }
            }
        };


        m1.states.forEach(s1 => {
            m2.states.forEach(s2 => {
                let newState = s1 + s2;

                newM.states.add(newState);

                newM.charset.forEach(c => {
                    if (trans.get(newState) === undefined) {
                        trans.set(newState, new Map());
                    }

                    if (trans.get(newState)?.get(c) === undefined) {
                        trans.get(newState)?.set(c, new Set());
                    }

                    let toM1 = m1.transitions.get(s1)?.get(c);
                    let toM2 = m2.transitions.get(s2)?.get(c);

                    if (toM1 != undefined && toM2 != undefined) {
                        trans.get(newState)?.get(c)?.add(Array.from(toM1)[0] + Array.from(toM2)[0]);
                    }
                    if (toM1 == undefined && toM2 == undefined) {
                        trans.get(newState)?.get(c)?.add("RR");
                        newM.states.add("RR");
                    }

                    if (toM1 == undefined && toM2 != undefined) {
                        trans.get(newState)?.get(c)?.add("R" + Array.from(toM2)[0]);
                        newM.states.add("R" + Array.from(toM2)[0]);
                        addNewState("R", Array.from(toM2)[0]);
                    }


                    if (toM1 != undefined && toM2 == undefined) {
                        trans.get(newState)?.get(c)?.add(Array.from(toM1)[0] + "R");
                        newM.states.add(Array.from(toM1)[0] + "R");
                        addNewState(Array.from(toM1)[0], "R");
                    }

                });

                addNewState(s1, s2);

            })
        })

        return newM.available();
    }

    naiveMinimize() {
        let m = this.clone();

        let U = new AllUnorderedPairs(m.states);

        U.forEach((p, q) => {
            if (m.accept.has(p) && !m.accept.has(q)) U.set(p, q, 1);
        })


        let done = false;
        while (!done) {
            done = true;
            let T = U.clone();

            T.forEachAtValue(0, (p, q) => {
                m.charset.forEach(a => {
                    if (T.get(m.delta(p, a), m.delta(q, a)) === 1) {
                        U.set(p, q, 1);
                        done = false;
                    }
                })
            })
        }


        let classes = this.sameClassesSimply(U);

        m.name = "fmin" + this.name;

        classes.forEach(states => {
            this.joinStates(m, states);
        })

        return m;
    }

    fastMinimize() {
        let m = this.clone();

        let U = new AllUnorderedPairs(m.states);
        let list = new ListForPairs();

        U.forEach((p, q) => {
            if (m.accept.has(p) && !m.accept.has(q)) U.set(p, q, 1);
        })

        new AllUnorderedPairs(m.states).forEach((p, q) => {
            if ((this.accept.has(p) && this.accept.has(q)) || (!this.accept.has(p) && !this.accept.has(q))) {
                let hasSomeSymbol: boolean = false;

                this.charset.forEach(a => {
                    if (hasSomeSymbol) return;

                    if (U.get(m.delta(p, a), m.delta(q, a)) === 1) {
                        U.set(p, q, 1);
                        hasSomeSymbol = true;
                        this.setListRecursivelySimply(U, list, p, q);
                    }
                })

                if (hasSomeSymbol) {
                    this.charset.forEach(a => {
                        if (m.delta(p, a) !== m.delta(q, a)) {
                            list.put(m.delta(p, a), m.delta(q, a), p, q);
                        }
                    })
                }
            }
        });

        let classes = this.sameClassesSimply(U);

        m.name = "fmin" + this.name;

        classes.forEach(states => {
            this.joinStates(m, states);
        })

        return m;
    }

    reverse(): StateMachine {
        if (this.hasEps()) throw Error("Machine has ε!")
        if (!this.isComplete()) throw Error("Machine is not complete!")
        if (!this.isDeterministic()) throw Error("Machine is not deterministic!")

        let m = this.clone();

        m.transitions = new Map<string, Map<string, Set<string>>>();

        m.states = new Set<string>();
        this.states.forEach(s => {
            if (!this.accept.has(s)) {
                m.states.add(s);
            }
        })

        m.states.add(toArray(this.accept).sort().join(""));

        this.transitions.forEach((value, stateFrom) => {
            value.forEach((states, char) => {
                states.forEach(stateTo => {
                    if (this.accept.has(stateFrom)) {
                        stateFrom = toArray(this.accept).sort().join("");
                    }

                    if (this.accept.has(stateTo)) {
                        stateTo = toArray(this.accept).sort().join("");
                    }

                    if (m.transitions.get(stateTo) == undefined) {
                        m.transitions.set(stateTo, new Map<string, Set<string>>());
                    }
                    if (m.transitions.get(stateTo)?.get(char) == undefined) {
                        m.transitions.get(stateTo)?.set(char, new Set<string>());
                    }
                    m.transitions.get(stateTo)?.get(char)?.add(stateFrom);
                })
            })
        })

        m.init = toArray(this.accept).sort().join("");
        m.accept = new Set<string>([this.init]);


        return m;
    }

    minimize3(): StateMachine {
        return this.reverse().clean().determination().clean().reverse().clean().determination();
    }

    sameClassesSimply(U: AllUnorderedPairs): Set<Set<string>> {
        let result = new Set<Set<string>>();

        U.forEach((p, q, value) => {
            if (value === 1) {
                U.delete(p, q);
            }
        });

        U.forEach((p, q, value) => {
            U.delete(p, q);

            let sameState = new Set<string>([p, q]);

            let changeOccured = true;
            while (changeOccured) {
                changeOccured = false;

                U.forEach((p2, q2, value2) => {
                    if (intersect(sameState, new Set<string>([p2, q2])).size > 0) {
                        sameState.add(p2);
                        sameState.add(q2);
                        U.delete(p2, q2);
                        changeOccured = true;
                    }
                })
            }

            result.add(sameState);
        });

        return result;
    }

    setListRecursivelySimply(U: AllUnorderedPairs, list: ListForPairs, p: string, q: string): void {
        U.set(p, q, 1);

        if (list.has(p, q)) {
            list.forEachOnPair(p, q, (p2, q2) => {
                U.set(p2, q2, 1);
                this.setListRecursivelySimply(U, list, p2, q2);
            });
        }
    }

    /*
    MINIMIZE(M)
        0. For all unordered pairs {p,q}, p != q, set U({p,q}) := 0
        1. For all unordered pairs {p,q} with p ∈ F and q ∈ Q − F,
           set U({p,q}) : = 1
        2. For each unordered pair {p,q} with either p,q ∈ F or p,q !∈ F do
            3. If U({δ(p,a),δ(q,a)}) = 1 for some symbol a ∈ ∑ then
                4. U({p,q}) := 1
                5. Recursively set U({p,q}) := 1 for all unmarked pairs {p,q} on the list for {p,q},
                   and all pairs on those lists, etc.
            6. Else
                7. For all a ∈ ∑ do
                    8. If δ(p,a) != δ(q,a), put {p,q} on the list for {δ(p,a),δ(q,a)}
        9. return(U)
     */
    minimize2(): StateMachine {
        let U: Map<string, number> = new Map<string, number>();
        let listFor = new Map<string, Set<string>>();
        this.states.forEach(p => {
            this.states.forEach(q => {
                if (p !== q) {
                    U.set(`${p}-${q}`, 0);
                }
            })
        });

        this.states.forEach(p => {
            if (this.accept.has(p)) {
                this.states.forEach(q => {
                    if (!this.accept.has(q)) {
                        U.set(`${p}-${q}`, 1);
                        U.set(`${q}-${p}`, 1);
                    }
                })
            }
        });


        this.states.forEach(p => {
            this.states.forEach(q => {
                if ((this.accept.has(p) && this.accept.has(q)) || (!this.accept.has(p) && !this.accept.has(q))) {
                    let hasSomeSymbol: boolean = false;

                    this.charset.forEach(a => {
                        if (hasSomeSymbol) return;

                        let dpa: string = this.transitions.get(p)?.get(a)?.values().next().value;
                        let dqa: string = this.transitions.get(q)?.get(a)?.values().next().value;

                        if (U.get(`${dpa}-${dqa}`) === 1) {
                            U.set(`${p}-${q}`, 1);
                            U.set(`${q}-${p}`, 1);

                            hasSomeSymbol = true;

                            this.setListRecursively(U, listFor, `${p}-${q}`);
                        }
                    })

                    if (hasSomeSymbol) {
                        this.charset.forEach(a => {
                            let dpa: string = this.transitions.get(p)?.get(a)?.values().next().value;
                            let dqa: string = this.transitions.get(q)?.get(a)?.values().next().value;

                            if (dpa !== undefined && dqa !== undefined) {
                                if (dpa !== dqa) {
                                    if (!listFor.has(`${dpa}-${dqa}`)) {
                                        listFor.set(`${dpa}-${dqa}`, new Set());
                                    }

                                    listFor.get(`${dpa}-${dqa}`)?.add(`${p}-${q}`);
                                }
                            }
                        })
                    }
                }
            })
        })

        let classes = this.sameClasses(U);

        let m2 = this.clone();
        m2.name = "fmin" + this.name;

        classes.forEach(states => {
            this.joinStates(m2, states);
        })

        return m2;
    }

    sameClasses(U: Map<string, number>): Set<Set<string>> {
        let result = new Set<Set<string>>();

        U.forEach((value, key, map) => {
            if (value === 1) {
                map.delete(key)
            }
        });

        U.forEach((_, key, map) => {
            map.delete(key);
            let pq = key.split("-");

            let sameState = new Set<string>([pq[0], pq[1]]);

            let changeOccured = true;
            while (changeOccured) {
                changeOccured = false;

                map.forEach((_, key2) => {
                    let pq2 = key2.split("-");
                    if (intersect(sameState, new Set<string>([pq2[0], pq2[1]])).size > 0) {
                        sameState.add(pq2[0]);
                        sameState.add(pq2[1]);
                        map.delete(key2);
                        changeOccured = true;
                    }
                })
            }

            result.add(sameState);
        });

        return result;
    }

    joinStates(m: StateMachine, states: Set<string>): void {
        let newState = Array.from(states).join("");

        m.states = difference(m.states, states);
        m.states.add(newState);

        if (intersect(states, m.accept).size > 0) {
            m.accept = difference(m.accept, states);
            m.accept.add(newState);
        }

        if (states.has(m.init)) {
            m.init = newState;
        }

        m.transitions.forEach((transitions, from, map) => {
            transitions.forEach((tos, c, map) => {
                if (intersect(tos, states).size > 0) {
                    let newTos = difference(tos, states);
                    newTos.add(newState);
                    map.set(c, newTos);
                }
            });
            if (states.has(from)) {
                map.delete(from);
                map.set(newState, transitions);
            }
        });
    }

    setListRecursively(U: Map<string, number>, listFor: Map<string, Set<string>>, pq: string): void {
        if (listFor.has(pq)) {
            listFor.get(pq)?.forEach(pair => {
                U.set(pair, 1);
                let k = pair.split("-");
                U.set(`${k[0]}-${k[1]}`, 1)
                this.setListRecursively(U, listFor, pair);
            });
        }
    }

    complement() {
        let newM = this.clone();
        newM.name = "comp" + this.name;
        newM.accept = difference(newM.states, newM.accept);
        return newM;
    }

    addTransition(transitions: Map<string, Map<string, Set<string>>>, from: string, c: string, to: string, addWhenEmpty = true) {
        if (transitions.get(from) == undefined) {
            transitions.set(from, new Map());
        }

        if (transitions.get(from)?.get(c) == undefined) {
            transitions.get(from)?.set(c, new Set());
        }

        if (transitions.get(from)?.get(c)?.size === 0 || !addWhenEmpty) {
            transitions.get(from)?.get(c)?.add(to);
        }
    }

    complete(newState: string = this.newStateName(this.states)): StateMachine {
        let newM = this.clone();

        if (newState == undefined) throw new Error("Complete: define reject state!");

        if (this.states.has(newState)) throw new Error("Complete: reject state already exists!");

        newM.states.add(newState);

        newM.states.forEach((state) => {
            newM.charset.forEach(c => {
                this.addTransition(newM.transitions, state, c, newState);
            });
        });

        return newM;
    }

    availableTransitions(newTransitions: Map<string, Map<string, Set<string>>>, states: Set<string>, history: Set<string>) {
        if (states.size === 0) return;
        let newStates = new Set<string>();

        states.forEach(state => {
            if (history.has(state)) return;
            history.add(state);
            this.transitions.get(state)?.forEach((v, k) => {
                newStates = union(v, newStates);
                v.forEach((value) => {
                    if (newTransitions.get(state) == undefined) newTransitions.set(state, new Map())
                    if (newTransitions.get(state)?.get(k) == undefined) newTransitions.get(state)?.set(k, new Set());
                    newTransitions.get(state)?.get(k)?.add(value);
                })
            })
        });

        this.availableTransitions(newTransitions, newStates, history);
    }

    available(): StateMachine {
        let newMachine = this.clone();
        let newTransitions = new Map();
        let history = new Set<string>();
        this.availableTransitions(newTransitions, new Set([this.init]), history);
        newMachine.transitions = newTransitions;
        newMachine.states = history;
        newMachine.accept = intersect(newMachine.accept, newMachine.states);
        return newMachine;
    }

    epsfree(): StateMachine {
        let newMachine = this.clone();
        newMachine.name = "ef" + newMachine.name;

        let availableStates = newMachine.states;

        while (availableStates.size > 0) {
            let sharedEpsStates: Set<string> = new Set(availableStates.keys().next().value);
            this.addEpsStates(sharedEpsStates);


            sharedEpsStates.forEach(epsState => {
                let targetEpsStates = newMachine.transitions.get(epsState)?.get("$");

                targetEpsStates?.forEach(epsStateForCopy => {
                    sharedEpsStates.forEach(epsStateForPaste => {
                        this.copyTransitions(newMachine, epsStateForCopy, epsStateForPaste);
                    });
                });

                newMachine.transitions.get(epsState)?.get("$")?.clear();
            });

            if (intersect(sharedEpsStates, newMachine.accept).size > 0) newMachine.accept = union(newMachine.accept, sharedEpsStates);

            availableStates = difference(availableStates, sharedEpsStates);
        }

        //Remove empty eps transitions
        newMachine.transitions.forEach((transitions, from, map) => {
            transitions.forEach((targets, char, map) => {
                if (targets.size === 0) {
                    map.delete(char);
                }
            });

            if (transitions.size === 0) {
                map.delete(from);
            }
        });

        return newMachine;
    }

    copyTransitions(m: StateMachine, from: string, to: string) {
        let transitions = m.transitions.get(from);

        transitions?.forEach((targets, char) => {
            targets.forEach(target => {
                this.addTransition(m.transitions, to, char, target, false);
            })
        });
    }

    getNumberOfTape(): number {
        return 1;
    }

    getInit(): string {
        let initStates = new Set<string>();
        initStates.add(this.init);
        this.addEpsStates(initStates);
        return toArray(initStates).sort().join('');
    }

    newStateName(states: Set<string>, start: string = ""): string {
        if (start !== "" && !states.has(start)) return start;

        if (start !== "") {
            start = start + "_";
        }

        let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let name = "A";
        let j = 0;
        while (states.has(start + name)) {
            if (j === chars.length) {
                name += "A";
                j = 0;
            } else {
                name = name.substring(0, name.length - 1) + chars[j];
                j++;
            }
        }
        return start + name;
    }

    makeUniqueStates(m1: StateMachine, m2: StateMachine): void {
        let unionStates = union(m1.states, m2.states);
        m1.states.forEach(state => {
            if (m2.states.has(state)) {
                let newState = m1.newStateName(unionStates);

                m2.renameState(state, newState, m2);

                unionStates.add(newState);
            }
        })
    }

    concat(m2: StateMachine): StateMachine {
        let m1 = this.clone();
        m2 = m2.clone();

        if(true) {
            m2.makeUniqueStates(m1, m2);
            m1.states = union(m1.states, m2.states);
            m1.name = m1.name + 'And' + m2.name;
            m1.charset = union(m1.charset, m2.charset);
            m2.transitions.forEach((value, from) => {
                m1.transitions.set(from, value);
            })
            m1.accept.forEach(a => {
                m1.addTransition(m1.transitions, a, "$", m2.init, false);
            });
            m1.accept.clear();
            m2.accept.forEach(a => {
                m1.accept.add(a);
            })

            return m1.epsfree().available().clean()
        }


        m2.renameState(m2.init, m1.newStateName(union(m1.states, m2.states), "DELETE"), m2);
        this.makeUniqueStates(m1, m2);
        //m2.states.add(m1.init)


        m1.states = union(m1.states, m2.states);
        m1.name = m1.name + 'And' + m2.name;
        m1.charset = union(m1.charset, m2.charset);

        if (m1.isDeterministic() && m2.isDeterministic()) {
            m2.transitions.forEach((value, from) => {
                if (from === m2.init) {
                    m1.accept.forEach(m1AcceptState => {
                        m1.transitions.set(m1AcceptState, value);
                    })
                } else {
                    m1.transitions.set(from, value);
                }
            });


            m1.accept = m2.accept;
            m1.states.delete(m2.init);
            return m1;
        }


        m2.transitions.forEach((value, from) => {
            m1.transitions.set(from, value);
        });
        m1.accept.forEach(m1AcceptState => {
            this.addTransition(m1.transitions, m1AcceptState, '$', m2.init, false);
        })
        m1.accept = m2.accept;
        return m1;
    }

    close(): StateMachine {
        let m1 = this.clone();

        //If there is transition with: from somewhere and to target the init state, then create new init state
        let needInit = false;
        this.transitions.forEach((value, from) => {
            value.forEach((targets, char) => {
                if(targets.has(m1.init)) {
                    needInit = true;
                }
            })
        });
        if(needInit) {
            let newState = m1.newStateName(m1.states);
            m1.states.add(newState);
            m1.addTransition(m1.transitions, newState, '$', m1.init, false);
            m1.init = newState;
        }

        m1.accept.forEach(m1AcceptState => {
            this.addTransition(m1.transitions, m1AcceptState, '$', m1.init, false);
        })
        m1.accept.add(m1.init);

        return m1;
    }

    clean(): StateMachine {
        let m = this.clone();
        let stateToNewState = new Map<string, string>();

        toArray(m.states).forEach((state, index) => {
            stateToNewState.set(state, String.fromCharCode('A'.charCodeAt(0) + index))
        })
        m.states = new Set(toArray(m.states).map(s => stateToNewState.get(s) || s));
        m.init = stateToNewState.get(m.init) || m.init;
        m.accept = new Set(toArray(m.accept).map(s => stateToNewState.get(s) || s));
        m.name = "clean" + m.name;
        let newTransitions = new Map<string, Map<string, Set<string>>>();
        m.transitions.forEach((value, from) => {
            value.forEach((value, c) => {
                value.forEach(to => {
                    this.addTransition(newTransitions, stateToNewState.get(from) || from, c, stateToNewState.get(to) || to, false);
                })
            })
        })
        m.transitions = newTransitions;
        return m;
    }

    getIndexes(): number[] {
        return [this.index];
    }

    getTapes(): string[] {
        return [this.input];
    }

    getSimulationState(): MachineState {
        let char = this.lastChar;

        return {
            label: char.replace("$", "ε") + Array.from(this.getCurrentStates()).join(''),
            tapes: this.getTapes(),
            indexes: this.getIndexes(),
            currentStates: Array.from(this.getCurrentStates()),
            state: this.getMachineState()
        };
    }

    setSimulationState(state: MachineState): void {
        this.input = state.tapes[0];
        this.index = state.indexes[0];
        this.currentStates = new Set(state.currentStates);
        this.mState = state.state;
    }

    private detHelp(newM: StateMachine, states: Set<string>) {
        if (newM.states.has(Array.from(states).sort().join(""))) {
            return;
        }

        let statesString: string = Array.from(states).sort().join("");
        if (intersect(this.accept, states).size > 0) newM.accept.add(Array.from(states).sort().join(""))
        newM.states.add(Array.from(states).sort().join(""))

        this.charset.forEach(c => {
            let newStates: Set<string> = new Set();
            let acceptState = false;

            states.forEach(state => {

                if (this.transitions.get(state) != undefined && this.transitions.get(state)?.get(c) != undefined) {
                    let h = this.transitions?.get(state)?.get(c);
                    if (h !== undefined) {
                        this.transitions?.get(state)?.get(c)?.forEach(s => {
                            newStates.add(s);

                            if (this.accept.has(s)) {
                                acceptState = true;
                            }
                        });
                    }
                }
            });

            let newStatesString: string = Array.from(newStates).sort().join("");

            if (newStates.size > 0) {
                if (newM.transitions.get(statesString) == undefined) newM.transitions.set(statesString, new Map())

                if (newM.transitions.get(statesString)?.get(c) == undefined) newM.transitions.get(statesString)?.set(c, new Set([newStatesString]));

                newM.transitions.get(statesString)?.get(c)?.add(newStatesString);
                if (acceptState) {
                    newM.accept.add(newStatesString)
                }

                this.detHelp(newM, newStates);
            }

        });
    }

    private renameState(oldStateName: string, newStateName: string, stateMachine: StateMachine) {
        stateMachine.states.delete(oldStateName);
        stateMachine.states.add(newStateName);

        if (stateMachine.init === oldStateName) {
            stateMachine.init = newStateName;
        }

        if (stateMachine.accept.has(oldStateName)) {
            stateMachine.accept.delete(oldStateName);
            stateMachine.accept.add(newStateName);
        }

        stateMachine.transitions.forEach((value, from, trans) => {
            if (from === oldStateName) {
                trans.delete(from);
                trans.set(newStateName, value);
            }

            value.forEach((targets, char) => {
                if (targets.has(oldStateName)) {
                    targets.delete(oldStateName);
                    targets.add(newStateName);
                }
            })
        });
    }

    private isDeterministic() {
        let isDeterministic = true;
        this.transitions.forEach((value, from) => {
            value.forEach((value, c) => {
                if (value.size > 1 || c === '$') {
                    isDeterministic = false;
                }
            })
        })
        return isDeterministic;
    }

    hasTransition(from: string, to: string): boolean {
        let char = this.input.charAt(this.index);

        if(!this.currentStates.has(from))
            return false;

        let result = false;
        this.transitions.get(from)?.forEach((value, c) => {
            if (value.has(to) && (c === char || c === '$') ) {
                result = true;
            }
        })
        return result;
    }
}
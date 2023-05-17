import {difference, hasIntersect, intersect, toArray, union} from "../common";
import {Grammar} from "./Grammar";
import {IMachine} from "../IMachine"

export interface ITransition {
    from: string;
    to: string;
    text: string
}

export class StateMachine implements IMachine {
    name: string;
    charset: Set<string>;
    states: Set<string>;
    init: string
    accept: Set<string>;
    transitions: Map</* from */string, Map</* char */string, Set</* to */string>>>;

    public history: { data: Array<{ machine: IMachine, tag: string }>, index: number } = {data: [], index: 0};

    //Simulation
    private currentStates: Set<string>;
    private input: string;
    private index: number;
    private mState: "rejected" | "accepted" | "working";

    constructor(name: string, charset: Array<string>, states: Array<string>, init: string, accept: Array<string>, transitions: Map<string, Map<string, Set<string>>>) {
        this.name = name;
        this.charset = new Set(charset);
        this.states = new Set(states);
        this.init = init;
        this.accept = new Set(accept);
        this.transitions = transitions;
        this.history = {data: [], index: 0};

        this.currentStates = new Set([this.init]);
        this.addEpsStates();
        this.input = "";
        this.index = 0;
        this.mState = "working";

        /* history */
        {
            let char = this.input.charAt(this.index);
            let m = this;//.clone();
            this.history.data.push({machine: m, tag: toArray(this.currentStates).join("") + char});
            this.history.index = 0;
        }
    }

    getAsGrammar(state=this.init): Grammar | null {
        let rules: Map<string, string[]> = new Map();

        this.transitions.forEach((values, key) => {
            values.forEach((sets, key2) => {
                let rights:string[] = [];
                sets.forEach(s => {
                    rights.push(key2+s)
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
        /* history */ {
            let char = this.input.charAt(this.index);
            let m = this.clone();
            this.history.data = [];
            this.history.data.push({machine: m, tag: toArray(this.currentStates).join("") + char});
            this.history.index = 0;
        }
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

    nextState(index: string = "") {
        this.history.data = this.history.data.slice(0, this.history.index + 1)
        if (this.mState === "rejected" || this.mState === "accepted") return;

        let newStates: Set<string> = new Set();
        let char = this.input.charAt(this.index);

        //$ states to currentStates
        this.addEpsStates();




        this.currentStates.forEach((state) => {
            let states = this?.transitions?.get(state)?.get(char);

            if (states !== undefined && index !== "" && states.has(index[index.length - 1])) {
                states = new Set<string>();
                states.add(index[index.length - 1]);
            }

            if (states !== undefined) newStates = union(newStates, states);
        })


        if (newStates.size === 0) {
            this.mState = "rejected";
        } else {
            this.currentStates = newStates;
            this.addEpsStates();

            if (this.index === this.input.length - 1) {
                this.mState = hasIntersect(newStates, this.accept) ? "accepted" : "rejected";
            }// else {
                let m = this.clone();
                m.index++;
                char = this.input.charAt(m.index)
                this.history.data.push({machine: m, tag: toArray(this.currentStates).join("") + char});
                this.history.index++;
           // }

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

    getTransitions(): Map<string, Map<string, Set<string>>> {
        let out: Map<string, Map<string, Set<string>>> = new Map();

        this?.transitions.forEach((v0, from) => {
            v0.forEach((vl, c) => {
                vl.forEach((to) => {
                    if (!out.has(from)) {
                        out.set(from, new Map());
                    }

                    if (!out?.get(from)?.has(to)) {
                        out?.get(from)?.set(to, new Set());
                    }

                    out?.get(from)?.get(to)?.add(c.replace('$', 'ε'));
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
        newMachine.history = this.history;
        newMachine.mState = this.mState;
        newMachine.input = this.input;

        return newMachine;
    }

    determination(): StateMachine {
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

    minimize(): StateMachine {
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

    union(otherMachine: StateMachine, operation: string) {
        let name = "U" + this.name + otherMachine.name;
        let init: string = this.init + otherMachine.init;
        let charset = Array.from(union(this.charset, otherMachine.charset));

        let accept: string[] = [];
        let trans: Map<string, Map<string, Set<string>>> = new Map();
        let states = [this.init + otherMachine.init];

        let newM = new StateMachine(name, charset, states, init, accept, trans);

        let addNewState = (s1: string, s2: string)  => {
            if (operation === "union") {
                if (this.accept.has(s1) || otherMachine.accept.has(s2)) {
                    newM.accept.add(s1 + s2);
                }
            }

            if (operation === "intersect") {
                if (this.accept.has(s1) && otherMachine.accept.has(s2)) {
                    newM.accept.add(s1+s2);
                }
            }

            if (operation === "difference") {
                if (this.accept.has(s1) && !otherMachine.accept.has(s2)) {
                    newM.accept.add(s1+s2);
                }
            }
        };


        this.states.forEach(s1 => {
            otherMachine.states.forEach(s2 => {
                let newState = s1 + s2;

                newM.states.add(newState);

                newM.charset.forEach(c => {
                    if (trans.get(newState) == undefined) {
                        trans.set(newState, new Map());
                    }

                    if (trans.get(newState)?.get(c) == undefined) {
                        trans.get(newState)?.set(c, new Set());
                    }

                    let toM1 = this.transitions.get(s1)?.get(c);
                    let toM2 = otherMachine.transitions.get(s2)?.get(c);

                    if (toM1 != undefined && toM2 != undefined) {
                        trans.get(newState)?.get(c)?.add(Array.from(toM1)[0] + Array.from(toM2)[0]);
                    }
                    if(toM1 == undefined && toM2 == undefined) {
                        trans.get(newState)?.get(c)?.add("RR");
                        newM.states.add("RR");
                    }

                    if(toM1 == undefined && toM2 != undefined) {
                        trans.get(newState)?.get(c)?.add("R" + Array.from(toM2)[0]);
                        newM.states.add("R" + Array.from(toM2)[0]);
                        addNewState("R", Array.from(toM2)[0]);
                    }


                    if(toM1 != undefined && toM2 == undefined) {
                        trans.get(newState)?.get(c)?.add(Array.from(toM1)[0] + "R");
                        newM.states.add(Array.from(toM1)[0] + "R");
                        addNewState(Array.from(toM1)[0], "R");
                    }

                });

                addNewState(s1, s2);

            })
        })

        return newM;
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

    complete(newState: string): StateMachine {
        let newM = this.clone();

        if (newState == undefined) throw "Nincs definiálva elutasító állapot!";

        if (this.states.has(newState)) throw "Már létező elutasító állapot!";

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

    concat(m2: StateMachine): StateMachine {
        let m1 = this.clone();
        m2 = m2.clone();
        m1.states = union(m1.states, m2.states);
        m1.name = m1.name + 'And' + m2.name;
        m1.charset = union(m1.charset, m2.charset);
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

        m1.accept.forEach(m1AcceptState => {
            this.addTransition(m1.transitions, m1AcceptState, '$', m1.init, false);
        })

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
}
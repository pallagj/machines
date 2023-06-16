import {hasIntersect, toArray, union} from "../common";
import {IMachine} from "../IMachine";
import {ITransition} from "./StateMachine";
import {Grammar} from "./Grammar";

export interface ISimpleTask {
    read: string,
    write: string,
    nextState: string
}

export class PushdownMachine implements IMachine {

    //Simulation
    private currentState: string;
    private input: string;
    private index: number;
    private lifo: string;
    private mState: "rejected" | "accepted" | "working" | "stopped";

    public history: {data: Array<{ machine: IMachine, tag: string }>, index: number} = {data: [], index: 0};

    constructor(public name: string, public charset: Set<string>, public states: Set<string>, public init: string, public accept: Set<string>, public transitions: Map</* from */string, Map</* char */string, Set<ISimpleTask>>>,) {
        //Simulation
        this.currentState = this.init;
        this.input = "";
        this.lifo = "";
        this.index = 0;
        this.mState = "working";
        this.accept = accept;
    }

    reset() {
        this.currentState = this.init;
        this.index = 0;
        this.mState = "working";
        this.lifo = "";
    }

    nextState(index:string="") {
        this.history.data = this.history.data.slice(0, this.history.index + 1);
        if (this.mState === "rejected" || this.mState === "accepted") return;

        let char = "_";

        if (this.index < this.input.length) {
            char = this.input[this.index];
        }

        let tasks = this.transitions?.get(this.currentState)?.get(char);

        let task: ISimpleTask = {write: "", read: "", nextState: ""};
        tasks?.forEach((newTask) => {
            if (newTask.read === "$" || newTask.read === this.input[this.input.length - 1]) {
                task = newTask;
            }
        })


        this.history.data.push({machine: this, tag: char + task.nextState + task.read  + task.write });
        this.history.index++;

        if (task.nextState === "") {
            this.mState = this.accept.has(this.currentState) ? "accepted" : "rejected";
        } else {
            this.currentState = task.nextState;

            if (task.read !== "$") {
                this.lifo = this.lifo.substring(0, this.lifo.length - 1);
            }
            this.lifo += task.write;
            this.index++;
        }
    }

    getCurrentStates(): Set<string> {
        return new Set<string>([this.currentState]);
    }

    getMachineState(): "rejected" | "accepted" | "working" | "stopped" {
        return this.mState;
    }

    getTapeIndex(index: number): number {
        if (index === 0) {
            return this.index;
        } else {
            return this.lifo.length - 1;
        }
    }

    getTapeValue(index: number): string {
        if (index === 0) {
            return this.input;
        } else {
            return this.lifo;
        }
    }

    getTransitions(): Map<string, Map<string, Set<string>>> {
        let out: Map<string, Map<string, Set<string>>> = new Map();

        this?.transitions.forEach((v0, from) => {
            v0.forEach((vl, c) => {
                vl.forEach((task) => {
                    if (!out.has(from)) {
                        out.set(from, new Map());
                    }

                    if (!out?.get(from)?.has(task.nextState)) {
                        out?.get(from)?.set(task.nextState, new Set());
                    }

                    out?.get(from)?.get(task.nextState)?.add(
                        `${c.replace('$', 'ε')}, ${task.read.replace('$', 'ε')}/${task.write.replace('$', 'ε')}`);
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
                let tasks = this.transitions?.get(state)?.get(c);

                tasks?.forEach((task) => {
                    item += ((item === "" ? "" : ", ") + `${task.read}/${task.write} ${task.nextState}`);
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
        this.transitions.forEach((value, key) => {
            value.forEach((value2, kxey2) => {
                if (value.size > 1) {
                    return false;
                }
            })
        })
        return true;
    }

    getNumberOfTape(): number {
        return 2;
    }

    getHistory(): Array<{machine: IMachine, tag: string}> {
        return [];
    }

    getInit(): string {
        return this.init;
    }
    //transitions: Map</* from */string, Map</* char */string, Set<ISimpleTask>>>
    addTransition(from:string, char:string, task:ISimpleTask) {
        if(!this.transitions.has(from)){
            this.transitions.set(from, new Map())
        }

        if(!this.transitions.get(from)?.has(char)) {
            this.transitions.get(from)?.set(char, new Set());
        }

        this.transitions?.get(from)?.get(char)?.add(task);
    }

    getAsGrammar(): Grammar | null {
        return null;
    }

}
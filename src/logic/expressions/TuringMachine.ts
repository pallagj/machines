import {hasIntersect, union} from "../common";
import {IMachine, MachineState} from "../IMachine";
import {ITransition} from "./StateMachine";
import {Grammar} from "./Grammar";

export interface ITask {
    write: string,
    move: "<" | ">" | "=",
    nextState: string
}

export class TuringMachine implements IMachine {
    //Simulation
    private currentState: string;
    private originalInput: string;
    private tape: string[];
    private index: number;
    private mState: "rejected" | "accepted" | "working" | "stopped";

    constructor(public name: string, public charset: Set<string>, public states: Set<string>, public init: string, public accept: Set<string>, public transitions: Map</* from */string, Map</* char */string, Set<ITask>>>) {
        //Simulation
        this.currentState = this.init;
        this.tape = [""];
        this.originalInput = "";
        this.index = 0;
        this.mState = "working";
        this.accept = accept;
    }

    reset() {
        this.currentState = this.init;
        this.tape = this.originalInput.split("");
        this.index = 0;
        this.mState = "working";
        this.tape = [];
        this.originalInput = "";
    }

    nextState(targetIndex: string = "") {
        if (this.mState === "rejected" || this.mState === "accepted") return;

        let char = "_";

        if (this.index < this.tape.length) {
            char = this.tape[this.index];
        }

        let tasks = this.transitions?.get(this.currentState)?.get(char);

        let task: ITask = {write: "", move: "=", nextState: ""};
        tasks?.forEach((newTask) => {
            let moveString = newTask.move === "<" ? "L" : (newTask.move === '>' ? "R" : "");
            let index = `${this.currentState}${char} → ${newTask.write}, ${moveString}${newTask.nextState}`

            if (targetIndex === "" || targetIndex === index) {
                task = newTask;
            }
        })

        if (task.nextState === "") {
            this.mState = this.accept.has(this.currentState) ? "accepted" : "rejected";
        } else {
            this.currentState = task.nextState;
            //this.history.data.push({machine: this, tag: char + task.nextState + task.write + task.move});
            //this.history.index++;

            this.tape[this.index] = task.write;

            switch (task.move) {
                case ">":
                    this.index++;
                    break;
                case "<":
                    this.index--;
                    break;
                case "=":
                    break;
            }
        }
    }

    getCurrentStates(): Set<string> {
        return new Set<string>([this.currentState]);
    }

    getMachineState(): "rejected" | "accepted" | "working" | "stopped" {
        return this.mState;
    }

    getTapeIndex(index: number): number {
        return this.index;
    }

    getTapeValue(index: number): string {
        return (this.tape.join("") + (this.index >= this.tape.length - 1 ? "_" : "")).replaceAll("_", "␣");
    }

    getTransitions(){
        let out: Map<string, Map<string, Set<{ label: string, selected: boolean }>>> = new Map();

        this?.transitions.forEach((v0, from) => {
            v0.forEach((vl, c) => {
                vl.forEach((task) => {
                    if (!out.has(from)) {
                        out.set(from, new Map());
                    }

                    if (!out?.get(from)?.has(task.nextState)) {
                        out?.get(from)?.set(task.nextState, new Set());
                    }

                    let moveString = task.move === "<" ? "L" : (task.move === '>' ? "R" : "");

                    if (c === task.write) {
                        out?.get(from)?.get(task.nextState)?.add({label: `${c === "_" ? '␣' : c}, ${moveString}`, selected: c === this.tape[this.index]});
                    } else {
                        out?.get(from)?.get(task.nextState)?.add({label:`${c === "_" ? '␣' : c} → ${task.write === "_" ? '␣' : task.write}, ${moveString}`, selected: c === this.tape[this.index]});
                    }
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
                    item += ((item === "" ? "" : ", ") + `${task.write}${task.move}${task.nextState}`);
                })

                outCharset.push(item);
            })

            out.push({state: state, items: outCharset});
        });

        return out;
    }

    setTapeValue(index: number, input: string): void {
        this.originalInput = input;
        this.tape = input.split("");
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
        return 1;
    }

    getHistory(): Array<{ machine: IMachine, tag: string }> {
        return [];
    }

    getInit(): string {
        return this.init;
    }

    getAsGrammar(): Grammar | null {
        return null;
    }

    getIndexes(): number[] {
        return [this.index];
    }

    getTapes(): string[] {
        return [(this.tape.join("") + (this.index >= this.tape.length - 1 ? "_" : "")).replaceAll("_", "␣")];
    }

    getSimulationState(): MachineState {

        let char = this.index === 0 ? '' : this.tape[this.index - 1];

        return {
            label: char + Array.from(this.getCurrentStates()).join(''),
            tapes: this.getTapes(),
            indexes: this.getIndexes(),
            currentStates: Array.from(this.getCurrentStates()),
            state: this.getMachineState()
        }
    }

    setSimulationState(state: MachineState): void {
        this.currentState = state.currentStates[0];
        this.tape = state.tapes[0].split("");
        this.originalInput = state.tapes[0]
        this.index = state.indexes[0];
        this.mState = state.state;
    }
}
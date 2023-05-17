import {ITransition} from "./expressions/StateMachine";
import {TuringMachine} from "./expressions/TuringMachine";
import {Grammar} from "./expressions/Grammar";

export interface IMachine {
    name: string;
    charset: Set<string>;
    states: Set<string>;
    getInit(): string;
    init: string;
    accept: Set<string>;

    history: {data: Array<{machine: IMachine, tag: string}>, index: number};


    getTransitions(): Map</* from */string, Map</* to */string, /* texts */Set<string>>>
    getTransitionsTable(): Array<{state: string, items: Array<string>}>;

    //Simulation
    getCurrentStates(): Set<string>;
    getMachineState(): "rejected" | "accepted" | "working" | "stopped";

    getNumberOfTape(): number;
    getTapeIndex(index:number): number;
    setTapeValue(index:number, input: string): void;
    getTapeValue(index:number): string;

    reset(): void;
    nextState(): void;
    nextState(index:string): void;
    run(): void;

    getAsGrammar(): Grammar | null;

    isSteppable(): boolean;
}
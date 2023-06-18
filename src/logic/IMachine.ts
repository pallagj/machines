import {Grammar} from "./expressions/Grammar";

export interface MachineState {
    label: string,
    tapes: string[],
    indexes: number[],
    currentStates: string[]
    state: "working" | "rejected" | "accepted" | "stopped";
}

export interface IMachine {
    name: string;
    charset: Set<string>;
    states: Set<string>;
    init: string;
    accept: Set<string>;

    getInit(): string;

    getTransitions(): Map</* from */string, Map</* to */string, /* texts */Set<{label:string, selected:boolean}>>>

    getTransitionsTable(): Array<{ state: string, items: Array<string> }>;

    getCurrentStates(): Set<string>;

    getMachineState(): "rejected" | "accepted" | "working" | "stopped";

    getNumberOfTape(): number;

    getTapeIndex(index: number): number;

    setTapeValue(index: number, input: string): void;

    getTapeValue(index: number): string;

    reset(): void;

    nextState(): void;

    nextState(index: string): void;

    run(): void;

    getAsGrammar(): Grammar | null;

    getTapes(): string[];

    getIndexes(): number[];

    setSimulationState(state: MachineState): void;

    getSimulationState(): MachineState

    hasTransition(from: string, to: string): boolean;
    isSteppable(): boolean
}
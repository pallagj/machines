import {StateMachine} from "./expressions/StateMachine";
import {TuringMachine} from "./expressions/TuringMachine";
import {Expression} from "./expressions/Expression";

import {loadStateMachine, saveStateMachine} from "./loaders/StateMachineLoader";
import {loadPushdownMachine, savePushdownMachine} from "./loaders/PushdownMachineLoader";
import {loadTuringMachine, saveTuringMachine} from "./loaders/TuringMachineLoader";
import {loadExpressions} from "./loaders/ExpressionLoader";
import {PushdownMachine} from "./expressions/PushdownMachine";
import {IMachine} from "./IMachine";
import {Grammar} from "./expressions/Grammar";
import {loadGrammar, saveGrammar} from "./loaders/GrammarLoader";

export class MachinesStore {
    static instance: MachinesStore = new MachinesStore(); // Singleton

    store: (IMachine | Expression | Grammar | null) [] = [];
    activeIndex: number = 0;

    updateMachine(m: IMachine | Expression | Grammar | null) {
        this.store[this.activeIndex] = m;
    }

    updateCommand(code: string, index: number): MachinesStore {
        if (code.startsWith("StateMachine")) {
            this.store[index] = loadStateMachine(code);
        } else if (code.startsWith("TuringMachine")) {
            this.store[index] = loadTuringMachine(code);
        } else if (code.startsWith("PushdownMachine")) {
            this.store[index] = loadPushdownMachine(code);
        } else if (code.startsWith("Grammar")) {
            this.store[index] = loadGrammar(code);
        } else {
           // this.store[index] = loadExpression(code, this);
        }

        this.activeIndex = index;

        return this;
    }

    getActiveGrammar() : Grammar | null {
        let v = this.store[this.activeIndex];

        if(v instanceof Grammar) {
            return v as Grammar;
        }

        return null;
    }

    getActiveMachine(): IMachine | null {
        let v = this.store[this.activeIndex];

        if(v instanceof StateMachine) {
            return v as StateMachine;
        } else if (v instanceof TuringMachine) {
            return v as TuringMachine;
        } else if(v instanceof PushdownMachine) {
            return v as PushdownMachine;
        } else if(v instanceof Grammar) {
            let grammar = v as Grammar;

            let c = grammar.classify().class;
            if(c==3) return grammar.getStateMachine();
            if(c==2) return grammar.getPushdownMachine();

            return null;
        } else if(v instanceof Expression) {
            let out = (v as Expression).evalMachine();

            if (out instanceof StateMachine)
                return out as StateMachine;

            if (out instanceof TuringMachine)
                return out as TuringMachine;

            if (out instanceof PushdownMachine)
                return out as PushdownMachine;
        }

        return null;
    }

    getActiveMachineCode(): string {
        let v = this.store[this.activeIndex];

        if(v instanceof StateMachine) {
            let grammar = (v as StateMachine).getAsGrammar();

            if(grammar !== null) {
               return saveGrammar(grammar)
            }
        }

        let machine = this.getActiveMachine();
        let text = "";
        if (machine instanceof TuringMachine) {
            text = saveTuringMachine(machine as TuringMachine);
        } else if (machine instanceof StateMachine) {
            text = saveStateMachine(machine as StateMachine);
        } else if (machine instanceof PushdownMachine) {
            text = savePushdownMachine(machine as PushdownMachine);
        }

        return text;
    }

    hasVariable(name: string) {
        return this.store.filter(v => v?.name === name).length > 0;
    }

    getVariable(name: string): (StateMachine | PushdownMachine | TuringMachine | Grammar | null) {
        let filtered = this.store.filter(v => v?.name === name);

        if (filtered.length === 0)
            return null;

        let v = filtered[0];

        if (v?.name === name) {
            if(v instanceof StateMachine) {
                return v as StateMachine;
            } else if(v instanceof TuringMachine) {
                return v as TuringMachine
            } else if(v instanceof PushdownMachine) {
                    return v as PushdownMachine
            } else if(v instanceof Expression) {
                return (v as Expression).evalMachine();
            }
        }
        return null;
    }
}


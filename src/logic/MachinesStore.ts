import {StateMachine} from "./expressions/StateMachine";
import {TuringMachine} from "./expressions/TuringMachine";
import {Expression} from "./expressions/Expression";

import {loadStateMachine, saveStateMachine} from "./loaders/StateMachineLoader";
import {loadPushdownMachine, savePushdownMachine} from "./loaders/PushdownMachineLoader";
import {loadTuringMachine, saveTuringMachine} from "./loaders/TuringMachineLoader";
import {loadExpression} from "./loaders/ExpressionLoader";
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

        if(v?.constructor.name === Grammar.name) {
            return v as Grammar;
        }

        return null;
    }

    getActiveMachine(): IMachine | null {
        let v = this.store[this.activeIndex];

        switch (v?.constructor.name) {
            case StateMachine.name:
                return v as StateMachine;
            case TuringMachine.name:
                return v as TuringMachine;
            case PushdownMachine.name:
                return v as PushdownMachine;
            case Grammar.name:
                let grammar = v as Grammar;

                let c = grammar.classify().class;
                if(c==3) return grammar.getStateMachine();
                if(c==2) return grammar.getPushdownMachine();

                return null;
            case Expression.name: {
                let out = (v as Expression).evalMachine();

                if (out?.constructor.name == StateMachine.name)
                    return out as StateMachine;

                if (out?.constructor.name == TuringMachine.name)
                    return out as TuringMachine;

                if (out?.constructor.name == PushdownMachine.name)
                    return out as PushdownMachine;
            }
        }
        return null;
    }

    getActiveMachineCode(): string {
        let v = this.store[this.activeIndex];

        if(v?.constructor?.name === StateMachine.name) {
            let grammar = (v as StateMachine).getAsGrammar();

            if(grammar !== null) {
               return saveGrammar(grammar)
            }
        }

        let machine = this.getActiveMachine();
        let text = "";
        if (machine?.constructor.name == 'TuringMachine') {
            text = saveTuringMachine(machine as TuringMachine);
        } else if (machine?.constructor.name == 'StateMachine') {
            text = saveStateMachine(machine as StateMachine);
        } else if (machine?.constructor.name == 'PushdownMachine') {
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
            switch (v.constructor.name) {
                case StateMachine.name:
                    return v as StateMachine;
                case TuringMachine.name:
                    return v as TuringMachine;
                case Expression.name:
                    return (v as Expression).evalMachine();
            }
        }
        return null;
    }
}


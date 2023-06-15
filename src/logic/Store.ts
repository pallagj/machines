import {StateMachine} from "./expressions/StateMachine";
import {PushdownMachine} from "./expressions/PushdownMachine";
import {TuringMachine} from "./expressions/TuringMachine";
import {Grammar} from "./expressions/Grammar";
import {Graph} from "./expressions/Graph";
import {saveStateMachine} from "./loaders/StateMachineLoader";
import {savePushdownMachine} from "./loaders/PushdownMachineLoader";
import {saveTuringMachine} from "./loaders/TuringMachineLoader";
import {saveGrammar} from "./loaders/GrammarLoader";

type ExpressionValue = StateMachine | PushdownMachine | TuringMachine | Grammar;

export class Store {
    storeByName = new Map<string, ExpressionValue>();
    storeByIndex: { name: string, value: ExpressionValue | undefined }[] = [];
    indexFromName = new Map<string, number>();
    errors: string[] = [];

    public setNameToIndex(name: string, index: number): string | null {
        let duplicatedName: string | null = null;

        if (this.indexFromName.has(name)) {
            this.indexFromName.set(name, index);
            this.storeByIndex[index] = {name: name, value: undefined};

            this.storeByIndex.forEach((value, index) => {
                if (value.name === name) {
                    this.errors[index] = `Multiple definition (${value.name})`;
                    duplicatedName = value.name;
                }
            })
        } else {
            this.indexFromName.set(name, index);
            this.storeByIndex[index] = {name: name, value: undefined};
        }

        return duplicatedName;
    }

    public getByIndex(index: number): ExpressionValue | null {
        return this.storeByIndex[index]?.value ?? null;
    }

    public getByName(name: string): ExpressionValue | null {
        return this.storeByName.get(name) ?? null;
    }

    public getNameByIndex(index: number): string | null {
        return this.storeByIndex[index]?.name ?? null;
    }

    public getIndexByName(name: string): number | null {
        return this.indexFromName.get(name) ?? null;
    }

    public setByIndex(index: number, value: ExpressionValue) {
        this.storeByIndex[index] = {name: value.name, value: value};
        this.storeByName.set(value.name, value);
        this.indexFromName.set(value.name, index);
    }

    public setByName(name: string, value: ExpressionValue) {
        if (this.indexFromName.has(name)) {
            this.storeByIndex[this.indexFromName.get(name)!] = {name: name, value: value};
            this.storeByName.set(name, value);
        }
    }

    public setErrorByIndex(index: number, error: string) {
        this.errors[index] = error;
    }

    public setErrorByName(name: string, error: string) {
        if (this.indexFromName.has(name)) {
            this.errors[this.indexFromName.get(name)!] = error;
        }
    }

    public getErrorByIndex(index: number): string {
        return this.errors[index] ?? "";
    }

    public getErrorByName(name: string): string {
        if (this.indexFromName.has(name)) {
            return this.errors[this.indexFromName.get(name)!] ?? "";
        }

        return "";
    }

    public clear() {
        this.storeByName.clear();
        this.storeByIndex = [];
        this.indexFromName.clear();
        this.errors = [];
    }

    public getCodeByIndex(selectedIndex: number): string | null {
        let selected = this.getByIndex(selectedIndex);

        if (selected instanceof StateMachine) {
            return saveStateMachine(selected);
        } else if (selected instanceof PushdownMachine) {
            return savePushdownMachine(selected);
        } else if (selected instanceof TuringMachine) {
            return saveTuringMachine(selected);
        } else if (selected instanceof Grammar) {
            switch(selected.classify().class) {
                case 3: return saveStateMachine(selected.getStateMachine()!);
                case 2: return savePushdownMachine(selected.getPushdownMachine()!);
                default: return null;
            }

        }

        return null;
    }
}
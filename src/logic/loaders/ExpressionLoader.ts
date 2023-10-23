import {StateMachine} from "../expressions/StateMachine";
import {TuringMachine} from "../expressions/TuringMachine";
import {PushdownMachine} from "../expressions/PushdownMachine";
import {Grammar} from "../expressions/Grammar";
import {loadStateMachine} from "./StateMachineLoader";
import {loadTuringMachine} from "./TuringMachineLoader";
import {loadPushdownMachine} from "./PushdownMachineLoader";
import {loadGrammar} from "./GrammarLoader";
import {Expression} from "../expressions/Expression";
import {Graph} from "../expressions/Graph";
import {toArray} from "../common";


type ExpressionValue = StateMachine | PushdownMachine | TuringMachine | Grammar;

function loadYaml(code: string): ExpressionValue | null {
    if (code.startsWith("StateMachine")) {
        return loadStateMachine(code);
    } else if (code.startsWith("TuringMachine")) {
        return loadTuringMachine(code);
    } else if (code.startsWith("PushdownMachine")) {
        return loadPushdownMachine(code);
    } else if (code.startsWith("Grammar")) {
        return loadGrammar(code);
    }

    return null;
}

export function loadExpressions(codes: string[]) {
    const storeData = window.__STORE__;

    storeData.clear();

    let graph = new Graph("graph")

    let values: Map<string, ExpressionValue | string> = new Map<string, ExpressionValue | string>();

    codes.forEach((code, index) => {

        let exprValue = null;
        try{
            exprValue = loadYaml(code);
        } catch (e) {
            storeData.setErrorByIndex(index, "Invalid syntax!");
            return;
        }
        if (exprValue !== null) {
            let duplicated = storeData.setNameToIndex(exprValue.name, index);

            graph.nodes.add(exprValue.name);

            if (duplicated) {
                values.delete(duplicated);
            } else {
                values.set(exprValue.name, exprValue);
            }

            return;
        }

        let cleanCode = Expression.cleanCode(code);
        if (cleanCode !== null) {
            let duplicated = storeData.setNameToIndex(cleanCode.name, index);

            graph.nodes.add(cleanCode.name);

            if (duplicated) {
                values.delete(duplicated);
            } else {
                values.set(cleanCode.name, cleanCode.code);
            }
        }
    })


    values.forEach((value, name) => {
        if (typeof value === "string") {
            Expression.getDependencies(value, graph.nodes).forEach(d => {
                graph.addEdge(name, d);
                let error = storeData.getErrorByName(d);
                if (error !== "") {
                    storeData.setErrorByName(name, error);
                }
            });
        }
    });

    storeData.errors.forEach((error, index) => {
        if (error !== "" && storeData.getNameByIndex(index) !== "") {
            graph.removeNode(storeData.getNameByIndex(index)!);
        }
    })


    graph.nodes.forEach((name) => {
        let circle = graph.circleFrom(name);
        if (circle.size > 0) {
            storeData.setErrorByName(name, "Circular dependency detected width: " + toArray(circle).sort().join(", "));
        }
    })


    let sorted = graph.topologicalSort();

    sorted.forEach((name) => {
        if (typeof values.get(name) !== "string") {
            storeData.setByName(name, values.get(name) as ExpressionValue);
            return;
        }


        let expression = new Expression(name, values.get(name) as string, storeData.storeByName);

        let machine = null;
        try{
            machine = expression.evalMachine()
        }catch (e:any) {
            storeData.setErrorByName(name, e.message);
            return;
        }

        if (machine === null) {
            storeData.setErrorByName(name, "Error parsing expression");
            return;
        }

        machine.name = name;
        storeData.setByName(name, machine);
    });

    return storeData;
}
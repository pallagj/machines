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

export function loadExpression(codes: string[], index: number): ExpressionValue | null {
    let code = codes[index];

    //This code check

    if (code.replace(/\s/g, "").length === 0)
        return null;

    let result = loadYaml(code);

    if (result !== null)
        return result;

    let thisCleanCode = Expression.cleanCode(code);

    if (thisCleanCode === null)
        throw new Error("Invalid expression");

    //Check with others

    let graph = new Graph("graph")

    let cleanedCodes : Map<string, ExpressionValue| string> = new Map<string, ExpressionValue | string>();

    codes.forEach(code => {
        let exprValue = loadYaml(code);

        if (exprValue !== null) {
            if(cleanedCodes.has(exprValue.name))
                throw new Error(`Multiple definition (${exprValue.name})`);

            cleanedCodes.set(exprValue.name, exprValue);
            return;
        }

        let cleanCode = Expression.cleanCode(code);
        if(cleanCode !== null) {
            if(cleanedCodes.has(cleanCode.name))
                throw new Error(`Multiple definition (${cleanCode.name})`);

            cleanedCodes.set(cleanCode.name, cleanCode.code);
        }
    })

    graph.nodes = new Set(cleanedCodes.keys());

    let toGraphviz = (graph: Graph) => {
        let result = "digraph G {\n";

        graph.nodes.forEach(n => {
            result += n + ";\n";
        });

        graph.edges.forEach((to, from) => {
            result += from + " -> " + toArray(to) + ";\n";
        });

        result += "}";

        return result;
    }

    cleanedCodes.forEach((value, name) => {
        if(typeof value === "string") {
            Expression.getDependencies(value, graph.nodes).forEach(d => {
                graph.addEdge(name, d);
            });
        }
    });

    console.log(toGraphviz(graph));

    let circle = graph.circleFrom(thisCleanCode.name);

    if (circle.size > 0) {
        throw new Error("Circular dependency detected width: "+ toArray(circle).sort().join(", "));
    }

    let sorted = graph.topologicalSort();

    let store = new Map<string, ExpressionValue>();
    sorted.forEach((name) => {
        if(typeof cleanedCodes.get(name) !== "string") {
            store.set(name, cleanedCodes.get(name) as ExpressionValue);
            return;
        }


        let expression = new Expression(name, cleanedCodes.get(name) as string, store);
        let machine = expression.evalMachine()

        if(machine == null)
            throw new Error("Invalid parse");

        machine.name = name;
        store.set(name, machine)
    });

    console.log(store);

    return null;
}
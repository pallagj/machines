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

type ExpressionValue = StateMachine | PushdownMachine |TuringMachine | Grammar;

function loadYaml(code: string) : ExpressionValue | null {
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

export function loadExpression(codes: string[], index: number) :  ExpressionValue | null {
    let code = codes[index];

    let result = loadYaml(code);

    if(result !== null)
        return result;

    if(Expression.cleanCode(code) === null)
        throw new Error("Invalid expression");

    let graph = new Graph("graph")
    let exprNames = new Map<number, string>();

    codes.forEach((c, i) => {
        let exprValue = loadYaml(c);
        if(exprValue !== null) {
            graph.addNode(exprValue.name);
            exprNames.set(i, exprValue.name);
            return;
        }

        let cleanCode = Expression.cleanCode(c)

        if(cleanCode !== null) {
            graph.addNode(cleanCode.name)
            exprNames.set(i, cleanCode.name);
            codes[i] = cleanCode.code;
        }
    })

    codes.forEach((c, i) => {
        Expression.getDependencies(c, graph.nodes).forEach(d => {
            if(exprNames.has(i))
                graph.addEdge(d, exprNames.get(i)!);
        })
    })

    let circle = graph.circleFrom(exprNames.get(index)!);

    if(circle !== null) {
        throw new Error("Circular dependency detected");
    }

    //TODO: topological sort


    return null;
}
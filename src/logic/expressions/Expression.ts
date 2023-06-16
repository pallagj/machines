import {StateMachine} from "./StateMachine";
import {TuringMachine} from "./TuringMachine";
import {PushdownMachine} from "./PushdownMachine";
import {Grammar} from "./Grammar";

type ExpressionValue = StateMachine | PushdownMachine | TuringMachine | Grammar;
type Parameter = ExpressionValue | string | null;

export class Expression {
    name: string = "";
    code: string = "";
    store: Map<string, ExpressionValue>;

    functions = {
        "StateMachine": {
            "random": (parameters: Parameter[]) => StateMachine.createMachine(parseInt(parameters[0] as string), parseInt(parameters[1] as string)),
            "min": (parameters: Parameter[]) => (parameters[0] as StateMachine).minimize(),
            "complete": (parameters: Parameter[]) => (parameters[0] as StateMachine).complete(parameters[1] as string),
            "det": (parameters: Parameter[]) => (parameters[0] as StateMachine).determination(),
            "union": (parameters: Parameter[]) => (parameters[0] as StateMachine).union((parameters[1] as StateMachine), "union"),
            "difference": (parameters: Parameter[]) => (parameters[0] as StateMachine).union(parameters[1] as StateMachine, "difference"),
            "intersect": (parameters: Parameter[]) => (parameters[0] as StateMachine).union(parameters[1] as StateMachine, "intersect"),
            "available": (parameters: Parameter[]) => (parameters[0] as StateMachine).available(),
            "complement": (parameters: Parameter[]) => (parameters[0] as StateMachine).complement(),
            "epsfree": (parameters: Parameter[]) => (parameters[0] as StateMachine).epsfree(),
            "concat": (parameters: Parameter[]) => (parameters[0] as StateMachine).concat(parameters[1] as StateMachine),
            "close": (parameters: Parameter[]) => (parameters[0] as StateMachine).close(),
            "clean": (parameters: Parameter[]) => (parameters[0] as StateMachine).clean(),

        }
    }


    constructor(name: string, code: string, store: Map<string, ExpressionValue>) {
        this.name = name;
        this.code = code;
        this.store = store;
    }

    evalMachine(): StateMachine | TuringMachine | PushdownMachine | Grammar | null {
        let m = this.eval(this.code);

        if(m instanceof StateMachine) return m as StateMachine;
        if(m instanceof PushdownMachine) return m as PushdownMachine;
        if(m instanceof TuringMachine) return m as TuringMachine;
        if(m instanceof Grammar) return m as Grammar;

        return null;
    }

    private static splitBracket(code: string, splitter: string): string[] | null {
        let parametersString: string[] = [];
        let s = "";
        let counter = 0;

        code.split("").forEach(c => {
            if (counter === 0 && c === splitter) {
                parametersString.push(s);
                s = "";
            } else s += c;
            if (c === "(") counter++;
            if (c === ")") counter--;

            if (counter < 0) return null;
        })

        if (counter !== 0) return null;
        if (s === "") return null;

        parametersString.push(s);

        return parametersString;
    }

    private eval(code: string): (PushdownMachine | TuringMachine | StateMachine | Grammar | null) {
        if (code === "") return null;

        let variable = /^([a-zA-Z0-9]+)(\*)?$/.exec(code);
        let funct = /^([a-zA-Z0-9]+)\((.*)\)(\*)?$/.exec(code);
        let bracket = /^\((.*)\)(\*)?$/.exec(code);
        let plusRegex = /((.+)\+)+(.+)/.exec(code);
        let plus = code.split("+");

        if (variable !== null) {
            if (this.store.has(variable[1])) {
                let machine = this.store.get(variable[1]);
                if (variable[2] === undefined) return machine ?? null;

                return this.functions["StateMachine"].close([machine ?? null]);
            }

            let varName = "";
            let isVar = false;
            let machine: StateMachine | null = null;
            variable[1].split("").forEach(c => {
                if (/[a-z0-9A-Z]/.exec(c) !== null) {
                    let m = new StateMachine("Accept" + c, [c], ['S', 'A'], 'S', ['A'], new Map<string, Map<string, Set<string>>>([["S", new Map<string, Set<string>>([[c, new Set(['A'])]])]]))
                    machine = machine === null ? m : this.functions["StateMachine"].concat([machine, m]);
                }
            })
            if (variable[2] === undefined) return machine;

            return this.functions["StateMachine"].close([machine]);


        }

        let plusList = Expression.splitBracket(code, '+');

        if (plusList === null) return null;

        if (funct !== null) {
            let parametersString = Expression.splitBracket(funct[2], ',');
            if (parametersString != null) {
                let parameters = parametersString.map((v: string) => this.eval(v));

                if (funct[1] === "" && parameters.length === 1) return parameters[0];

                let m = null;


                if (parameters[0] instanceof  StateMachine) {
                    if (funct[1] === "random") m = this.functions["StateMachine"].random([parametersString[0], parametersString[1]]);
                    if (funct[1] === "min") m = this.functions["StateMachine"].min(parameters);
                    if (funct[1] === "det") m = this.functions["StateMachine"].det(parameters);
                    if (funct[1] === "complete") m = this.functions["StateMachine"].complete([parameters[0], parametersString[1]]);
                    if (funct[1] === "union") m = this.functions["StateMachine"].union(parameters);
                    if (funct[1] === "difference") m = this.functions["StateMachine"].difference(parameters);
                    if (funct[1] === "intersect") m = this.functions["StateMachine"].intersect(parameters);
                    if (funct[1] === "available") m = this.functions["StateMachine"].available(parameters);
                    if (funct[1] === "complement") m = this.functions["StateMachine"].complement(parameters);
                    if (funct[1] === "epsfree") m = this.functions["StateMachine"].epsfree(parameters);
                    if (funct[1] === "concat") m = this.functions["StateMachine"].concat(parameters);
                    if (funct[1] === "close") m = this.functions["StateMachine"].close(parameters);
                    if (funct[1] === "clean") m = this.functions["StateMachine"].clean(parameters);
                }

                if (funct[3] === undefined) return m; else return this.functions["StateMachine"].close([m]);
            }
        }

        if (bracket !== null) {
            let inside = Expression.splitBracket(bracket[1], ',');
            if (inside != null && inside.length === 1) {
                let m = this.eval(inside[0]);

                if (bracket[2] === undefined) return m; else return this.functions["StateMachine"].close([this.eval(inside[0])]);
            }
        }

        if (plusRegex !== null) {
            let machine: PushdownMachine | TuringMachine | StateMachine | Grammar | null = null;
            plusList.forEach(m => {
                if (machine == null) machine = this.eval(m); else machine = this.functions["StateMachine"].union([machine, this.eval(m)]).available().clean()   ;
            })
            return machine;
        }

        return null;

    }

    public static cleanCode(code: string): { name: string, code: string } | null {
        code = code
            .replaceAll(" ", "")
            .replaceAll("\n", "")
            .replaceAll("\t", "");

        let expr = /(.+)=(.+)/.exec(code); //TODO név nélkül


        if (expr != null) {
            return {
                name: expr[1], code: expr[2]
            }
        }

        return null
    }

    public static getDependencies(code: string, vars: Set<string>): Set<string> {
        let result = new Set<string>();
        if (code === "") return result;

        let variable = /^([a-zA-Z0-9]+)(\*)?$/.exec(code);
        let funct = /^([a-zA-Z0-9]+)\((.*)\)(\*)?$/.exec(code);
        let bracket = /^\((.*)\)(\*)?$/.exec(code);
        let plusRegex = /((.+)\+)+(.+)/.exec(code);
        let plus = code.split("+");

        if (variable && vars.has(variable[1])) {
            return new Set<string>([variable[1]]);
        }

        let plusList = this.splitBracket(code, '+');

        if (plusList === null) return result;

        if (funct !== null) {
            let parametersString = this.splitBracket(funct[2], ',');
            if (parametersString != null) {
                let parameters = parametersString.map((v: string) => Expression.getDependencies(v, vars).forEach(v => result.add(v)));
                return result;
            }
        }

        if (bracket !== null) {
            let inside = this.splitBracket(bracket[1], ',');
            if (inside != null && inside.length === 1) {
                Expression.getDependencies(inside[0], vars).forEach(v => result.add(v));
                return result;
            }
        }

        if (plusRegex !== null) {
            plusList.forEach(m => {
                Expression.getDependencies(m, vars).forEach(v => result.add(v))
            })
        }

        return result;
    }

}
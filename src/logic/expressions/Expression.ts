import {StateMachine} from "./StateMachine";
import {TuringMachine} from "./TuringMachine";
import {PushdownMachine} from "./PushdownMachine";
import {Grammar} from "./Grammar";

type ExpressionValue = StateMachine | PushdownMachine | TuringMachine | Grammar;
type Parameter = ExpressionValue | string | null;

export class Expression {
    static functions = {
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
    name: string = "";
    code: string = "";
    store: Map<string, ExpressionValue>;

    constructor(name: string, code: string, store: Map<string, ExpressionValue>) {
        this.name = name;
        this.code = code;
        this.store = store;
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

    public static testParenthesis(code: string): boolean {
        let counter = 0;
        for (let i = 0; i < code.length; i++) {
            if (code[i] === "(") counter++;
            if (code[i] === ")") counter--;
            if (counter < 0) return false;
        }

        return counter === 0;
    }

    public static getDependencies(code: string, vars: Set<string>): Set<string> {
        let set = new Set<string>();
        if (code === "") return set;

        if (!this.testParenthesis(code)) {
            return set;
        }

        let funct = /^([a-zA-Z0-9]+)\((.*)\)(\*)?$/.exec(code);
        let variable = /^([a-zA-Z0-9]+)(\*)?$/.exec(code);
        let bracket = /^\((.*)\)(\*)?$/.exec(code);

        console.log("before funct")
        if (funct !== null) {
            let parametersString = Expression.splitBracket(funct[2], ',');
            if (parametersString != null && Object.values(Expression.functions).flatMap(o => Object.keys(o)).includes(funct[1])) {
                parametersString.map((v: string) => this.getDependencies(v, vars)).forEach(ds => {
                    ds.forEach(d => set.add(d))
                })

                return set;
            }
        }

        let plusList = Expression.splitBracket(code, '+');

        if (plusList === null) return set;

        if (plusList.length > 1) {
            let machinesUnions: StateMachine | null = null;

            plusList.forEach(code => {
                this.getDependencies(code, vars).forEach(d => set.add(d))
            })

            return set;
        }

        console.log("before variable")
        if (variable !== null && vars.has(variable[1])) {
            set.add(variable[1])
            return set
        }


        //concat
        console.log("before concat: " + code)
        let machine: StateMachine | null = null;

        for (let i = 0; i < code.length; i++) {
            let c = code[i];
            if (c === "(") {
                let counter = 1;
                let j = i;
                while (counter !== 0) {
                    j++;
                    if (code[j] === "(") counter++;
                    if (code[j] === ")") counter--;
                }

                this.getDependencies(code.substring(i + 1, j), vars).forEach(v => set.add(v));
            }
        }

        return set;
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

    evalMachine(): StateMachine | TuringMachine | PushdownMachine | Grammar | null {
        let m = this.eval(this.code);

        if (m instanceof StateMachine) return m as StateMachine;
        if (m instanceof PushdownMachine) return m as PushdownMachine;
        if (m instanceof TuringMachine) return m as TuringMachine;
        if (m instanceof Grammar) return m as Grammar;

        return null;
    }


    private eval(code: string): (PushdownMachine | TuringMachine | StateMachine | Grammar | null) {
        if (code === "") return null;

        if (!Expression.testParenthesis(code)) {
            console.log(`Wrong parenthesis in ${code}`)
            throw new Error("Wrong parenthesis!");
        }

        let funct = /^([a-zA-Z0-9]+)\((.*)\)(\*)?$/.exec(code);
        let variable = /^([a-zA-Z0-9]+)(\*)?$/.exec(code);
        let bracket = /^\((.*)\)(\*)?$/.exec(code);

        console.log("before funct")
        if (funct !== null) {
            let parametersString = Expression.splitBracket(funct[2], ',');
            if (parametersString != null && Object.values(Expression.functions).flatMap(o => Object.keys(o)).includes(funct[1])) {
                let parameters = parametersString.map((v: string) => this.eval(v));

                if (funct[1] === "" && parameters.length === 1) return parameters[0];

                let m = null;


                if (parameters[0] instanceof StateMachine) {
                    if (funct[1] === "random") m = Expression.functions["StateMachine"].random([parametersString[0], parametersString[1]]);
                    if (funct[1] === "min") m = Expression.functions["StateMachine"].min(parameters);
                    if (funct[1] === "det") m = Expression.functions["StateMachine"].det(parameters);
                    if (funct[1] === "complete") m = Expression.functions["StateMachine"].complete([parameters[0], parametersString[1]]);
                    if (funct[1] === "union") m = Expression.functions["StateMachine"].union(parameters);
                    if (funct[1] === "difference") m = Expression.functions["StateMachine"].difference(parameters);
                    if (funct[1] === "intersect") m = Expression.functions["StateMachine"].intersect(parameters);
                    if (funct[1] === "available") m = Expression.functions["StateMachine"].available(parameters);
                    if (funct[1] === "complement") m = Expression.functions["StateMachine"].complement(parameters);
                    if (funct[1] === "epsfree") m = Expression.functions["StateMachine"].epsfree(parameters);
                    if (funct[1] === "concat") m = Expression.functions["StateMachine"].concat(parameters);
                    if (funct[1] === "close") m = Expression.functions["StateMachine"].close(parameters);
                    if (funct[1] === "clean") m = Expression.functions["StateMachine"].clean(parameters);
                }

                if (funct[3] === undefined) return m; else return Expression.functions["StateMachine"].close([m]);
            }
        }

        let plusList = Expression.splitBracket(code, '+');

        if (plusList === null) return null;

        if (plusList.length > 1) {
            let machinesUnions: StateMachine | null = null;

            plusList.forEach(code => {
                let m = (this.eval(code) as StateMachine);
                console.log("after union: " + code.toString())
                machinesUnions = (machinesUnions === null) ? m : m.union(machinesUnions, "union", true).available().clean()//.complete().determination().minimize().clean();
            })

            return machinesUnions;
        }

        console.log("before variable")
        if (variable !== null && this.store.has(variable[1])) {
            let machine = this.store.get(variable[1]);
            if (variable[2] === undefined) return machine ?? null;

            return Expression.functions["StateMachine"].close([machine ?? null]);
        }


        //concat
        console.log("before concat: " + code)
        let machine: StateMachine | null = null;

        for (let i = 0; i < code.length; i++) {
            let c = code[i];
            let m: StateMachine | null = null;

            if (/[a-z0-9A-Z]/.exec(c) !== null) {
                m = new StateMachine("Accept" + c, [c], ['S', 'A'], 'S', ['A'], new Map<string, Map<string, Set<string>>>([["S", new Map<string, Set<string>>([[c, new Set(['A'])]])]]))
            }

            if (c === "(") {
                let counter = 1;
                let j = i;
                while (counter !== 0) {
                    j++;
                    if (code[j] === "(") counter++;
                    if (code[j] === ")") counter--;
                }
                m = this.eval(code.substring(i + 1, j)) as StateMachine;
                i = j;
            }

            if(m !== null) {
                if (i + 1 < code.length && code[i + 1] === "*") {
                    m = m.close();
                }

                machine = (machine === null ? m : machine.concat(m));
            }
        }

        return machine;
    }

}
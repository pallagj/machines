import {IMachine} from "../IMachine";
import {toArray} from "../common";

export function loadGraphviz(m: IMachine) {
    let dot: string = "digraph G  {";
    dot += "\nrankdir=LR";
    dot += "\nnode [shape=none, label=\"\", color = \"gray\", penwidth = 0.0]; qi"
    dot += "\nqi -> " + m?.init + " [color = \"gray\", orientation=45];";

    m?.states.forEach((state) => {
        let selected = m?.getCurrentStates().has(state);
        let borderColor = selected || m?.getInit() === state ? "crimson" : "gray";

        if (m?.accept.has(state)) {
            dot += `\n    ${state} [label=${state}, shape = doublecircle, color = "${borderColor}", penwidth = 1.5];`;
        } else {
            dot += `\n    ${state} [label=${state}, shape = circle, color = "${borderColor}", penwidth = 1.5];`;
        }
    });

    m?.getTransitions().forEach((v, from) => {
        v.forEach((cs, to) => {
            let selected =  m?.getCurrentStates().has(from) && Array.from(cs).some(c=>c.selected)
            dot += `\n    ${from} -> ${to} [label = "${Array.from(cs).map(c=>c.label).join(", ")}", id = "${from}${Array.from(cs).map(c=>c.label).join()}${to}", color = "${selected ? "crimson" : "gray"}"];`;
        });
    });

    dot += "\n}";
    return dot;
}

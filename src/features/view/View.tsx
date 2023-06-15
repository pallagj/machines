import "./View.css"
import {useAppSelector} from "../../app/hooks";
import {selectExpressions, selectFocusedExpressionIndex} from "../control/expressionsSlice";
import {GrammarView} from "./grammar/GrammarView";
import {MachineView} from "./machines/MachineView";
import {Grammar} from "../../logic/expressions/Grammar";
import {StateMachine} from "../../logic/expressions/StateMachine";
import {PushdownMachine} from "../../logic/expressions/PushdownMachine";
import {TuringMachine} from "../../logic/expressions/TuringMachine";
import {IMachine} from "../../logic/IMachine";


export function View() {
    console.log("14. sor")
    const store = window.__STORE__;
    console.log(`16:${store}`)
    console.log(store)

    useAppSelector(selectExpressions);
    let selectedIndex = useAppSelector(selectFocusedExpressionIndex);
    console.log(`19: ${selectedIndex}`)

    let value = store.getByIndex(selectedIndex);
    console.log(`23: ${value}`)
    console.log(value)

    if (value === undefined || value === null) {
        console.log(`26: ${value}`)
        return (<div></div>);
    }

    console.log(`25: ${value.constructor.name}`)
    console.log(value.constructor.name)

    switch (value.constructor.name) {
        case "Grammar": return (<GrammarView grammar={value as Grammar}></GrammarView>);
        case "StateMachine": return (<MachineView machine={value as IMachine}></MachineView>);
        case "PushdownMachine": return (<MachineView machine={value as IMachine}></MachineView>);
        case "TuringMachine": return (<MachineView machine={value as IMachine}></MachineView>);
        default: return (<div></div>);
    }
}

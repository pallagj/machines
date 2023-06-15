import "./View.css"
import {useAppSelector} from "../../app/hooks";
import {selectExpressions, selectFocusedExpressionIndex} from "../control/expressionsSlice";
import {GrammarView} from "./grammar/GrammarView";
import {MachineView} from "./machines/MachineView";
import {Grammar} from "../../logic/expressions/Grammar";


export function View() {
    const store = window.__STORE__;

    useAppSelector(selectExpressions);
    let selectedIndex = useAppSelector(selectFocusedExpressionIndex);

    let value = store.getByIndex(selectedIndex);

    if (value === undefined || value === null) {
        return (<div></div>);
    }

    switch (value.constructor.name) {
        case "Grammar": return (<GrammarView grammar={value as Grammar}></GrammarView>);
        case "StateMachine": return (<MachineView></MachineView>);
        case "PushdownMachine": return (<MachineView></MachineView>);
        case "TuringMachine": return (<MachineView></MachineView>);
        default: return (<div></div>);
    }
}

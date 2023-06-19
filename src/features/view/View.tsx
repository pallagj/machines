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
    const store = window.__STORE__;

    useAppSelector(selectExpressions);

    let selectedIndex = useAppSelector(selectFocusedExpressionIndex);

    let value = store.getByIndex(selectedIndex);
    let error = store.getErrorByIndex(selectedIndex);

    if (error || value === undefined || value === null) {
        return (<div></div>);
    }


    if (value instanceof Grammar) return (<GrammarView grammar={value as Grammar}></GrammarView>);
    if (value instanceof StateMachine) return (<MachineView machine={value as IMachine}></MachineView>);
    if (value instanceof PushdownMachine) return (<MachineView machine={value as IMachine}></MachineView>);
    if (value instanceof TuringMachine) return (<MachineView machine={value as IMachine}></MachineView>);

    return (<div></div>);
}

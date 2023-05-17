import {Expression} from "./Expression";
import {useAppSelector} from "../../app/hooks";
import {selectExpressions, selectFocusedExpressionIndex, selectFocusNeeded} from "./expressionsSlice";
import "./Control.css";
import {ControlHead} from "./ControlHead";
import {ExpressionMonaco} from "./ExpressionMonaco";

export function Control() {
    let expressions = useAppSelector(selectExpressions);

    let selectedIndex = useAppSelector(selectFocusedExpressionIndex);

    return (<div className="control">
        <ControlHead/>

        <div className="expressions">
            {expressions.map((_, index) =>
                 <Expression index={index} key={index}/>
            )}
        </div>
    </div>);
}

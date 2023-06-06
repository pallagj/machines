import {Expression} from "./Expression";
import {useAppSelector} from "../../app/hooks";
import {selectExpressions} from "./expressionsSlice";
import "./Control.css";
import {ControlHead} from "./ControlHead";

export function Control() {
    let expressions = useAppSelector(selectExpressions);

    return (<div className="control">
        <ControlHead/>
        <div className="expressions">
            {expressions.map((_, index) =>
                <Expression index={index} key={index}/>
            )}
        </div>
    </div>);
}

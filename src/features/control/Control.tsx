import {Expression} from "./Expression";
import {useAppSelector} from "../../app/hooks";
import {selectExpressions} from "./expressionsSlice";
import "./Control.css";
import {ControlHead} from "./ControlHead";
import {loadExpressions} from "../../logic/loaders/ExpressionLoader";
import {NewExpression} from "./NewExpression";

export function Control() {
    let expressions = useAppSelector(selectExpressions);

    let store = loadExpressions(expressions);

    return (<div className="control">
        <ControlHead/>
        <div className="expressions">
            {expressions.map((_, index) =>
                <Expression index={index} key={index} errorText={store.getErrorByIndex(index)}/>
            )}
            <NewExpression lastIndex={expressions.length - 1}/>
        </div>
    </div>);
}

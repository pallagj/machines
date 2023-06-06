import "./ControlHead.css";
import {loadExamples} from "../../logic/loaders/ExamplesLoader";
import {useAppDispatch} from "../../app/hooks";
import {addExpressionAfterIndex, setSelectedExpression} from "./expressionsSlice";

export function ControlHead() {
    let examples = loadExamples();
    const dispatch = useAppDispatch();


    if (examples == null)
        return (<div className="control-head"></div>);


    return (<div className="control-head">
        <div className="dropdown" style={{position: "absolute"}}>
            <button className="btn btn-primary btn-sm dropdown-toggle" type="button" id="dropdownMenuButton1"
                    data-bs-toggle="dropdown" aria-expanded="false">
                Add Expression
            </button>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                {Array.from(examples).map((key, index) => <li key={index}>
                    <a className="dropdown-item" href="#">{key[0]}</a>
                    <ul className="dropdown-menu dropdown-submenu">
                        {// @ts-ignore
                            Array.from(examples.get(key[0])).map((example, index) => <li key={index}><a
                                className="dropdown-item" onClick={()=>dispatch(setSelectedExpression(example[1]))}>{example[0]}</a></li>)}
                    </ul>
                </li>)}
            </ul>
        </div>
    </div>);


}

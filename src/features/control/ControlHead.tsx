import "./ControlHead.css";
import {useAppDispatch} from "../../app/hooks";
import {setSelectedEmptyExpression} from "./expressionsSlice";
import {loadExamples} from "../../logic/loaders/ExamplesLoader";
import {Help} from "../help/Help";

export function ControlHead() {
    const dispatch = useAppDispatch();

    let examples = loadExamples();

    return (<div className="control-head d-flex flex-row justify-content-between">
        <div className="dropdown" >
            <button className="btn btn-primary btn-sm dropdown-toggle" type="button" id="dropdownMenuButton1"
                    data-bs-toggle="dropdown" aria-expanded="false">
                Add Expression
            </button>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                {Array.from(examples).map((key, index) => <li key={index}>
                    <a className="dropdown-item" style={{cursor: "pointer"}}>{key[0]}</a>
                    <ul className="dropdown-menu dropdown-submenu">
                        {// @ts-ignore
                            Array.from(examples.get(key[0])).map((example, index) => <li key={index}><a
                                className="dropdown-item"
                                onClick={() => dispatch(setSelectedEmptyExpression(example[1]))}
                                style={{cursor: "pointer"}}>{example[0]}</a></li>)}
                    </ul>
                </li>)}
                <li>
                    <a className="dropdown-item"
                       onClick={() => dispatch(setSelectedEmptyExpression(""))}
                       style={{cursor: "pointer"}}>Empty Expression</a>
                </li>
            </ul>
        </div>
        <Help />
    </div>);


}

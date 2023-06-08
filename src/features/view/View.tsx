import "./View.css"
import Graphviz from "graphviz-react";
import {loadGraphviz} from "../../logic/loaders/GraphvizLoader";
import {useAppSelector} from "../../app/hooks";
import {selectExpressions, selectFocusedExpressionIndex} from "../control/expressionsSlice";
import {IMachine} from "../../logic/IMachine";


export function View() {
    const store = window.__STORE__;
    
    useAppSelector(selectExpressions);
    let selectedIndex = useAppSelector(selectFocusedExpressionIndex);

    let value = store.getByIndex(selectedIndex);

    if (value === undefined || value === null || value.constructor.name === "Grammar") {
        return (<div></div>);
    }

    let graph = loadGraphviz(value as IMachine);

    return (<div className="view justify-content-center w-100">
        <Graphviz className={"graphviz justify-content-center w-100 d-flex"}
                  dot={graph}
                  options={{
                      fixedsize: false, size: "50%", center: true
                  }}
        />
    </div>);

}

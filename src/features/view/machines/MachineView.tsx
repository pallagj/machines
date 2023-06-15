
import Graphviz from "graphviz-react";
import {loadGraphviz} from "../../../logic/loaders/GraphvizLoader";
import {useAppSelector} from "../../../app/hooks";
import {selectExpressions, selectFocusedExpressionIndex} from "../../control/expressionsSlice";
import {IMachine} from "../../../logic/IMachine";
import React from "react";
import {Grammar} from "../../../logic/expressions/Grammar";
interface MachineProps {
    machine: IMachine
}


export const MachineView: React.FC<MachineProps> = (props) =>  {
    let graph = loadGraphviz(props.machine);

    return (<div className="view justify-content-center w-100">
        <Graphviz className={"graphviz justify-content-center w-100 d-flex"}
                  dot={graph}
                  options={{
                      fixedsize: false, size: "50%", center: true
                  }}
        />
    </div>);

}

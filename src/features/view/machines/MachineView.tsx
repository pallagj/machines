import Graphviz from "graphviz-react";
import {loadGraphviz} from "../../../logic/loaders/GraphvizLoader";
import {IMachine} from "../../../logic/IMachine";
import React from "react";
import {TableView} from "./TableView";

interface MachineProps {
    machine: IMachine
}


export const MachineView: React.FC<MachineProps> = (props) => {
    let graph = loadGraphviz(props.machine);

    return (<div style={{position:"relative"}}>
        <div className="view justify-content-center w-100" style={{position:"relative"}}>
            <Graphviz className={"graphviz justify-content-center w-100 d-flex"}
                      dot={graph}
                      options={{
                          fixedsize: false, size: "50%", center: true
                      }}
            />
        </div>
        <TableView machine={props.machine}/>
    </div>);

}

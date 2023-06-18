import Graphviz from "graphviz-react";
import {loadGraphviz} from "../../../logic/loaders/GraphvizLoader";
import {IMachine} from "../../../logic/IMachine";
import React from "react";
import {TableView} from "./TableView";
import {Simulation} from "./Simulation";
import {useAppSelector} from "../../../app/hooks";
import {selectCurrentHistory} from "./simulationSlice";

interface MachineProps {
    machine: IMachine
}


export const MachineView: React.FC<MachineProps> = (props) => {
    let m = props.machine;
    let currentSimulation = useAppSelector(selectCurrentHistory);

    if(currentSimulation!==null)
        m.setSimulationState(currentSimulation);

    let graph = loadGraphviz(m);

    return (<div style={{position: "relative", height: "100%"}}>
        <div className="view justify-content-center w-100" style={{position: "relative"}}>
            <Graphviz className={"graphviz justify-content-center w-100 d-flex"}
                      dot={graph}
                      options={{
                          fixedsize: false, size: "50%", center: true
                      }}
            />
        </div>
        <TableView machine={m}/>
        <Simulation machine={m}/>
    </div>);

}

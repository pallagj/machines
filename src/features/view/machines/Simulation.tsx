import "./TableView.css"
import "./Simulation.css"

import {IMachine} from "../../../logic/IMachine";
import React, {useEffect, useRef} from "react";
import {useAppDispatch, useAppSelector} from "../../../app/hooks";
import {
    initSimulation,
    nextSimulation,
    runSimulation,
    selectCurrentHistory,
    selectCurrentTapes, selectCurrentTapesFormatted,
    selectHistory,
    selectHistoryLabels,
    setTape
} from "./simulationSlice";
import {ImPlay3, ImStop2} from "react-icons/im";
import {VscCheck, VscChromeClose, VscDebugStepOver} from "react-icons/vsc";

interface MachineProps {
    machine: IMachine
}


export const Simulation: React.FC<MachineProps> = (props) => {
    const textInputRef = useRef<HTMLInputElement>(null);
    let [activeTapeIndex, setActiveTapeIndex] = React.useState(-1);

    let m = props.machine;
    let currentSimulation = useAppSelector(selectCurrentHistory);
    let historyLabels = useAppSelector(selectHistoryLabels);
    let tapes = useAppSelector(selectCurrentTapesFormatted);
    let dispatch = useAppDispatch();

    useEffect(() => {
        m.reset();
        dispatch(initSimulation(m));
    }, []);

    //dispatch(initSimulation(m)) //TODO ?
    if (currentSimulation === null) {
        return <div className={"simulation"}>No simulation available</div>
    }

    m.setSimulationState(currentSimulation);


    return (<div className={"simulation"}>
        <div className={"controllers"}>
            <ul className="pagination controller">
                {historyLabels.map(({current, label}, index) => (<li className="page-item">
                    <a className="page-link"
                       href="#"
                       onClick={() => dispatch(selectHistory(index))}
                       style={{
                           textTransform: "none",
                           background: (current ? "#28b62c" : "#f0f0f0"),
                           color: (current ? "white" : "black")
                       }}>
                        {label}
                    </a>
                </li>))}
                <li className="page-item">
                    <a
                        href="#"
                        className={"page-link"}
                        onClick={() => dispatch(runSimulation(m))}
                    >
                        <ImPlay3/>{" "}
                    </a>
                </li>
                <li className="page-item">
                    <a
                        className={"page-link"}
                        href="#"
                        onClick={() => dispatch(nextSimulation({machine: m, char: ""}))}
                    >
                        <VscDebugStepOver/>{" "}
                    </a>
                </li>
            </ul>


            <div className={"tape-results"}>
                {tapes.map((tape, tapeIndex) => {
                    return (<div className={"tape"}>
                        {activeTapeIndex === tapeIndex ? (<input className={"controller input"}
                                                                 ref={textInputRef}
                                                                 onChange={(s) => dispatch(setTape({
                                                                     tapeIndex: tapeIndex, value: s.target.value
                                                                 }))}
                                                                 onBlur={(c) => setActiveTapeIndex(-1)}
                        />) : (tape.split("").map((c, index) => {
                            return (<div
                                className={"cell" + (index === m?.getTapeIndex(tapeIndex) ? " active" : "")}
                                onDoubleClick={(c) => {
                                    setActiveTapeIndex(tapeIndex);
                                    textInputRef.current?.focus();
                                }}
                            >
                                {c}
                            </div>);
                        }))}
                    </div>)
                })}


                <div className={"results"}>{(() => {
                    switch (m?.getMachineState()) {
                        case "working":
                            return "";
                        case "accepted":
                            return (<VscCheck color={"green"}/>);
                        case "rejected":
                            return (<VscChromeClose color={"red"}/>);
                        case "stopped":
                            return (<ImStop2 color={"red"}></ImStop2>);
                    }
                })()}</div>
            </div>
        </div>
    </div>);
}

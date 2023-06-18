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
    selectCurrentTapesFormatted,
    selectHistory,
    selectHistoryLabels,
    setTape
} from "./simulationSlice";
import {ImPlay3, ImStop2} from "react-icons/im";
import {VscCheck, VscChromeClose, VscDebugStepOver} from "react-icons/vsc";
import {AiOutlineEdit} from "react-icons/ai";

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

        let edges = document.getElementsByClassName("edge");

        let clickHandlers: [Element, (() => void)][] = [];
        for (let i = 0; i < edges.length; i++) {
            let edge = edges.item(i);
            if (edge === null) continue;
            let clickHandler = () => {
                if (edge !== null && edge.id !== null) {
                    let [from, to] = edge.id.split(":");
                    if (m.hasTransition(from, to)) {
                        dispatch(nextSimulation({machine: m, char: edge.id}))
                    }
                }
            };
            edge.addEventListener("click", clickHandler);
            clickHandlers.push([edge, clickHandler]);
        }

        return () => {  // cleanup function
            for (let [edge, clickHandler] of clickHandlers) {
                edge.removeEventListener("click", clickHandler);
            }
        };
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
                           background: (current ? "#158CBA" : "#f0f0f0"),
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
                    if (activeTapeIndex === tapeIndex) {
                        return <div className={"d-flex flex-row align-items-center"}>
                            <input className={"controller form-control"}
                                   ref={textInputRef}
                                   onChange={(s) => {
                                       dispatch(initSimulation(m))
                                       dispatch(setTape({
                                           tapeIndex: tapeIndex, value: s.target.value
                                       }))
                                   }}
                                   onBlur={(c) => setActiveTapeIndex(-1)}
                            />
                            <div className={""}>
                                <button className={"btn p-1 btn-primary"} onClick={() => {
                                    setActiveTapeIndex(-1)
                                }}>
                                    OK
                                </button>
                            </div>
                        </div>
                    }
                    return (<div className={"tape"}>
                        {(tape.split("").map((c, index) => {
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
                        <div className={""}>
                            <button className={"btn btn-sm p-1"} onClick={() => {
                                setActiveTapeIndex(tapeIndex);
                                textInputRef.current?.focus();
                            }}>
                                <AiOutlineEdit/>
                            </button>
                        </div>
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

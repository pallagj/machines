import "./TableView.css"

import {IMachine} from "../../../logic/IMachine";
import React from "react";
import {toArray} from "../../../logic/common";

interface MachineProps {
    machine: IMachine
}


export const TableView: React.FC<MachineProps> = (props) => {
    let m = props.machine;

    return (<div className={"info-table"}>
        <table className={"table table-state"}>
            <thead>
            <tr>
                <th></th>
                {toArray(m.charset).map((c: string, index) => {
                    return <th key={index}>{c}</th>;
                })}
            </tr>
            </thead>
            <tbody>
            {m.getTransitionsTable().map((r, index) => (<tr key={index}>
                    <td style={{
                        color: m?.accept.has(r.state) ? "#158CBA" : "", fontWeight: "bolder",
                    }}
                    >
                        {r.state + (r.state === m?.init ? " ←" : "")}
                    </td>
                    {r.items.map((text, index) => {
                        return (<td key={index}>{text}</td>);
                    })}
                </tr>))}
            </tbody>
        </table>
    </div>);

}

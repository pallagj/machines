import './App.css';
import Split from "@uiw/react-split";
import "bootswatch/dist/lumen/bootstrap.min.css";
import React from "react";
import {Control} from "./features/control/Control";

function App() {

    return (<div className="full-screen">
        <Split className={"w-100"} lineBar={true} style={{height: "100%"}} mode="horizontal">
            <div style={{width: '30%', minWidth: '15%', display:"flex", flexDirection:"column"}}>
                <Control/>
            </div>
            <div style={{width: '80%', minWidth: '15%'}}>
                Right Pane
            </div>
        </Split>

    </div>);
}

export default App;

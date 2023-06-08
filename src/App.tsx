import './App.css';
import Split from "@uiw/react-split";
import "bootswatch/dist/lumen/bootstrap.min.css";
import React from "react";
import {Control} from "./features/control/Control";
import {View} from "./features/view/View";

import {Store} from "./logic/Store";

declare global {
    interface Window {
        __STORE__: Store
    }
}

function App() {
    if(window.__STORE__ === undefined){
        window.__STORE__ = new Store();
    }

    return (<div className="full-screen">
        <Split className={"w-100"} lineBar={true} style={{height: "100%"}} mode="horizontal">
            <div style={{width: '30%', minWidth: '15%', display:"flex", flexDirection:"column"}}>
                <Control/>
            </div>
            <div style={{width: '80%', minWidth: '15%'}}>
                <View/>
            </div>
        </Split>

    </div>);
}

export default App;

import "./ControlHead.css";

export function ControlHead() {
    return (<div className="control-head">
        <div className="dropdown" style={{position: "absolute"}}>
            <button className="btn btn-primary btn-sm dropdown-toggle" type="button" id="dropdownMenuButton1"
                    data-bs-toggle="dropdown" aria-expanded="false">
                Add Expression
            </button>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                <li><a className="dropdown-item" href="#">Empty Expression</a></li>
                <li><a className="dropdown-item" href="#">StateMachine</a></li>
                <li><a className="dropdown-item" href="#">PushdownAutomaton</a></li>
                <li><a className="dropdown-item" href="#">TuringMachine</a></li>
                <div className="dropdown-divider"></div>
                <li><a className="dropdown-item" href="#">RegularGrammar (type 3)</a></li>
                <li><a className="dropdown-item" href="#">ContextFreeGrammars (type 2)</a></li>
                <li><a className="dropdown-item" href="#">ContextSensitiveGrammar (type 1)</a></li>
                <li>
                    <a className="dropdown-item" href="#">Grammar (type 0)</a>
                    <ul className="dropdown-menu dropdown-submenu">
                        <li><a className="dropdown-item" href="#">Submenu item 1</a></li>
                        <li><a className="dropdown-item" href="#">Submenu item 2</a></li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>);


}

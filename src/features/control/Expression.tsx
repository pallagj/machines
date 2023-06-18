import "./Expression.css"
import {useCodeMirror} from "@uiw/react-codemirror";
import React, {useEffect, useRef} from "react";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {
    addExpressionAfterIndex,
    removeExpression,
    selectAltEnter,
    selectExpressions,
    selectFocusedExpressionIndex,
    selectFocusNeeded,
    selectNextExpression,
    selectPreviousExpression,
    setExampleExpressionAt,
    setExpression,
    setFocusedExpressionIndex,
    setFocusNeeded
} from "./expressionsSlice";
import {SiConvertio} from "react-icons/si";
import {VscChromeClose} from "react-icons/vsc";
import {javascript} from '@codemirror/lang-javascript';
import {initSimulation} from "../view/machines/simulationSlice";
import {Grammar} from "../../logic/expressions/Grammar";

interface ExpressionProps {
    index: number,
    errorText: string
}

export const Expression: React.FC<ExpressionProps> = (props) => {
    const store = window.__STORE__;
    const dispatch = useAppDispatch();
    let expressions = useAppSelector(selectExpressions)
    let expression = expressions[props.index]
    let selectedIndex = useAppSelector(selectFocusedExpressionIndex);
    let altEnter = useAppSelector(selectAltEnter);

    let focusNeeded = useAppSelector(selectFocusNeeded);
    let hasFocus = props.index === selectedIndex;

    const editor = useRef<HTMLDivElement>(null);
    let convCode = store.getCodeByIndex(props.index)?.replace(/\n$/, "");
    let error = props.errorText !== "";


    const {setContainer} = useCodeMirror({
        container: editor.current, value: expression, className: "pb-2 pt-2", height: "auto", basicSetup: {
            autocompletion: false,
            lineNumbers: false,
            highlightActiveLine: hasFocus && expression.split('\n').length > 1,
            highlightActiveLineGutter: true,
            foldGutter: true
        },

        extensions: [javascript({jsx: true, typescript: true})], autoFocus: false,

        onChange: (value, viewUpdate) => {
            dispatch(setExpression({index: props.index, expression: value}))
        },

        onUpdate(v) {
            if (hasFocus && focusNeeded) {
                v.view.focus();
                dispatch(setFocusNeeded(false));
            }
        }
    });

    useEffect(() => {
        if (editor.current) {
            setContainer(editor.current);
        }
    }, [setContainer]);

    return <div
        className={
        "pt-2 pb-2 border rounded "
            + (error ? "border-danger" : (hasFocus ? "border-primary" : ""))
        }>
        <div
            style={{position: "relative"}}

            ref={editor}
            onKeyUp={(e) => {
                switch (e.key) {
                    case "Enter":
                        dispatch(setExampleExpressionAt(props.index))
                        break;
                }

            }}
            onKeyDownCapture={(e) => {
                switch (e.key) {
                    case "ArrowUp":
                        if (e.ctrlKey) dispatch(selectPreviousExpression());
                        break;
                    case "ArrowDown":
                        if (e.ctrlKey) dispatch(selectNextExpression());
                        break;
                    case "Enter":
                        if (e.altKey) dispatch(addExpressionAfterIndex(props.index))
                        break;
                    case "Delete":
                        if (e.altKey) dispatch(removeExpression(props.index))
                        break;
                }

            }}
            onFocus={() => {
                dispatch(setFocusedExpressionIndex(props.index))
                let m = store.getByIndex(props.index);
                if(m !== null && !(m instanceof Grammar)) {
                    m.reset();
                    dispatch(initSimulation(m))
                }
            }}
        >
            {(convCode !== null && convCode !== undefined) ? (<button className={"convert-expr"} onClick={() => {
                dispatch(setExpression({index: props.index, expression: convCode!}))
            }}><SiConvertio/></button>) : <div></div>}

            <button className="remove-expr" onClick={() => {
                dispatch(removeExpression(props.index));
            }}><VscChromeClose/></button>
        </div>
        {error && hasFocus ? (<div className="error" role="alert">
            ⚠️ {props.errorText}
        </div>) : <div></div>}

        {/*hasFocus && altEnter ?
            <div style={{marginLeft: "10px"}}>Press <kbd className="keyboard-shortcut">alt</kbd> + <kbd
                className="keyboard-shortcut">enter</kbd> for a new Expression!</div> : <div></div>*/}
    </div>
}

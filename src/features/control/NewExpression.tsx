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

interface ExpressionProps {
    lastIndex: number
}

export const NewExpression: React.FC<ExpressionProps> = (props) => {
    const dispatch = useAppDispatch();

    return <div
        className={
        "pt-4 pb-4 border border rounded mb-5"
        }
        style={{cursor: "pointer"}}
        onClick={()=>dispatch(addExpressionAfterIndex(props.lastIndex))}
    >
    </div>
}

import "./ExpressionMonaco.css"
import {Editor, Monaco, useMonaco} from "@monaco-editor/react";
import React, {useEffect, useRef} from "react";
import {SiConvertio} from "react-icons/si";
import {VscChromeClose} from "react-icons/vsc";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {
    addExpressionAfterIndex,
    selectExpressions,
    selectFocusedExpressionIndex,
    selectFocusNeeded, selectNextExpression, selectPreviousExpression,
    setExpression, setFocusNeeded
} from "./expressionsSlice";
import { editor } from "monaco-editor";

interface ExpressionMonacoProps {
    index: number
}


export const ExpressionMonaco: React.FC<ExpressionMonacoProps> = (props) => {
    const dispatch = useAppDispatch();
    let expressions = useAppSelector(selectExpressions)
    let expression = expressions[props.index]
    let selectedIndex = useAppSelector(selectFocusedExpressionIndex);

    let focusNeeded = useAppSelector(selectFocusNeeded);
    let hasFocus = props.index === selectedIndex;

    const monaco   = useRef<null|Monaco>(null);
    const editorRef = useRef<null|editor.IStandaloneCodeEditor>(null);

    const width = 300;
    const container = document.getElementsByClassName(`expr-editor-${props.index}`).item(0) as HTMLDivElement;
    const parent = useRef<any|null>(null);

    const updateHeight = () => {
        if(editorRef?.current && container && parent.current) {
            const contentHeight = Math.min(1000, editorRef?.current.getContentHeight());

            container.style.width = parent.current.style.width;
            container.style.height = `${contentHeight}px`;

            if(parent) parent.current.style.height = `${contentHeight+16}px`;
            try {
                editorRef?.current?.layout({width, height: contentHeight})
            } finally {
            }
        }
    };

    editorRef.current?.onDidContentSizeChange(updateHeight);



    useEffect(() => {
        editorRef.current?.setValue(expression);
        if (hasFocus && focusNeeded) {
            editorRef.current?.focus();
            dispatch(setFocusNeeded(false));
        }
        if (monaco.current) {
            monaco.current.languages.typescript.typescriptDefaults.addExtraLib(
                `
            
            /**
                * @param name Name of the state machine
                * @param description Description of the state machine  
            */
            function StateMachine(machine: IStateMachine):IStateMachine {
                return 2;
            }
            interface IStateMachine{
                name: string;
                description: string;
            }
            `,
                "defaultLib:lib.es6.d.ts"
            )

            monaco.current.languages.typescript.typescriptDefaults.setCompilerOptions({
                target: monaco.current.languages.typescript.ScriptTarget.ES5,
                allowNonTsExtensions: true,
                noLib: true,
            })

            updateHeight();

        }
    }, [monaco.current, editorRef]);

    return <div ref={parent} style={{position: "relative", width:"100%", display: "inline-flex"}}
                onKeyDownCapture={(e) => {
                    editorRef?.current?.setScrollTop(0)
                    if(editorRef.current) dispatch(setExpression({index: props.index, expression: editorRef.current.getValue()}))

                    switch (e.code) {
                        case "ArrowUp":
                            if (e.ctrlKey) dispatch(selectPreviousExpression());
                            break;
                        case "ArrowDown":
                            if (e.ctrlKey) dispatch(selectNextExpression());
                            break;
                        case "Enter":
                            if (e.altKey) dispatch(addExpressionAfterIndex(props.index))
                            break;
                    }

                }}
                className={"pt-2 pb-2 border rounded"}>
        <Editor
            className={`expr-editor-${props.index}`}
            height={"20px"}
            // height={`${expression.split("\n").length * 20}px`}
            onChange={(value) => {
            }}
            defaultLanguage="typescript"
            defaultValue={expression}
            options={{
                hover: {enabled: false},
                minimap: {enabled: false}, lineNumbers: 'off', glyphMargin: false, folding: false, // Undocumented see https://github.com/Microsoft/vscode/issues/30795#issuecomment-410998882
                lineDecorationsWidth: 10, lineNumbersMinChars: 0,
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                wrappingStrategy: 'advanced',
                overviewRulerLanes: 0,
                scrollbar: {
                    vertical:"hidden",
                    handleMouseWheel:false,
                },
                renderLineHighlight: "none",
                parameterHints: {enabled: false},
                suggest: {
                    previewMode: "subword",
                }
            }}

            onMount={
                (editor, m) => {
                    monaco.current = m;
                    editorRef.current = editor;
                }
            }

        />
        <button className={"convert-expr"} onClick={() => {
        }}><SiConvertio/></button>

        <button className="remove-expr" onClick={() => {
            //dispatch(removeExpression(props.index));
        }}><VscChromeClose/></button>
    </div>;
}

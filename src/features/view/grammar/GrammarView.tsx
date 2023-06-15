import React from "react";
import {Grammar} from "../../../logic/expressions/Grammar"
interface GrammarProps {
    grammar: Grammar
}

export const GrammarView: React.FC<GrammarProps> = (props) => {
    let c = props.grammar.classify();

    return (<div  className="justify-content-center w-100 p-4 card">
        <h1 hidden={c.class!==0}>Grammar</h1>
        <h1 hidden={c.class!==1}>Context Sensitive Grammar</h1>
        <h1 hidden={c.class!==2}>Context Free Grammar</h1>
        <h1 hidden={c.class!==3}>Regular Grammar</h1>
        <p hidden={!c.epsfree}>Grammar contains ε rule</p>

        <table className="table">
            <thead>
            <tr>
                <th>Length</th>
                <th>Words</th>
                <th>Path</th>
            </tr>
            </thead>
            <tbody>
            {
                [1,2,3,4,5,6,7,8,9,10].map(i => {
                    let words: { word:string, path:string}[] = [];
                    props.grammar.words(i, words);
                    return words.map(s => {
                        return (<tr><td>{i}</td><td>{s.word}</td><td>{s.path}</td></tr>)
                    })
                })
            }
            </tbody>
        </table>
    </div>);

}

import {useEffect, useState} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const data = `
# Machines
On this website you have the opportunity to define different mathematical machines and formal languages,
simulate, perform operations on them and display them. The program on BME entitled languages and automata
builds on a learned subject ([note](http://www.cs.bme.hu/~friedl/nyau/jegyzet-13.pdf)).

When opening the page, there is a list on the left in which the given list item can be edited.
A new element can be inserted after the currently edited element with the \`alt\` + \`enter\` command.

We can define the descriptive text ourselves, or we can load an example with the \`\`Add machine'' drop-down menu.
We can create different types of descriptive text:
  - [Finite automata](#vges-automata)
  - [Stack machine](#stack machine)
  - [Turing machine](#turing-gp)
  - [Expression](#expression)

The elements of the list can be removed by clicking on \`x',
the [convert](#kifejzsbl-llapotgp) button (rotating arrow) can be used to convert the expression to a machine.

On the right side, we can see the graphical representation of our given machine,
and the associated transition table.
On this interface, we have the option of [simulation](#simulci).

## Finite automaton
Let's examine the code of the following Finite automaton:
\`\`\`\`yaml
On a Finite Automaton:
   name: M1
   charset: a, b
   states: S, K, A-B, R
   init: S
   accept: R
   transitions:
     - S . S
     - S$K
     - K is A
     - A b B
     - Bar
     - R. R
\`\`\`\`
Using YAML syntax, we enter the name of the Finite automaton with \`name\`, and the input abc with \`charset\`. For \`states\`, the individual states,
\`\`init'' defines the initial state, \`\`accept'' defines the acceptance states, and finally \`\`transitions''
the transitions:
\`\`\`
[starting state] [scanned character] [new state]
\`\`\`
We can use \`.\` in place of any \`[]\`, which the program will replace with all the options in the background
(for status all states, for abc all possible characters). For example \`R . R\` means it is
By reading any character in the \`R\` state, we get to the \`R\` state.

We have the option to use the \`&\` symbol for \`[new state]\`, if we used \`.\` for \`[starting state]\`, then
\`[new state]\` always equals \`[start state]\`.
## Stacking machine
\`\`\`yaml
Automatic Pushdown:
name: M1
charset: a, b
states: A-C
init: A
accept: B
transitions:
- A a a/b B
- B b b/a C
\`\`\`

Using YAML syntax, we enter the name of the stack automaton with \`name\`, and the input abc with \`charset\`. For \`states\`, the individual states,
\`\`init'' defines the initial state, \`\`accept'' defines the acceptance states, and finally \`\`transitions''
the transitions:
\`\`\`
[starting state] [character read] [read from stack]/[written to stack] [new state]
\`\`\`
We can use \`.\` in place of any \`[]\`, which the program will replace with all the options in the background
(for status all states, for abc all possible characters).


We have the option to use the \`&\` symbol for \`[new state]\`, if we used \`.\` for \`[starting state]\`, then
\`[new state]\` always equals \`[start state]\`. The same works with \`[read from stack]\` and \`[written to stack]\`.
## Turing machine
\`\`\`yaml
TuringMachine:
   name: palindrome
   init: start
   charset: a, b
   states: start, haveA, haveB,
           matchA, matchB, back,
           accept, reject
   accept: accept
   transitions:
     - start a/_ > haveA
     - start b/_ > haveB
     - start _/& > accept

     - haveA ./& > haveA
     - haveA _/& < matchA

     - haveB ./& > haveB
     - haveB _/& < matchB

     - matchA a/_ < back
     - matchA b/& > reject
     - matchA _/& > accept

     - matchB a/& > reject
     - matchB b/_ < back
     - matchB _/& > accept

     - back ./& < back
     - back _/& > start
\`\`\`
Using YAML syntax, we specify the name of the Turing machine with \`name\`, and the tape abc with \`charset\`. For \`states\`, the individual states,
\`\`init'' defines the initial state, \`\`accept'' defines the acceptance states, and finally \`\`transitions''
the transitions:
\`\`\`
[start state] [read character]/[write character] [head movement] [new state]
\`\`\`
We can use \`.\` in place of any \`[]\`, which the program will replace with all the options in the background
(for status, all states, for abc all possible characters, for head movement all directions).
When moving the head, \`>\` means to move to the right, \`<\` to the left, and finally \`=\` to leave it where it is.

We have the option to use the \`&\` symbol for \`[new state]\`, if we used \`.\` for \`[starting state]\`, then
\`[new state]\` always equals \`[start state]\`. The same works with \`[character read]\` and \`[character written]\`.

By default, the character \`_\` is the \`abc\` part of the tape, meaning the empty character.
## Expression
We also have the option of specifying an expression that can create a new machine by referring to previous machines.
For example, a Finite automaton can be minimized or made deterministic.

We can use the following syntax:
\`\`\`
M3 = union(M1, M2)
\`\`\`

In this case, we create a new Finite automata from the union of M1 and M2 Finite automata.
This gives us a new Finite automaton, and we can use it in another list item called M3.


| Available functions | Description |
|:-------------------------------------------------------|--------------------------------------|
| *min(\`FinalStateMachine\`)* | creates a minimized Finite automaton |
| *det(\`FinalStateMachine\`)* | creates a deterministic Finite automaton from the previous |
| *union(\`FinalStateMachine\`, \`FinalStateMachine\`)* | returns the union of two Finite automata |
| *difference(\`FinalStateMachine\`, \`FinalStateMachine\`)* | returns the difference of two Finite automata |
| *intersect(\`FinalStateMachine\`, \`FinalStateMachine\`)* | returns the intersection of two Finite automata |
| *available(\`FinalStateMachine\`)* | defines a new automaton, which it builds from the available states of the previous Finite automaton |
| *complement(\`FinalStateMachine\`)* | returns an automaton accepting the complementary language of the original Finite automaton |
| *epsfree(\`FinalStateMachine\`)* | returns an epsilon transition-free Finite automaton |
| *concat(\`FinalStateMachine\`, \`FinalStateMachine\`)* | assigns to two Finite automata an automaton whose grammar is the concatenation of the grammars of the two input Finite automata |
| *close(\`FinalStateMachine\`)* | returns the automaton belonging to the transitive closed of the language |
| *clean(\`FinalStateMachine\`)* | takes all the states one by one and renames the states by going through the capital letters A, B, C, thereby simplifying the long state names |


## From expression Finite automaton
Let the code of our machine \`M1\` be given for our program in the first list item,
also have an expression for this, like \`M_2 = min(det(epsfree(M1)))\` in the second.
Then we have the option by clicking on the rotating arrow in the upper right corner of the second list item
to convert the expression into the language describing the machine.

For example, let \`M1\` be the Finite automaton:
\`\`\`yaml
FinalStateMachine:
name: M1
charset: a, b
states: S, K, A-B, R
init: S
accept: R
transitions:
   - S . S
   - S$K
   - K is A
   - A b B
   - Bar
   - R. R
\`\`\`
And the expression is:
\`\`\`
M2=det(epsfree(M1))
\`\`\`
By clicking the convert button, we get the desired result:
\`\`\`yaml
FinalStateMachine:
name: detectM1
charset: a, b
states: S, AS, BS, ARS, BRS, RS
init: S
accept: ARS, BRS, RS
transitions:
   - And AS
   - S b S
   - AS is AS
   - AS b BS
   - BS is ARS
   - BS b S
   - ARS is ARS
   - ARS b BRS
   - BRS is ARS
   - BRS b RS
   - RS is ARS
   - RS b RS
\`\`\`

## Simulation
The program supports simulation for each machine,
with this we can see what happens on the machine for a given input.

At the bottom of the page, you can perform three actions:
   - restart: stops running and returns to the original state
   - run: runs the entire simulation and stops at the final state
   - stepping:
     - in the deterministic case, we can move the machine to the next state by choosing the next single transition
     - in the non-deterministic case, we can choose which transition direction we want to continue
     - it is possible to step back into the past between the states of the machine


You can see the ribbon next to the action buttons on the right side.
The writer/reader head stops at the selected character with a red background
(In the case of a finite automaton, the marked letter is read).

We can also follow exactly where we are on the graphic representation,
it always marks the correct state with a thick red line.


In the case of a Turing machine, the tape automatically expands when the read-write head moves to the right.

If our machine is not deterministic, it is possible to decide,
which direction to choose from among the options. This is done by clicking on the appropriate transition
we can do it.

It is possible to view previous states during the run,
so if, for example, we want to look at another branch of a non-deterministic decision,
then we can go back to a previous decision and make a different choice, and then move on with this new decision.
`;


interface ExpressionProps {

}

export const Help: React.FC<ExpressionProps> = (props) => {
    useEffect(() => {
        let s = document.getElementsByTagName("table");

        for (let i = 0; i < s.length; i++) {
            s.item(i)!.className = "table";
        }
    });


    return (

        <div>
            <button type="button" className="btn btn-sm btn-secondary" data-bs-toggle="modal"
                    data-bs-target="#exampleModal">
                ?
            </button>

            <div className="modal fade modal-xl" id="exampleModal" aria-labelledby="exampleModalLabel"
                 aria-hidden="true">
                <div className="modal-dialog modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="exampleModalLabel">Description</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"
                                    aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{data}</ReactMarkdown>
                            <script>


                            </script>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>)
}
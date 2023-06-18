# Machines
On this website you can define various mathematical machines and formal grammars,
simulate, perform and visualise operations on them. The programme is available on the BME website Languages and Automata.
([note](http://www.cs.bme.hu/~friedl/nyau/jegyzet-13.pdf)).

When the page is opened, there is a list on the left where you can edit the list item.
You can insert a new item after the one you are currently editing by typing `alt` + `enter`.

You can also define your own descriptive text or use the `Add Expression' menu that appears to load an example.
You can create several types of descriptive text:
- Finite automaton
- Pushdown machine
- Turing machine
- Formal grammar
- Expression

Click on `x` to remove items from the list, click on the convert button (rotating arrow) to convert the expression into a machine.

On the right you can see the graphical representation of our machine and the corresponding transition table.
On this screen we have the possibility to simulate.


## Finite automaton
Let us examine the code of the following finite automaton:
````yaml
FiniteAutomaton:
  name: M1
  charset: a, b
  states: S, K, A-B, R
  init: S
  accept: R
  transitions:
    - S . S
    - S $ K
    - K a A
    - A b B
    - B a R
    - R . R
````
Using YAML syntax, use `name` to specify the name of the finite automaton, and `charset` to specify the input charset. With `states`, we specify the states,
the initial state in `init`, the accepting states in `accept`, and finally in `transitions`
the transitions:
```
[previous state] [input character] [new state]
```
In place of any `[]` you can use `.`, which the program will insert in the background with all the options
(for state, all states, for the charset, all possible characters). For example, `R . R` means that the
`R` means that any character in the state `R` will result in the state `R`.

We may use the `&` character in `[new state]` if we have used `.` in `[previous state]`, in which case
the `[new state]` is always the same as `[previous state]`.


## Pushdown automaton
``yaml
PushdownAutomaton:
name: M1
charset: a, b
states: A-C
init: A
accept: B
transitions:
- A a a/b B
- B b b/a C
```
Using the YAML syntax, use `name` to specify the name of the stack automaton, and `charset` to specify the input charset. With `states`, we specify the states,
the initial state in `init`, the accepting states in `accept`, and finally in `transitions`
the transitions:
```
[previous state] [readed character] [read from stack]/[write to stack] [new state]
```
You can use `.` in place of any `[]`, which the program will insert in the background with all the options
(all states for state and all possible characters for charset). 

You can use the `&` character in `[new state]` if you used `.` in `[previous state]`, then

the `[new state]` is always the same as `[previous state]`. The same works for `[read from stack]` and `[write to stack]`.


## Turing machine
```yaml
TuringMachine:
  name: palindrom
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
```
Using the YAML syntax, use `name` to specify the name of the Turing machine, and `charset` to specify the tape charset. With `states`, we specify the states,
the initial state in `init`, the accepting states in `accept`, and finally in `transitions`
the transitions:
```
[previous state] [read character]/[write character] [head movement] [new state] [new state]
```
We can use `.` in place of any `[]`, which the program will insert in the background with all the options
(all states for state, all possible characters for charset, all directions for head movement).
When moving the head, `>` means move right, `<` means move left, and finally `=` means leave in place.

You may use the `&` character for `[new state]` if you have used `.` for `[previous state]`, then
the `[new state]` is always the same as `[previous state]`. The same works for `[read character]` and `[write character]`.

The `_` character is by default part of the `charset` of the tape, meaning the empty character.


## Expression
You can also specify an expression that can be used to create a new machine by referring to previous machines.
For example, a finite automaton can be minimized or made deterministic.

We can use the following syntax:
```
M3 = union(M1, M2)
```

In this case, we create a new finite automaton from the union of the finite automata M1 and M2.
From this we get a new finite automaton and we can use it in another list element called M3.


| Available functions                                    | Description |
|:-------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| *min(`FinalStateMachine`)*                             | creates a minimized Finite State Machine |
| *det(`FinalStateMachine`)*                             | creates a determinized finite state machine from the previous one |
| *union(`FinalStateMachine`, `FinalStateMachine`)*      | returns the union of two finite automata |
| *difference(`FinalStateMachine`, `FinalStateMachine`)* | returns the difference of two Finite automata |
| *intersect(`FinalStateMachine`, `FinalStateMachine`)*  | returns the intersection of two finite automata |
| *available(`FinalStateMachine`)*                       | defines a new automaton, built from the available states of the previous finite automaton |
| *complement(`FinalStateMachine`)*                      | returns an automaton accepting the complementary language of the original finite state machine |
| *epsfree(`FinalStateMachine`)*                         | returns a finite state machine free of epilon transitions |
| *concat(`FinalStateMachine`)*                          | assigns to two Finite automata an automaton whose grammar is the concatenate of the grammars of the two input Finite automata |
| *close(`FinalStateMachine`)*                           | returns the automaton associated with the transitive closure of the language |
| *clean(`FinalStateMachine`)*                           | takes all states and renames the states by going through the capital letters A, B, C, thus simplifying long state names |


## Expression from finite automaton
Given a code for an `M1` automaton for our program in the first list item,
and an expression for it, e.g. `M_2 = min(det(epsfree(M1)))` in the second.
Then we have the possibility to click on the rotating arrow in the upper right corner of the second list element
to convert the expression into the language describing the machine.

For example, let `M1` be a finite automaton:
```yaml
FinalStateMachine:
name: M1
charset: a, b
states: S, K, A-B, R
init: S
accept: R
transitions:
  - S . S
  - S $ K
  - K a A
  - A b B
  - B a R
  - R . R
```
And the expression:
```
M2=det(epsfree(M1))
```
Click on convert button to get the desired result:
```yaml
FinalStateMachine:
name: detefM1
charset: a, b
states: S, AS, BS, ARS, BRS, RS
init: S
accept: ARS, BRS, RS
transitions:
  - S a AS
  - S b S
  - AS a AS
  - AS b BS
  - BS a ARS
  - BS b S
  - ARS a ARS
  - ARS b BRS
  - BRS a ARS
  - BRS b RS
  - RS a ARS
  - RS b RS
```

## Simulation
The program supports simulation for each machine,
to see what is happening on the machine for a given input.

At the bottom of the page you can perform three actions:
- restart: stops running and returns to the original state
- run: runs the whole simulation and stops at the final state
- step:
    - in the deterministic case, we can step the machine to the next state by choosing the following single transition
    - in the non-deterministic case, we can choose which transition we want to move on to
    - it is possible to step backwards in time between the states of the machine


You can see the ribbon next to the action buttons on the right.
The scanner head is at the selected character with the red background
(In the case of a finite automaton, the marked letter is being read).

You can also follow where you are in the graphical representation,
the corresponding state is always indicated by a bold red line.

In the case of a Turing machine, the tape automatically expands when you move to the right of the scanner reading head.

If our machine is not deterministic, there is a choice,
which direction to choose among the options. You can do this by clicking on the appropriate transition.

It is possible to view previous states during the run,
for example, if you want to look at a different branch of a non-deterministic decision,
you can go back to a previous decision and make a different choice, and then continue with that new decision.


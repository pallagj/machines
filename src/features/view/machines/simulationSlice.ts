import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../../../app/store';
import {IMachine, MachineState} from "../../../logic/IMachine";


export interface HistoryState {
    numberOfTapes: number,
    currentIndex: number,
    history: MachineState[]
}

const initialState: HistoryState = {
    numberOfTapes: -1, currentIndex: -1, history: []
};

export const simulationSlice = createSlice({
    name: 'simulation', initialState, // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        initSimulation: (state, action: PayloadAction<IMachine>) => {
            let m = action.payload;
            m.reset();

            return {
                numberOfTapes: m.getNumberOfTape(), currentIndex: 0, history: [m.getSimulationState()]
            }
        }, selectHistory: (state, action: PayloadAction<number>) => {
            state.currentIndex = action.payload
        }, runSimulation: (state, action: PayloadAction<IMachine>) => {
            let m = action.payload;
            if(m.getMachineState() !== "working") return;
            m.run();

            state.history = state.history.slice(0, state.currentIndex + 1)
            state.currentIndex++;
            state.history.push(m.getSimulationState())
        }, nextSimulation: (state, action: PayloadAction<{ machine: IMachine, char: string }>) => {
            let m = action.payload.machine;
            let c = action.payload.char;

            if(m.getMachineState() !== "working") return;
            m.nextState(c)

            state.history = state.history.slice(0, state.currentIndex + 1)
            state.currentIndex++;
            state.history.push(m.getSimulationState())
        }, setTape: (state, action: PayloadAction<{ tapeIndex: number, value: string }>) => {
            if (state.history.length > 0) {
                state.history[state.currentIndex].tapes[action.payload.tapeIndex] = action.payload.value
                state.history = state.history.slice(0, state.currentIndex + 1)
            }
        },
    }
});

export const {
    setTape,
    initSimulation,
    selectHistory,
    runSimulation,
    nextSimulation
} = simulationSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectHistoryLabels = (state: RootState) => state.simulationStore.history.map((h, i): {
    current: boolean, label: string
} => {
    return {
        label: h.label, current: i === state.simulationStore.currentIndex
    }
});
export const selectCurrentHistory = (state: RootState) => state.simulationStore.history.length === 0 ? null : state.simulationStore.history[state.simulationStore.currentIndex];
export const selectCurrentTapes = (state: RootState) => state.simulationStore.history.length === 0 ? [] : state.simulationStore.history[state.simulationStore.currentIndex].tapes;
//make every tape same 10 length, if it shorter than 10, add "_" to the end, and if it longer than 10, cut it
export const selectCurrentTapesFormatted = (state: RootState) => state.simulationStore.history.length === 0 ? [] : state.simulationStore.history[state.simulationStore.currentIndex].tapes.map((t) => {
    if (t.length <= 10) {
        return t.padEnd(10, " ");
    }
    return t;
})

export default simulationSlice.reducer;

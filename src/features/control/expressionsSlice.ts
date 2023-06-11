import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../../app/store';
import {loadExamples} from "../../logic/loaders/ExamplesLoader";

export interface ExpressionsState {
    focusedExpressionIndex: number,
    focusNeeded: boolean,
    expressions: string[]
    darkMode: boolean,
    altEnter: boolean
}

const initialState: ExpressionsState = {
    focusedExpressionIndex: 0, focusNeeded: false, expressions: [""], darkMode: false, altEnter: true
};

export const expressionsSlice = createSlice({
    name: 'expressions', initialState, // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        setFocusNeeded: (state, action: PayloadAction<boolean>) => {
            state.focusNeeded = action.payload;
        }, setSelectedExpression: (state, action: PayloadAction<string>) => {
            state.expressions[state.focusedExpressionIndex] = action.payload;
        }, setSelectedEmptyExpression: (state, action: PayloadAction<string>) => {
            if (state.expressions[state.focusedExpressionIndex].trim() === "") {
                state.expressions[state.focusedExpressionIndex] = action.payload;
            } else {
                state.expressions.splice(state.focusedExpressionIndex + 1, 0, action.payload);
                state.focusedExpressionIndex++;
                state.focusNeeded = true;
            }
        }, setFocusedExpressionIndex: (state, action: PayloadAction<number>) => {
            state.focusedExpressionIndex = action.payload;
            state.focusNeeded = true;
        }, setExpression: (state, action: PayloadAction<{ index: number, expression: string }>) => {
            state.expressions[action.payload.index] = action.payload.expression;
        }, addExpressionAfterIndex: (state, action: PayloadAction<number>) => {
            state.expressions.splice(action.payload + 1, 0, "");
            state.focusedExpressionIndex = action.payload + 1;
            state.altEnter = false;
            state.focusNeeded = true;
        }, setExampleExpressionAt: (state, action: PayloadAction<number>) => {
            let index = action.payload;
            let name = state.expressions[index].replace(/\n*$/, "");

            let examples = loadExamples()
            if (examples?.has(name)) {
                state.expressions[index] = examples?.get(name)?.entries().next().value[1];
                //Replace enter at the end to empty
                state.expressions[index] = state.expressions[index].replace(/\n*$/, "");
                //print
                console.log(state.expressions[index])
            }
        }, setDarkMode: (state, action: PayloadAction<boolean>) => {
            state.darkMode = action.payload
        }, removeExpression: (state, action: PayloadAction<number>) => {
            if (state.expressions.length <= 1) {
                state.expressions[0] = "";
                state.focusNeeded = true;
                state.focusedExpressionIndex = 0;
                return;
            }

            let index = action.payload;
            state.expressions.splice(index, 1);
            state.focusedExpressionIndex--;
            state.focusNeeded = true;

        }, selectNextExpression: (state) => {
            state.focusedExpressionIndex = Math.min(state.focusedExpressionIndex + 1, state.expressions.length - 1);
            state.focusNeeded = true;
        }, selectPreviousExpression: (state) => {
            state.focusedExpressionIndex = Math.max(state.focusedExpressionIndex - 1, 0);
            state.focusNeeded = true;
        }, setAltEnter: (state) => {
            state.altEnter = false;
        }
    }
});

export const {
    setDarkMode,
    setExpression,
    addExpressionAfterIndex,
    setExampleExpressionAt,
    removeExpression,
    setFocusedExpressionIndex,
    setSelectedExpression,
    setSelectedEmptyExpression,
    selectNextExpression,
    selectPreviousExpression,
    setFocusNeeded,
    setAltEnter
} = expressionsSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectDarkMode = (state: RootState) => state.expressionsStore.darkMode;
export const selectExpressions = (state: RootState) => state.expressionsStore.expressions;
export const selectFocusedExpressionIndex = (state: RootState) => state.expressionsStore.focusedExpressionIndex;
export const selectFocusedExpression = (state: RootState) => state.expressionsStore.expressions[state.expressionsStore.focusedExpressionIndex];
export const selectFocusNeeded = (state: RootState) => state.expressionsStore.focusNeeded;
export const selectAltEnter = (state: RootState) => state.expressionsStore.altEnter;
export default expressionsSlice.reducer;

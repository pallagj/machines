import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../../app/store';
export interface ExpressionsState {
    focusedExpressionIndex: number,
    focusNeeded: boolean,
    expressions: string[]
    darkMode: boolean
}

const initialState: ExpressionsState = {
    focusedExpressionIndex: 0,
    focusNeeded: false,
    expressions: [""],
    darkMode: false
};

export const expressionsSlice = createSlice({
    name: 'expressions',
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        setFocusNeeded: (state, action: PayloadAction<boolean>) => {
            state.focusNeeded = action.payload;
        },
        setSelectedExpression: (state, action: PayloadAction<string>) => {
            state.expressions[state.focusedExpressionIndex] = action.payload;
        },
        setFocusedExpressionIndex: (state, action: PayloadAction<number>) => {
            state.focusedExpressionIndex = action.payload;
            state.focusNeeded = true;
        },
        setExpression: (state, action: PayloadAction<{index:number, expression: string}>) => {
            state.expressions[action.payload.index] = action.payload.expression;
        },
        addExpressionAfterIndex: (state, action: PayloadAction<number>) => {
            state.expressions.splice(action.payload+1, 0, "");
            state.focusedExpressionIndex = action.payload + 1;
            state.focusNeeded = true;
        },
        setDarkMode: (state, action: PayloadAction<boolean>) => {
            state.darkMode = action.payload
        },
        removeExpression: (state, action: PayloadAction<number>) => {
            if(state.expressions.length <= 1) {
                state.expressions[0] = "";
                return;
            }

            let index = action.payload;
            state.expressions.splice(index, 1);
            state.focusNeeded = false;
        },
        selectNextExpression: (state) => {
            state.focusedExpressionIndex = Math.min(state.focusedExpressionIndex + 1, state.expressions.length - 1);
            state.focusNeeded = true;
        },
        selectPreviousExpression: (state) => {
            state.focusedExpressionIndex = Math.max(state.focusedExpressionIndex - 1, 0);
            state.focusNeeded = true;
        }
    }
});

export const {
    setDarkMode,
    setExpression,
    addExpressionAfterIndex,
    removeExpression,
    setFocusedExpressionIndex,
    setSelectedExpression,
    selectNextExpression,
    selectPreviousExpression,
    setFocusNeeded
} = expressionsSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectDarkMode = (state: RootState) => state.expressionsStore.darkMode;
export const selectExpressions = (state: RootState) => state.expressionsStore.expressions;
export const selectFocusedExpressionIndex = (state: RootState) => state.expressionsStore.focusedExpressionIndex;
export const selectFocusedExpression = (state: RootState) => state.expressionsStore.expressions[state.expressionsStore.focusedExpressionIndex];
export const selectFocusNeeded = (state: RootState) => state.expressionsStore.focusNeeded;
export default expressionsSlice.reducer;

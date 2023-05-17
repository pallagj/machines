import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import expressionsReducer from '../features/control/expressionsSlice';

export const store = configureStore({
  reducer: {
    expressionsStore: expressionsReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

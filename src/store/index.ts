import { combineReducers, configureStore } from '@reduxjs/toolkit';
import contactsReducer from './contactsSlice';

export const rootReducer = combineReducers({
    contacts: contactsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export const makeStore = (preloadedState?: Partial<RootState>) =>
    configureStore({
        reducer: rootReducer,
        preloadedState,
    });

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];

export interface ThunkConfig {
    state: RootState;
    rejectValue: string;
}
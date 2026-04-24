import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import jobsReducer from "./jobsSlice";
import candidatesReducer from "./candidatesSlice";
import resultsReducer from "./resultsSlice";

export const store = configureStore({
    reducer: {
        jobs: jobsReducer,
        candidates: candidatesReducer,
        results: resultsReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types for serialization checks
                ignoredActions: ["jobs/fetchJobs/fulfilled", "candidates/fetchCandidates/fulfilled"],
            },
        }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export typed hooks for use throughout the app
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

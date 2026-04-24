# Redux Toolkit Implementation Documentation

## Overview

This application now uses **Redux Toolkit** for centralized state management across all major features, meeting 100% of the frontend requirements.

## Architecture

### Store Structure

```
src/store/
├── index.ts              # Store configuration and typed hooks
├── jobsSlice.ts          # Jobs state management
├── candidatesSlice.ts    # Candidates state management
└── resultsSlice.ts       # Screening results state management
```

### State Slices

#### 1. **Jobs Slice** (`jobsSlice.ts`)

**State:**
```typescript
{
  jobs: Job[],
  selectedJobId: string | null,
  loading: boolean,
  error: string | null
}
```

**Actions:**
- `fetchJobs` - Async thunk to fetch all jobs for a user
- `createJob` - Async thunk to create a new job
- `deleteJob` - Async thunk to delete a job and related data
- `setSelectedJob` - Sync action to set the currently selected job
- `clearJobsError` - Sync action to clear error state

**Usage Example:**
```typescript
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchJobs, createJob } from "@/store/jobsSlice";

const { jobs, loading, selectedJobId } = useAppSelector((state) => state.jobs);
const dispatch = useAppDispatch();

// Fetch jobs
dispatch(fetchJobs(userId));

// Create job
dispatch(createJob(jobData)).unwrap();
```

#### 2. **Candidates Slice** (`candidatesSlice.ts`)

**State:**
```typescript
{
  candidates: Candidate[],
  loading: boolean,
  error: string | null,
  uploadProgress: number
}
```

**Actions:**
- `fetchCandidates` - Async thunk to fetch candidates for a job
- `addCandidate` - Async thunk to add a single candidate
- `uploadCandidatesCSV` - Async thunk to bulk upload candidates
- `clearCandidates` - Sync action to clear candidates
- `setUploadProgress` - Sync action to track upload progress

**Usage Example:**
```typescript
import { fetchCandidates, addCandidate } from "@/store/candidatesSlice";

const { candidates, loading } = useAppSelector((state) => state.candidates);

// Fetch candidates
dispatch(fetchCandidates({ userId, jobId }));

// Add candidate
dispatch(addCandidate(candidateData)).unwrap();
```

#### 3. **Results Slice** (`resultsSlice.ts`)

**State:**
```typescript
{
  results: ScreeningResult[],
  loading: boolean,
  error: string | null,
  screening: boolean,
  sortBy: "score" | "culture",
  biasMode: boolean
}
```

**Actions:**
- `fetchResults` - Async thunk to fetch screening results
- `screenCandidates` - Async thunk to run AI screening
- `setSortBy` - Sync action to change sort order
- `setBiasMode` - Sync action to toggle bias reduction mode
- `clearResults` - Sync action to clear results

**Usage Example:**
```typescript
import { fetchResults, screenCandidates, setBiasMode } from "@/store/resultsSlice";

const { results, screening, biasMode } = useAppSelector((state) => state.results);

// Fetch results
dispatch(fetchResults({ userId, jobId, candidates }));

// Run screening
dispatch(screenCandidates({ jobId, userId, job, candidates, weights }));

// Toggle bias mode
dispatch(setBiasMode(true));
```

## Integration Points

### 1. **App.tsx**
Redux Provider wraps the entire application:
```typescript
import { Provider } from "react-redux";
import { store } from "@/store";

<Provider store={store}>
  <QueryClientProvider client={queryClient}>
    {/* App content */}
  </QueryClientProvider>
</Provider>
```

### 2. **Dashboard.tsx**
- Uses `fetchJobs` to load jobs
- Uses `deleteJob` for job deletion
- Displays job statistics from Redux state

### 3. **CreateJob.tsx**
- Uses `createJob` to create new jobs
- Handles loading state from Redux
- Navigates to dashboard on success

### 4. **Candidates.tsx**
- Uses `fetchJobs` and `fetchCandidates`
- Uses `setSelectedJob` for job selection
- Uses `addCandidate` and `uploadCandidatesCSV` for data ingestion
- Syncs with URL parameters

### 5. **Results.tsx**
- Uses all three slices (jobs, candidates, results)
- Uses `screenCandidates` for AI screening
- Uses `setSortBy` and `setBiasMode` for UI controls
- Displays ranked results from Redux state

## Typed Hooks

Custom typed hooks are exported from `src/store/index.ts`:

```typescript
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

**Always use these instead of the default hooks:**
- ✅ `useAppDispatch()` instead of `useDispatch()`
- ✅ `useAppSelector()` instead of `useSelector()`

This provides full TypeScript autocomplete and type safety.

## Error Handling

All async thunks use `rejectWithValue` for consistent error handling:

```typescript
try {
  // API call
} catch (error: any) {
  return rejectWithValue(error.message);
}
```

Errors are stored in slice state and can be displayed to users:

```typescript
const { error } = useAppSelector((state) => state.jobs);
if (error) {
  toast.error(error);
}
```

## Loading States

Each slice manages its own loading state:

```typescript
const { loading } = useAppSelector((state) => state.jobs);

<Button disabled={loading}>
  {loading && <Loader2 className="animate-spin" />}
  Create Job
</Button>
```

## Benefits of This Implementation

1. **Centralized State** - All application state in one predictable location
2. **Type Safety** - Full TypeScript support with typed hooks
3. **DevTools** - Redux DevTools for debugging state changes
4. **Async Handling** - Built-in async thunk support
5. **Immutability** - Immer integration for safe state updates
6. **Scalability** - Easy to add new slices and actions
7. **Testing** - Redux state is easily testable
8. **Performance** - Optimized re-renders with selector memoization

## Compliance with Requirements

✅ **Redux Toolkit** - Fully implemented  
✅ **Jobs State Management** - jobsSlice.ts  
✅ **Applicants State Management** - candidatesSlice.ts  
✅ **AI Results State Management** - resultsSlice.ts  
✅ **Loading/Error States** - All slices include loading and error handling  
✅ **TypeScript** - Full type safety throughout  
✅ **Async Operations** - createAsyncThunk for all API calls  

## Future Enhancements

Potential improvements for production:
- Add Redux Persist for state persistence
- Implement optimistic updates
- Add request caching with RTK Query
- Implement undo/redo functionality
- Add state normalization for large datasets

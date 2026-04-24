# Redux Quick Reference Guide

## 📦 Installation Confirmed
```
@reduxjs/toolkit@2.11.2 ✅
react-redux@9.2.0 ✅
```

## 🎯 Quick Usage Examples

### 1. Import Hooks
```typescript
import { useAppDispatch, useAppSelector } from "@/store";
```

### 2. Read State
```typescript
// Jobs
const { jobs, loading, selectedJobId } = useAppSelector((state) => state.jobs);

// Candidates
const { candidates, loading } = useAppSelector((state) => state.candidates);

// Results
const { results, screening, sortBy, biasMode } = useAppSelector((state) => state.results);
```

### 3. Dispatch Actions
```typescript
const dispatch = useAppDispatch();

// Fetch data
dispatch(fetchJobs(userId));
dispatch(fetchCandidates({ userId, jobId }));
dispatch(fetchResults({ userId, jobId, candidates }));

// Create/Update
dispatch(createJob(jobData));
dispatch(addCandidate(candidateData));
dispatch(screenCandidates({ jobId, userId, job, candidates, weights }));

// UI State
dispatch(setSelectedJob(jobId));
dispatch(setSortBy("score"));
dispatch(setBiasMode(true));
```

### 4. Handle Async with Error Handling
```typescript
try {
  await dispatch(createJob(jobData)).unwrap();
  toast.success("Success!");
  navigate("/dashboard");
} catch (error) {
  toast.error(error || "Failed");
}
```

## 📁 File Locations

```
src/
├── store/
│   ├── index.ts              ← Store config & typed hooks
│   ├── jobsSlice.ts          ← Jobs state
│   ├── candidatesSlice.ts    ← Candidates state
│   └── resultsSlice.ts       ← Results state
├── App.tsx                   ← Redux Provider
└── pages/
    ├── Dashboard.tsx         ← Uses jobsSlice
    ├── CreateJob.tsx         ← Uses jobsSlice
    ├── Candidates.tsx        ← Uses jobs + candidates
    └── Results.tsx           ← Uses all three slices
```

## 🔄 State Flow

```
User Action
    ↓
Component dispatches action
    ↓
Redux Thunk (async)
    ↓
API Call (Supabase)
    ↓
Redux updates state
    ↓
Component re-renders with new data
```

## 🎨 Common Patterns

### Pattern 1: Fetch on Mount
```typescript
useEffect(() => {
  if (user) {
    dispatch(fetchJobs(user.id));
  }
}, [user, dispatch]);
```

### Pattern 2: Conditional Rendering
```typescript
const { loading, error } = useAppSelector((state) => state.jobs);

if (loading) return <Loader />;
if (error) return <Error message={error} />;
return <JobsList jobs={jobs} />;
```

### Pattern 3: Form Submission
```typescript
const handleSubmit = async (data) => {
  try {
    await dispatch(createJob(data)).unwrap();
    toast.success("Created!");
  } catch (err) {
    toast.error(err);
  }
};
```

## 🐛 Debugging

### Redux DevTools
1. Install Redux DevTools browser extension
2. Open DevTools → Redux tab
3. See all actions and state changes
4. Time-travel debugging available

### Console Logging
```typescript
const state = useAppSelector((state) => state);
console.log("Full Redux State:", state);
```

## ⚡ Performance Tips

1. **Selective Subscriptions** - Only select what you need
```typescript
// ❌ Bad - subscribes to entire state
const state = useAppSelector((state) => state);

// ✅ Good - only subscribes to jobs
const jobs = useAppSelector((state) => state.jobs.jobs);
```

2. **Memoized Selectors** - Use useMemo for derived data
```typescript
const sortedJobs = useMemo(() => 
  [...jobs].sort((a, b) => a.title.localeCompare(b.title)),
  [jobs]
);
```

3. **Avoid Unnecessary Dispatches** - Check before dispatching
```typescript
if (!selectedJobId && jobs.length > 0) {
  dispatch(setSelectedJob(jobs[0].id));
}
```

## 📚 Learn More

- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [React Redux Hooks](https://react-redux.js.org/api/hooks)
- [REDUX_IMPLEMENTATION.md](./REDUX_IMPLEMENTATION.md) - Full documentation
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Complete summary

## ✅ Checklist for New Features

When adding a new feature:

- [ ] Create slice in `src/store/`
- [ ] Add to store in `src/store/index.ts`
- [ ] Define TypeScript interfaces
- [ ] Create async thunks for API calls
- [ ] Add reducers for sync actions
- [ ] Use `useAppSelector` to read state
- [ ] Use `useAppDispatch` to update state
- [ ] Handle loading and error states
- [ ] Test with Redux DevTools

---

**Quick Start:** Import hooks → Select state → Dispatch actions → Profit! 🚀

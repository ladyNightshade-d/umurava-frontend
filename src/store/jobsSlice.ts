import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const getToken = () => typeof window !== "undefined" ? localStorage.getItem('token') : null;

export interface Job {
    _id: string;
    id: string;
    title: string;
    department: string;
    description: string;
    skills: string[];
    experience: string;
    education: string;
    createdBy: string;
    createdAt: string;
}

interface JobsState {
    jobs: Job[];
    selectedJobId: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: JobsState = {
    jobs: [],
    selectedJobId: null,
    loading: false,
    error: null,
};

export const fetchJobs = createAsyncThunk(
    "jobs/fetchJobs",
    async (_userId: string, { rejectWithValue }) => {
        try {
            const res = await fetch(`${BASE_URL}/jobs`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            return data as Job[];
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const createJob = createAsyncThunk(
    "jobs/createJob",
    async (jobData: any, { rejectWithValue }) => {
        try {
            const res = await fetch(`${BASE_URL}/jobs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`
                },
                body: JSON.stringify(jobData)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            return data as Job;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteJob = createAsyncThunk(
    "jobs/deleteJob",
    async ({ jobId }: { jobId: string; userId: string }, { rejectWithValue }) => {
        try {
            const res = await fetch(`${BASE_URL}/jobs/${jobId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message);
            }
            return jobId;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const jobsSlice = createSlice({
    name: "jobs",
    initialState,
    reducers: {
        setSelectedJob: (state, action: PayloadAction<string | null>) => {
            state.selectedJobId = action.payload;
        },
        clearJobsError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchJobs.pending, (state) => { state.loading = true; state.error = null; });
        builder.addCase(fetchJobs.fulfilled, (state, action) => {
            state.loading = false;
            state.jobs = action.payload;
            if (!state.selectedJobId && action.payload.length > 0) {
                state.selectedJobId = action.payload[0]._id;
            }
        });
        builder.addCase(fetchJobs.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

        builder.addCase(createJob.pending, (state) => { state.loading = true; state.error = null; });
        builder.addCase(createJob.fulfilled, (state, action) => {
            state.loading = false;
            state.jobs.unshift(action.payload);
            state.selectedJobId = action.payload._id;
        });
        builder.addCase(createJob.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

        builder.addCase(deleteJob.pending, (state) => { state.loading = true; state.error = null; });
        builder.addCase(deleteJob.fulfilled, (state, action) => {
            state.loading = false;
            state.jobs = state.jobs.filter((job) => job._id !== action.payload);
            if (state.selectedJobId === action.payload) {
                state.selectedJobId = state.jobs.length > 0 ? state.jobs[0]._id : null;
            }
        });
        builder.addCase(deleteJob.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
    },
});

export const { setSelectedJob, clearJobsError } = jobsSlice.actions;
export default jobsSlice.reducer;
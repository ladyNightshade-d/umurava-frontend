import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "@/src/lib/supabase";

export interface Job {
    id: string;
    user_id: string;
    title: string;
    department: string;
    description: string;
    required_skills: string[];
    experience_level: string;
    top_performer_profile: string;
    weight_skills: number;
    weight_experience: number;
    weight_culture: number;
    created_at: string;
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

// Async thunks
export const fetchJobs = createAsyncThunk(
    "jobs/fetchJobs",
    async (userId: string, { rejectWithValue }) => {
        try {
            const { data, error } = await supabase
                .from("jobs")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as Job[];
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const createJob = createAsyncThunk(
    "jobs/createJob",
    async (jobData: Omit<Job, "id" | "created_at">, { rejectWithValue }) => {
        try {
            const { data, error } = await supabase
                .from("jobs")
                .insert(jobData)
                .select()
                .single();

            if (error) throw error;
            return data as Job;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteJob = createAsyncThunk(
    "jobs/deleteJob",
    async ({ jobId, userId }: { jobId: string; userId: string }, { rejectWithValue }) => {
        try {
            // Delete related data first
            await Promise.all([
                supabase.from("screening_results").delete().eq("job_id", jobId).eq("user_id", userId),
                supabase.from("candidates").delete().eq("job_id", jobId).eq("user_id", userId),
            ]);

            const { error } = await supabase
                .from("jobs")
                .delete()
                .eq("id", jobId)
                .eq("user_id", userId);

            if (error) throw error;
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
        // Fetch jobs
        builder.addCase(fetchJobs.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchJobs.fulfilled, (state, action) => {
            state.loading = false;
            state.jobs = action.payload;
            // Auto-select first job if none selected
            if (!state.selectedJobId && action.payload.length > 0) {
                state.selectedJobId = action.payload[0].id;
            }
        });
        builder.addCase(fetchJobs.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Create job
        builder.addCase(createJob.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(createJob.fulfilled, (state, action) => {
            state.loading = false;
            state.jobs.unshift(action.payload);
            state.selectedJobId = action.payload.id;
        });
        builder.addCase(createJob.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Delete job
        builder.addCase(deleteJob.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(deleteJob.fulfilled, (state, action) => {
            state.loading = false;
            state.jobs = state.jobs.filter((job) => job.id !== action.payload);
            if (state.selectedJobId === action.payload) {
                state.selectedJobId = state.jobs.length > 0 ? state.jobs[0].id : null;
            }
        });
        builder.addCase(deleteJob.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    },
});

export const { setSelectedJob, clearJobsError } = jobsSlice.actions;
export default jobsSlice.reducer;

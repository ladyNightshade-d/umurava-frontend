import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "@/src/lib/supabase";

export interface Candidate {
    id: string;
    user_id: string;
    job_id: string;
    name: string;
    email: string;
    resume_text: string;
    skills: string[];
    created_at: string;
}

interface CandidatesState {
    candidates: Candidate[];
    loading: boolean;
    error: string | null;
    uploadProgress: number;
}

const initialState: CandidatesState = {
    candidates: [],
    loading: false,
    error: null,
    uploadProgress: 0,
};

// Async thunks
export const fetchCandidates = createAsyncThunk(
    "candidates/fetchCandidates",
    async ({ userId, jobId }: { userId: string; jobId: string }, { rejectWithValue }) => {
        try {
            const { data, error } = await supabase
                .from("candidates")
                .select("*")
                .eq("user_id", userId)
                .eq("job_id", jobId)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as Candidate[];
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const addCandidate = createAsyncThunk(
    "candidates/addCandidate",
    async (candidateData: Omit<Candidate, "id" | "created_at">, { rejectWithValue }) => {
        try {
            const { data, error } = await supabase
                .from("candidates")
                .insert(candidateData)
                .select()
                .single();

            if (error) throw error;
            return data as Candidate;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const uploadCandidatesCSV = createAsyncThunk(
    "candidates/uploadCSV",
    async (
        { candidates }: { candidates: Omit<Candidate, "id" | "created_at">[] },
        { rejectWithValue }
    ) => {
        try {
            const { data, error } = await supabase
                .from("candidates")
                .insert(candidates)
                .select();

            if (error) throw error;
            return data as Candidate[];
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const candidatesSlice = createSlice({
    name: "candidates",
    initialState,
    reducers: {
        clearCandidatesError: (state) => {
            state.error = null;
        },
        setUploadProgress: (state, action: PayloadAction<number>) => {
            state.uploadProgress = action.payload;
        },
        clearCandidates: (state) => {
            state.candidates = [];
        },
    },
    extraReducers: (builder) => {
        // Fetch candidates
        builder.addCase(fetchCandidates.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchCandidates.fulfilled, (state, action) => {
            state.loading = false;
            state.candidates = action.payload;
        });
        builder.addCase(fetchCandidates.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Add candidate
        builder.addCase(addCandidate.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(addCandidate.fulfilled, (state, action) => {
            state.loading = false;
            state.candidates.unshift(action.payload);
        });
        builder.addCase(addCandidate.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Upload CSV
        builder.addCase(uploadCandidatesCSV.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.uploadProgress = 0;
        });
        builder.addCase(uploadCandidatesCSV.fulfilled, (state, action) => {
            state.loading = false;
            state.candidates = [...action.payload, ...state.candidates];
            state.uploadProgress = 100;
        });
        builder.addCase(uploadCandidatesCSV.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
            state.uploadProgress = 0;
        });
    },
});

export const { clearCandidatesError, setUploadProgress, clearCandidates } = candidatesSlice.actions;
export default candidatesSlice.reducer;

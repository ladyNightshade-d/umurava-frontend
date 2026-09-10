import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const getToken = () => typeof window !== "undefined" ? localStorage.getItem('token') : null;

export interface Candidate {
    _id: string;
    id: string;
    name: string;
    email: string;
    skills: string[];
    experience: string;
    education: string;
    resumeUrl: string;
    jobId: string;
    score: number;
    rank: number;
    strengths: string[];
    gaps: string[];
    recommendation: string;
    status: string;
    createdAt: string;
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

export const fetchCandidates = createAsyncThunk(
    "candidates/fetchCandidates",
    async ({ jobId }: { userId: string; jobId: string }, { rejectWithValue }) => {
        try {
            const res = await fetch(`${BASE_URL}/jobs/${jobId}/applicants`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            return data.data as Candidate[];
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const addCandidate = createAsyncThunk(
    "candidates/addCandidate",
    async ({ jobId, ...candidateData }: any, { rejectWithValue }) => {
        try {
            const res = await fetch(`${BASE_URL}/jobs/${jobId}/applicants`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`
                },
                body: JSON.stringify({
                    name: candidateData.name,
                    email: candidateData.email,
                    skills: candidateData.skills,
                    experience: candidateData.resume_text || 'Not specified',
                    education: 'Not specified',
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            return data as Candidate;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const uploadCandidatesCSV = createAsyncThunk(
    "candidates/uploadCSV",
    async ({ jobId, file }: { candidates?: any[]; jobId: string; file: File }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch(`${BASE_URL}/jobs/${jobId}/applicants/upload-csv`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${getToken()}` },
                body: formData
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            return data;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const candidatesSlice = createSlice({
    name: "candidates",
    initialState,
    reducers: {
        clearCandidatesError: (state) => { state.error = null; },
        setUploadProgress: (state, action: PayloadAction<number>) => { state.uploadProgress = action.payload; },
        clearCandidates: (state) => { state.candidates = []; },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchCandidates.pending, (state) => { state.loading = true; state.error = null; });
        builder.addCase(fetchCandidates.fulfilled, (state, action) => { state.loading = false; state.candidates = action.payload; });
        builder.addCase(fetchCandidates.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

        builder.addCase(addCandidate.pending, (state) => { state.loading = true; state.error = null; });
        builder.addCase(addCandidate.fulfilled, (state, action) => { state.loading = false; state.candidates.unshift(action.payload); });
        builder.addCase(addCandidate.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

        builder.addCase(uploadCandidatesCSV.pending, (state) => { state.loading = true; state.error = null; state.uploadProgress = 0; });
        builder.addCase(uploadCandidatesCSV.fulfilled, (state) => { state.loading = false; state.uploadProgress = 100; });
        builder.addCase(uploadCandidatesCSV.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; state.uploadProgress = 0; });
    },
});

export const { clearCandidatesError, setUploadProgress, clearCandidates } = candidatesSlice.actions;
export default candidatesSlice.reducer;
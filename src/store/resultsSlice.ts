import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const getToken = () => typeof window !== "undefined" ? localStorage.getItem('token') : null;

export interface ScreeningResult {
    id: string;
    _id: string;
    candidate_id: string;
    job_id: string;
    final_score: number;
    strengths: string[];
    gaps: string[];
    culture_fit: string;
    skill_tags: string[];
    interview_questions: string[];
    recommendation: string;
    candidate?: any;
}

interface ResultsState {
    results: ScreeningResult[];
    loading: boolean;
    error: string | null;
    screening: boolean;
    sortBy: "score" | "culture";
    biasMode: boolean;
}

const initialState: ResultsState = {
    results: [],
    loading: false,
    error: null,
    screening: false,
    sortBy: "score",
    biasMode: false,
};

const getCultureFit = (score: number) => {
    if (score >= 70) return 'High';
    if (score >= 50) return 'Medium';
    return 'Low';
};

export const fetchResults = createAsyncThunk(
    "results/fetchResults",
    async ({ jobId }: { userId: string; jobId: string; candidates: any[] }, { rejectWithValue }) => {
        try {
            const res = await fetch(`${BASE_URL}/jobs/${jobId}/applicants/shortlist`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            return (data.data || []).map((a: any) => ({
                id: a._id,
                _id: a._id,
                candidate_id: a._id,
                job_id: jobId,
                final_score: a.score,
                strengths: a.strengths || [],
                gaps: a.gaps || [],
                culture_fit: getCultureFit(a.score),
                skill_tags: a.skills || [],
                interview_questions: [],
                recommendation: a.recommendation,
                candidate: { name: a.name, email: a.email }
            })) as ScreeningResult[];
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const screenCandidates = createAsyncThunk(
    "results/screenCandidates",
    async ({ jobId }: { jobId: string; userId: string; job: any; candidates: any[]; weights: any }, { rejectWithValue }) => {
        try {
            const res = await fetch(`${BASE_URL}/jobs/${jobId}/applicants/screen`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            const shortlistRes = await fetch(`${BASE_URL}/jobs/${jobId}/applicants/shortlist`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            const shortlistData = await shortlistRes.json();

            return (shortlistData.data || []).map((a: any) => ({
                id: a._id,
                _id: a._id,
                candidate_id: a._id,
                job_id: jobId,
                final_score: a.score,
                strengths: a.strengths || [],
                gaps: a.gaps || [],
                culture_fit: getCultureFit(a.score),
                skill_tags: a.skills || [],
                interview_questions: [],
                recommendation: a.recommendation,
                candidate: { name: a.name, email: a.email }
            })) as ScreeningResult[];
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const resultsSlice = createSlice({
    name: "results",
    initialState,
    reducers: {
        clearResultsError: (state) => { state.error = null; },
        setSortBy: (state, action: PayloadAction<"score" | "culture">) => { state.sortBy = action.payload; },
        setBiasMode: (state, action: PayloadAction<boolean>) => { state.biasMode = action.payload; },
        clearResults: (state) => { state.results = []; },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchResults.pending, (state) => { state.loading = true; state.error = null; });
        builder.addCase(fetchResults.fulfilled, (state, action) => { state.loading = false; state.results = action.payload; });
        builder.addCase(fetchResults.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

        builder.addCase(screenCandidates.pending, (state) => { state.screening = true; state.error = null; });
        builder.addCase(screenCandidates.fulfilled, (state, action) => { state.screening = false; state.results = action.payload; });
        builder.addCase(screenCandidates.rejected, (state, action) => { state.screening = false; state.error = action.payload as string; });
    },
});

export const { clearResultsError, setSortBy, setBiasMode, clearResults } = resultsSlice.actions;
export default resultsSlice.reducer;
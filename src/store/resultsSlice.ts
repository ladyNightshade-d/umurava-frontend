import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiFetch } from "@/src/lib/apiFetch";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const getToken = () => typeof window !== "undefined" ? localStorage.getItem('token') : null;

export interface ScreeningResult {
    id: string;
    _id: string;
    candidate_id: string;
    job_id: string;
    final_score: number;
    skill_score: number;
    experience_score: number;
    culture_score: number;
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
    weights: { skills: number; experience: number; culture: number };
}

const initialState: ResultsState = {
    results: [],
    loading: false,
    error: null,
    screening: false,
    sortBy: "score",
    biasMode: false,
    weights: { skills: 40, experience: 30, culture: 30 },
};

const getCultureFit = (score: number) => {
    if (score >= 70) return 'High';
    if (score >= 50) return 'Medium';
    return 'Low';
};

/**
 * Derives meaningful sub-scores from real API data instead of fake multipliers.
 * - skill_score: based on final_score (core metric)
 * - experience_score: penalised by number of gaps (more gaps = lower experience)
 * - culture_score: boosted by strengths count relative to gaps
 */
const deriveSubScores = (score: number, strengths: string[], gaps: string[]) => {
    const gapPenalty = Math.min(gaps.length * 5, 25);
    const strengthBonus = Math.min(strengths.length * 4, 20);

    const skill_score = Math.min(Math.round(score), 100);
    const experience_score = Math.min(Math.max(Math.round(score - gapPenalty), 0), 100);
    const culture_score = Math.min(Math.max(Math.round(score - 10 + strengthBonus), 0), 100);

    return { skill_score, experience_score, culture_score };
};

const mapApplicant = (a: any, jobId: string): ScreeningResult => {
    const strengths: string[] = a.strengths || [];
    const gaps: string[] = a.gaps || [];
    const { skill_score, experience_score, culture_score } = deriveSubScores(a.score ?? 0, strengths, gaps);

    return {
        id: a._id,
        _id: a._id,
        candidate_id: a._id,
        job_id: jobId,
        final_score: a.score ?? 0,
        skill_score,
        experience_score,
        culture_score,
        strengths,
        gaps,
        culture_fit: getCultureFit(a.score ?? 0),
        skill_tags: a.skills || [],
        interview_questions: a.interview_questions || [],
        recommendation: a.recommendation || "",
        candidate: { name: a.name, email: a.email },
    };
};

export const fetchResults = createAsyncThunk(
    "results/fetchResults",
    async ({ jobId }: { userId: string; jobId: string; candidates: any[] }, { rejectWithValue }) => {
        try {
            const res = await apiFetch(`${BASE_URL}/jobs/${jobId}/applicants/shortlist`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            return (data.data || []).map((a: any) => mapApplicant(a, jobId)) as ScreeningResult[];
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const screenCandidates = createAsyncThunk(
    "results/screenCandidates",
    async (
        { jobId, weights }: { jobId: string; userId: string; job: any; candidates: any[]; weights: { skills: number; experience: number; culture: number } },
        { rejectWithValue }
    ) => {
        try {
            const res = await apiFetch(`${BASE_URL}/jobs/${jobId}/applicants/screen`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ weights }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            const shortlistRes = await apiFetch(`${BASE_URL}/jobs/${jobId}/applicants/shortlist`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            const shortlistData = await shortlistRes.json();

            return (shortlistData.data || []).map((a: any) => mapApplicant(a, jobId)) as ScreeningResult[];
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
        setWeights: (state, action: PayloadAction<{ skills: number; experience: number; culture: number }>) => {
            state.weights = action.payload;
        },
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

export const { clearResultsError, setSortBy, setBiasMode, clearResults, setWeights } = resultsSlice.actions;
export default resultsSlice.reducer;

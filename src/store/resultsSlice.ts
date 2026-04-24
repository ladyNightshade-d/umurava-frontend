import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "@/src/lib/supabase";

export interface ScreeningResult {
    id: string;
    candidate_id: string;
    job_id: string;
    user_id: string;
    final_score: number;
    strengths: string[];
    gaps: string[];
    culture_fit: string;
    skill_tags: string[];
    interview_questions: string[];
    created_at: string;
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

// Async thunks
export const fetchResults = createAsyncThunk(
    "results/fetchResults",
    async (
        { userId, jobId, candidates }: { userId: string; jobId: string; candidates: any[] },
        { rejectWithValue }
    ) => {
        try {
            const { data, error } = await supabase
                .from("screening_results")
                .select("*")
                .eq("user_id", userId)
                .eq("job_id", jobId);

            if (error) throw error;

            // Merge with candidate data
            const merged = (data || []).map((result: any) => ({
                ...result,
                candidate: candidates.find((c) => c.id === result.candidate_id),
            }));

            return merged as ScreeningResult[];
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const screenCandidates = createAsyncThunk(
    "results/screenCandidates",
    async (
        {
            jobId,
            userId,
            job,
            candidates,
            weights,
        }: {
            jobId: string;
            userId: string;
            job: any;
            candidates: any[];
            weights: { skills: number; experience: number; culture: number };
        },
        { rejectWithValue }
    ) => {
        try {
            const { data, error } = await supabase.functions.invoke("screen-candidates", {
                body: {
                    job_id: jobId,
                    job_description: job.description,
                    required_skills: job.required_skills,
                    experience_level: job.experience_level,
                    top_performer_profile: job.top_performer_profile,
                    weight_skills: weights.skills,
                    weight_experience: weights.experience,
                    weight_culture: weights.culture,
                    candidates: candidates.map((c) => ({
                        id: c.id,
                        name: c.name,
                        resume_text: c.resume_text,
                        skills: c.skills,
                    })),
                },
            });

            if (error) throw error;
            if (data?.error) throw new Error(data.error);

            const resultsToInsert = (data.results || []).map((r: any) => ({
                candidate_id: r.candidate_id,
                job_id: jobId,
                user_id: userId,
                final_score: r.final_score,
                strengths: r.strengths,
                gaps: r.gaps,
                culture_fit: r.culture_fit,
                skill_tags: r.skill_tags,
                interview_questions: r.interview_questions,
            }));

            // Delete old results
            await supabase
                .from("screening_results")
                .delete()
                .eq("user_id", userId)
                .eq("job_id", jobId);

            // Insert new results
            const { data: insertedData, error: insertError } = await supabase
                .from("screening_results")
                .insert(resultsToInsert)
                .select();

            if (insertError) throw insertError;

            // Merge with candidate data
            const merged = (insertedData || []).map((result: any) => ({
                ...result,
                candidate: candidates.find((c) => c.id === result.candidate_id),
            }));

            return merged as ScreeningResult[];
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const resultsSlice = createSlice({
    name: "results",
    initialState,
    reducers: {
        clearResultsError: (state) => {
            state.error = null;
        },
        setSortBy: (state, action: PayloadAction<"score" | "culture">) => {
            state.sortBy = action.payload;
        },
        setBiasMode: (state, action: PayloadAction<boolean>) => {
            state.biasMode = action.payload;
        },
        clearResults: (state) => {
            state.results = [];
        },
    },
    extraReducers: (builder) => {
        // Fetch results
        builder.addCase(fetchResults.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchResults.fulfilled, (state, action) => {
            state.loading = false;
            state.results = action.payload;
        });
        builder.addCase(fetchResults.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Screen candidates
        builder.addCase(screenCandidates.pending, (state) => {
            state.screening = true;
            state.error = null;
        });
        builder.addCase(screenCandidates.fulfilled, (state, action) => {
            state.screening = false;
            state.results = action.payload;
        });
        builder.addCase(screenCandidates.rejected, (state, action) => {
            state.screening = false;
            state.error = action.payload as string;
        });
    },
});

export const { clearResultsError, setSortBy, setBiasMode, clearResults } = resultsSlice.actions;
export default resultsSlice.reducer;

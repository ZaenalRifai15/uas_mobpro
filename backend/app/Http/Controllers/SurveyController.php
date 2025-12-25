<?php

namespace App\Http\Controllers;

use App\Models\Survey;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class SurveyController extends Controller
{
    /**
     * Display a listing of surveys
     */
    public function index()
    {
        $surveys = Survey::with(['creator', 'questions', 'responses', 'analytics'])->get();
        return response()->json($surveys);
    }

    /**
     * Store a newly created survey
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'created_by' => 'required|exists:users,id',
            'is_active' => 'sometimes|boolean',
        ]);

        $survey = Survey::create($validated);

        return response()->json($survey, 201);
    }

    /**
     * Display the specified survey
     */
    public function show(Survey $survey)
    {
        $survey->load(['creator', 'questions', 'responses', 'analytics']);
        return response()->json($survey);
    }

    /**
     * Update the specified survey
     */
    public function update(Request $request, Survey $survey)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        $survey->update($validated);

        return response()->json($survey);
    }

    /**
     * Remove the specified survey
     */
    public function destroy(Survey $survey)
    {
        try {
            Log::info('Starting survey deletion', ['survey_id' => $survey->id, 'title' => $survey->title]);
            
            // Explicitly delete related records to ensure cascade works
            // Delete analytics first
            if ($survey->analytics) {
                Log::info('Deleting analytics', ['survey_id' => $survey->id]);
                $survey->analytics()->delete();
            }
            
            // Delete all responses and their answers
            $responsesCount = $survey->responses->count();
            Log::info('Deleting responses', ['survey_id' => $survey->id, 'count' => $responsesCount]);
            
            foreach ($survey->responses as $response) {
                $answersCount = $response->answers->count();
                $response->answers()->delete();
                Log::info('Deleted answers for response', ['response_id' => $response->id, 'answers_count' => $answersCount]);
                $response->delete();
            }
            
            // Delete all questions and their answers
            $questionsCount = $survey->questions->count();
            Log::info('Deleting questions', ['survey_id' => $survey->id, 'count' => $questionsCount]);
            
            foreach ($survey->questions as $question) {
                $question->answers()->delete();
                $question->delete();
            }
            
            // Finally delete the survey
            $survey->delete();
            Log::info('Survey deleted successfully', ['survey_id' => $survey->id]);
            
            return response()->json([
                'success' => true,
                'message' => 'Survey deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Failed to delete survey', [
                'survey_id' => $survey->id ?? 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete survey',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

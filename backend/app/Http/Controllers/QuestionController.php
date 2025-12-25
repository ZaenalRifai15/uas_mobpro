<?php

namespace App\Http\Controllers;

use App\Models\Question;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    /**
     * Display a listing of questions
     */
    public function index()
    {
        $questions = Question::with(['survey', 'answers'])->get();
        return response()->json($questions);
    }

    /**
     * Store a newly created question
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'survey_id' => 'required|exists:surveys,id',
            'question_text' => 'required|string',
            'order' => 'sometimes|integer|min:0',
        ]);

        $question = Question::create($validated);

        return response()->json($question, 201);
    }

    /**
     * Display the specified question
     */
    public function show(Question $question)
    {
        $question->load(['survey', 'answers']);
        return response()->json($question);
    }

    /**
     * Update the specified question
     */
    public function update(Request $request, Question $question)
    {
        $validated = $request->validate([
            'question_text' => 'sometimes|string',
            'order' => 'sometimes|integer|min:0',
        ]);

        $question->update($validated);

        return response()->json($question);
    }

    /**
     * Remove the specified question
     */
    public function destroy(Question $question)
    {
        try {
            // Explicitly delete all answers related to this question
            $question->answers()->delete();
            
            // Delete the question
            $question->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Question deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete question',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

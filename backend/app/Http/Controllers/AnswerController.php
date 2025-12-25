<?php

namespace App\Http\Controllers;

use App\Models\Answer;
use Illuminate\Http\Request;

class AnswerController extends Controller
{
    /**
     * Display a listing of answers
     */
    public function index()
    {
        $answers = Answer::with(['response', 'question'])->get();
        return response()->json($answers);
    }

    /**
     * Store a newly created answer
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'response_id' => 'required|exists:responses,id',
            'question_id' => 'required|exists:questions,id',
            'answer' => 'required|boolean',
        ]);

        // Check if answer already exists for this response and question
        $existing = Answer::where('response_id', $validated['response_id'])
            ->where('question_id', $validated['question_id'])
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Answer already exists for this question in this response'
            ], 422);
        }

        $answer = Answer::create($validated);

        return response()->json($answer, 201);
    }

    /**
     * Display the specified answer
     */
    public function show(Answer $answer)
    {
        $answer->load(['response', 'question']);
        return response()->json($answer);
    }

    /**
     * Update the specified answer
     */
    public function update(Request $request, Answer $answer)
    {
        $validated = $request->validate([
            'answer' => 'required|boolean',
        ]);

        $answer->update($validated);

        return response()->json($answer);
    }

    /**
     * Remove the specified answer
     */
    public function destroy(Answer $answer)
    {
        try {
            $answer->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Answer deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete answer',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

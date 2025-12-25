<?php

namespace App\Http\Controllers;

use App\Models\Response;
use Illuminate\Http\Request;

class ResponseController extends Controller
{
    /**
     * Display a listing of responses
     */
    public function index()
    {
        $responses = Response::with(['survey', 'user', 'answers'])->get();
        return response()->json($responses);
    }

    /**
     * Store a newly created response
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'survey_id' => 'required|exists:surveys,id',
            'user_id' => 'required|exists:users,id',
            'submitted_at' => 'sometimes|date',
        ]);

        // Check if user already responded to this survey
        $existing = Response::where('survey_id', $validated['survey_id'])
            ->where('user_id', $validated['user_id'])
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'User already responded to this survey'
            ], 422);
        }

        $response = Response::create($validated);

        return response()->json($response, 201);
    }

    /**
     * Display the specified response
     */
    public function show(Response $response)
    {
        $response->load(['survey', 'user', 'answers']);
        return response()->json($response);
    }

    /**
     * Update the specified response
     */
    public function update(Request $request, Response $response)
    {
        $validated = $request->validate([
            'submitted_at' => 'sometimes|date',
        ]);

        $response->update($validated);

        return response()->json($response);
    }

    /**
     * Remove the specified response
     */
    public function destroy(Response $response)
    {
        try {
            // Delete all answers related to this response
            $response->answers()->delete();
            
            // Delete the response
            $response->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Response deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete response',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

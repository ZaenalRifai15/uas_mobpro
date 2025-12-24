<?php

namespace App\Http\Controllers;

use App\Services\GeminiService;
use Illuminate\Http\Request;

class GeminiTestController extends Controller
{
    /**
     * Test Gemini API connection
     */
    public function test(Request $request)
    {
        $geminiService = new GeminiService();
        
        $prompt = $request->input('prompt', 'Halo Gemini! Tolong perkenalkan dirimu dalam bahasa Indonesia.');
        
        try {
            $response = $geminiService->generateContent($prompt);
            
            if ($response) {
                return response()->json([
                    'success' => true,
                    'message' => 'Gemini API is working!',
                    'prompt' => $prompt,
                    'response' => $response,
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Gemini API returned empty response',
                    'prompt' => $prompt,
                ], 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gemini API error',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Test survey analysis
     */
    public function testSurveyAnalysis()
    {
        $geminiService = new GeminiService();
        
        // Sample data
        $sampleData = [
            'title' => 'Survei Kepuasan Pelayanan Kampus',
            'total_responden' => 50,
            'questions' => [
                [
                    'question_id' => 1,
                    'question_text' => 'Apakah Anda puas dengan fasilitas perpustakaan?',
                    'setuju' => 42,
                    'tidak_setuju' => 8,
                    'setuju_percentage' => 84.00,
                    'tidak_setuju_percentage' => 16.00,
                ],
                [
                    'question_id' => 2,
                    'question_text' => 'Apakah dosen mengajar dengan baik dan profesional?',
                    'setuju' => 45,
                    'tidak_setuju' => 5,
                    'setuju_percentage' => 90.00,
                    'tidak_setuju_percentage' => 10.00,
                ],
                [
                    'question_id' => 3,
                    'question_text' => 'Apakah lingkungan kampus nyaman dan bersih?',
                    'setuju' => 38,
                    'tidak_setuju' => 12,
                    'setuju_percentage' => 76.00,
                    'tidak_setuju_percentage' => 24.00,
                ],
            ]
        ];
        
        try {
            $analysis = $geminiService->analyzeSurvey($sampleData);
            
            return response()->json([
                'success' => true,
                'message' => 'Survey analysis completed',
                'sample_data' => $sampleData,
                'analysis' => $analysis,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Analysis failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

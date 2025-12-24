<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class GeminiService
{
    private string $apiKey;
    private string $baseUrl;
    private string $model;

    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key');
        $this->baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
        $this->model = 'gemini-2.5-flash'; // Stable version released June 2025
    }

    /**
     * Get full API URL for content generation
     */
    private function getApiUrl(): string
    {
        return "{$this->baseUrl}/models/{$this->model}:generateContent?key={$this->apiKey}";
    }

    /**
     * Generate content using Gemini API
     */
    public function generateContent(string $prompt): ?string
    {
        try {
            $response = Http::timeout(30)->post($this->getApiUrl(), [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.7,
                    'maxOutputTokens' => 2048, // Increased for longer analysis
                ]
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                // Log response untuk debugging
                \Log::info('Gemini API Response', ['data' => $data]);
                
                return $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
            }

            \Log::error('Gemini API Error: ' . $response->body());
            return null;
        } catch (\Exception $e) {
            \Log::error('Gemini API Exception: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Generate survey analysis
     */
    public function analyzeSurvey(array $surveyData): array
    {
        $prompt = $this->buildSurveyPrompt($surveyData);
        $response = $this->generateContent($prompt);

        if (!$response) {
            return [
                'summary' => 'Unable to generate analysis at this time.',
                'insight' => 'Please try again later.',
            ];
        }

        // Parse response to extract summary and insight
        return $this->parseAnalysisResponse($response);
    }

    /**
     * Build prompt for survey analysis
     */
    private function buildSurveyPrompt(array $data): string
    {
        $surveyTitle = $data['title'];
        $totalResponses = $data['total_responden'];
        $questions = $data['questions'];

        $prompt = "Anda adalah seorang analis survei profesional. Analisis hasil survei berikut secara mendalam:\n\n";
        $prompt .= "══════════════════════════════════════\n";
        $prompt .= "INFORMASI SURVEI\n";
        $prompt .= "══════════════════════════════════════\n";
        $prompt .= "Judul: {$surveyTitle}\n";
        $prompt .= "Total Responden: {$totalResponses} orang\n";
        $prompt .= "Total Pertanyaan: " . count($questions) . "\n\n";
        
        $prompt .= "══════════════════════════════════════\n";
        $prompt .= "DETAIL HASIL PER PERTANYAAN\n";
        $prompt .= "══════════════════════════════════════\n";

        foreach ($questions as $index => $question) {
            $num = $index + 1;
            $prompt .= "\n[Pertanyaan {$num}]\n";
            $prompt .= "{$question['question_text']}\n";
            $prompt .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
            $prompt .= "✓ Setuju        : {$question['setuju']} orang ({$question['setuju_percentage']}%)\n";
            $prompt .= "✗ Tidak Setuju  : {$question['tidak_setuju']} orang ({$question['tidak_setuju_percentage']}%)\n";
        }

        $prompt .= "\n\n══════════════════════════════════════\n";
        $prompt .= "TUGAS ANALISIS\n";
        $prompt .= "══════════════════════════════════════\n";
        $prompt .= "Berdasarkan data survei di atas, berikan analisis dalam format berikut:\n\n";
        $prompt .= "**SUMMARY:**\n";
        $prompt .= "Buat ringkasan singkat (2-3 kalimat) tentang hasil survei. Sebutkan pola umum dari jawaban responden.\n\n";
        $prompt .= "**INSIGHT:**\n";
        $prompt .= "Berikan 3-4 poin insight mendalam dan rekomendasi aksi konkret. Fokus pada implikasi praktis.\n\n";
        $prompt .= "Gunakan bahasa Indonesia yang profesional. WAJIB gunakan format dengan marker **SUMMARY:** dan **INSIGHT:**";

        return $prompt;
    }

    /**
     * Parse Gemini response
     */
    private function parseAnalysisResponse(string $response): array
    {
        $summary = '';
        $insight = '';

        // Remove markdown formatting
        $response = preg_replace('/\*\*/', '', $response);

        // Try to extract SUMMARY with various patterns (case-insensitive)
        if (preg_match('/SUMMARY[:\s]+(.+?)(?=INSIGHT:|$)/si', $response, $matches)) {
            $summary = trim($matches[1]);
        }

        // Try to extract INSIGHT with various patterns (case-insensitive)
        if (preg_match('/INSIGHT[:\s]+(.+?)$/si', $response, $matches)) {
            $insight = trim($matches[1]);
        }

        // Fallback: Split by double newlines if no markers found
        if (empty($summary) || empty($insight)) {
            $parts = preg_split('/\n\s*\n/', trim($response), 2);
            if (count($parts) >= 2) {
                if (empty($summary)) $summary = $parts[0];
                if (empty($insight)) $insight = $parts[1];
            }
        }

        // Clean up responses
        $summary = preg_replace('/^(SUMMARY|Ringkasan)[:\s]*/i', '', $summary);
        $insight = preg_replace('/^(INSIGHT|Rekomendasi)[:\s]*/i', '', $insight);

        // Ensure we have content
        $summary = trim($summary) ?: 'Hasil survei menunjukkan tingkat partisipasi yang baik dari responden.';
        $insight = trim($insight) ?: 'Perlu dilakukan analisis lebih lanjut untuk mendapatkan insight yang lebih mendalam.';

        return [
            'summary' => $summary,
            'insight' => $insight,
        ];
    }
}

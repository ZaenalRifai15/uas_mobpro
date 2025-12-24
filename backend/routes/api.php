<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SurveyController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\ResponseController;
use App\Http\Controllers\AnswerController;
use App\Http\Controllers\SurveyAnalyticsController;
use App\Http\Controllers\GeminiTestController;
use Illuminate\Support\Facades\Route;

// Auth routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/logout', [AuthController::class, 'logout']);
Route::get('/auth/me', [AuthController::class, 'me']);

// Public routes (no authentication required for simplicity)
// In production, add authentication middleware

// Users
Route::apiResource('users', UserController::class);

// Surveys
Route::apiResource('surveys', SurveyController::class);
Route::get('/surveys/{survey}/analytics', [SurveyAnalyticsController::class, 'getAnalytics']);
Route::post('/surveys/{survey}/generate-analytics', [SurveyAnalyticsController::class, 'generate']);

// Questions
Route::apiResource('questions', QuestionController::class);

// Responses
Route::apiResource('responses', ResponseController::class);

// Answers
Route::apiResource('answers', AnswerController::class);

// Survey Analytics
Route::apiResource('survey-analytics', SurveyAnalyticsController::class);

// Gemini Test Routes
Route::get('/test/gemini', [GeminiTestController::class, 'test']);
Route::post('/test/gemini', [GeminiTestController::class, 'test']);
Route::get('/test/gemini/survey', [GeminiTestController::class, 'testSurveyAnalysis']);

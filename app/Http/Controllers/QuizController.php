<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\Question;
use App\Models\Choice;
use App\Models\QuizSubmission;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'class_id' => 'required|exists:classes,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'questions' => 'required|array|min:1',
            'start_time' => 'nullable|date',
            'end_time' => 'nullable|date|after_or_equal:start_time',
            'duration_minutes' => 'nullable|integer|min:1',
            'questions.*.question_text' => 'required|string',
            'questions.*.correct_choice' => 'required|in:A,B,C,D',
            'questions.*.choices' => 'required|array|size:4',
            'questions.*.choices.*.label' => 'required|in:A,B,C,D',
            'questions.*.choices.*.text' => 'required|string'
        ]);

        $quiz = Quiz::create([
            'class_id' => $validated['class_id'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'start_time' => $validated['start_time'] ?? null,
            'end_time' => $validated['end_time'] ?? null,
            'duration_minutes' => $validated['duration_minutes']
        ]);

        forEach ($validated['questions'] as $q) {
            $question = $quiz->questions()->create([
                'question_text' => $q['question_text'],
                'correct_choice' => $q['correct_choice'],
            ]);

            $question->choices()->createMany($q['choices']);
        }

        $quiz->load('questions.choices');

        if ($request->wantsJson()) {
            return response()->json(['quiz' => $quiz]);
        }

        return back()->with('success', 'Quiz created');
    }

    public function submit(Request $request, Quiz $quiz)
    {
        // dd($request->all());

        $existing = QuizSubmission::where('quiz_id', $quiz->id)
            ->where('student_id', auth()->id())
            ->where('status', 'finished')
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'You have already finished the quiz.',
            ], 403);
        }

        $validated = $request->validate([
            'answers' => 'required|array',
            'answers.*' => 'required|in:A,B,C,D',
        ]);

        $questions = $quiz->questions()->with('choices')->get();

        $correctCount = 0;

        foreach ($questions as $question) {
            $studentAnswer = $validated['answers'][$question->id] ?? null;
            if ($studentAnswer === $question->correct_choice) {
                $correctCount++;
            }
        }

        $score = $correctCount;

        $submissions = QuizSubmission::create([
            'quiz_id' => $quiz->id,
            'student_id' => auth()->id(),
            'answers' => json_encode($validated['answers']),
            'score' => $score,
            'status' => 'finished',
        ]);

        // return response()->json([
        //     'message' => 'Quiz submitted successfully.',
        //     'score' => $score,
        //     'total' => $questions->count(),
        // ]);

        return back()->with('success', 'Quiz submitted successfully!');
    }
     
    public function getQuizzes($id)
    {
        $quizzes = Quiz::with(['questions.choices', 'submissions.student'])
            ->where('class_id', $id)
            ->latest()
            ->get();

        return response()->json([
            'quizzes' => $quizzes
        ]);
    }
}

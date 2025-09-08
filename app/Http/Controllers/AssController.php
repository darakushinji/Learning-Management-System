<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use Illuminate\Support\Facades\File;
use App\Notifications\NewAssignmentNotification;
use App\Notifications\SubmissionGraded;
use App\Models\Submission;
use Illuminate\Http\Request;

class AssController extends Controller
{
    public function storeAssignment(Request $request, $classId)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'file' => 'required|file|mimes:pdf,docx,txt,ppt,pptx|max:10240',
            'due_date' => 'required|date',
        ]);


        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $filename = time() . '.' . $file->getClientOriginalExtension();
            $uploadPath = public_path('assignments');

            if (!File::exists($uploadPath)) {
                File::makeDirectory($uploadPath, 0777, true);
            }

            $file->move($uploadPath, $filename);
            $filePath = $filename;

            // Create a new assignment record
            $assignment = Assignment::create([
                'class_id' => $classId,
                'title' => $request->input('title'),
                'description' => $request->input('description', ''),
                'due_date' => $request->input('due_date'),
                'attachment' => $filePath,
            ]);

            // Notify all students in the class about the new assignment
            $class = ClassModel::find($classId);
            if ($class) {
                foreach ($class->students as $student) {
                    $student->notify(new NewAssignmentNotification($assignment));
                }
            }

            return response()->json([
                'assignment' => $assignment,
            ]);
        } else {
            return back()->with('error', 'Assignment not uploaded successfully');
        }
    }

    public function getAssignment($id)
    {
        $assignments = Assignment::with('submissions.student')->where('class_id', $id)
            ->latest()
            ->get();

        return response()->json([
            'assignments' => $assignments,
        ]);
    }

    public function addGrade(Request $request,  Submission $submission)
    {
        // dd($request->all());
        $submission->load('student');

        $validated = $request->validate([
            'grade' => 'required|string|max:10',
            'feedback' => 'nullable|string|max:1000',
        ]);

        $submission->update([
            ...$validated,
            'status' => 'completed',
        ]);

        if ($submission->student) {
            $submission->student->notify(new SubmissionGraded($submission));
        }

        return response()->json([
            'success' => true,
        ]);
    }
}

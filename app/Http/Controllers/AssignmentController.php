<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Assignment;
use App\Models\ClassModel;
use Illuminate\Support\Facades\File;
use App\Notifications\NewAssignmentNotification;

class AssignmentController extends Controller
{
    public function storeAssignment(Request $request, $classId)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'file' => 'required|file|mimes:pdf,docx,txt,pptx|max:10240',
            'classroom_id' => 'required|exists|classes,id',
            'due_date' => 'required|date',
        ]);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $filename = time() . '.' . $file->getClientOriginalExtension();
            $uploadPath = public_path('assignments');

            if (!File::exists($uploadPath)) {
                File::makeDirectory($uploadPath, 0777, true)
            }

            $file->move($uploadPath, $filename);
            $filePath = $filename;

            $assignment = Assignment::create([
                'class_id' => $classId,
                'title' => $request->input('title'),
                'description' => $request->input('description', ''),
                'due_date' => $request->input('due_date'),
                'attachment' => $filePath,
            ]);

            $class = ClassModel::with('students')
                ->find($classId);
            if ($class) {
                foreach ($class->students as $student) {
                    $student->notify(new NewAssignmentNotification($assignment))
                }
            }

            return response()->json([
                'success' => true,
                'assignment' => $assignment,
            ]);
        } else {
            return response()->json([
                'success' => false,
            ]);
        }
    }
}

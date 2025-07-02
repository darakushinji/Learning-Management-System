<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Auth;
use App\Notifications\NewAssignmentNotification;
use App\Models\User;
use App\Models\Thread;
use App\Models\Material;
use App\Models\Reply;
use App\Models\Task;
use App\Models\Assignment;
use App\Models\ClassModel;
use Inertia\Inertia;

class InstructorController extends Controller
{
    public function dashboard()
    {
        $instructor = Auth::user();

        if ($instructor->role !==  'instructor') {
            abort(403, 'Unauthorized');
        }

        $tasks = Task::where('user_id', $instructor->id)->take(5)->get();
        $myClasses = ClassModel::where('instructor_id', $instructor->id)->take(5)->get();
        $myStudent = ClassModel::where('instructor_id', $instructor->id)
            ->with('students')
            ->get()
            ->pluck('students')
            ->flatten()
            ->unique('id')
            ->values();

        // dd($myStudent);
        // dd($myClasses);

        return Inertia::render('Instructor/Dashboard', [
                'tasks' => $tasks,
                'myClasses' => $myClasses,
                'myStudent' => $myStudent
            ]
        );
    }

    public function classList()
    {
        $instructorId = auth()->id();

        $classList = ClassModel::where('instructor_id', $instructorId)->get();

        $students = User::where('role', 'student')->get();

        return Inertia::render('Instructor/ClassList', [
            'classList' => $classList,
        ]);
    }

    public function create()
    {
        return Inertia::render('Instructor/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:255',
            'subcode' => 'required|string|max:255',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'photo' => 'nullable|image|mimes:jpg,jpeg,png|max:4096',
            'yearlevel' => 'required|int',
            'section' => 'required|string|max:20'
        ]);

        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $filename = time() . '.' . $file->getClientOriginalExtension();
            $path = $file->move(public_path('class'), $filename);
            $data['photo'] = $filename;
        }

        $data['instructor_id'] = auth()->id();

        ClassModel::create($data);

        return redirect()->route('instructor.classList')->with('success', 'Classroom created successfully');
    }

    public function edit($id)
    {
        $classModel = ClassModel::where('id', $id)->where('instructor_id', auth()->id())->firstOrFail();
        return Inertia::render('Instructor/Edit', [
            'classModel' => $classModel,
        ]);
    }

    public function updateClassroom(Request $request, ClassModel $classModel)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:255',
            'subcode' => 'required|string|max:255',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'photo' => 'nullable|image|mimes:jpg,jpeg,png|max:4096',
            'yearlevel' => 'required|int',
            'section' => 'required|string|max:20'
        ]);

        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $filename = time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('class'), $filename);
            $data['photo'] = $filename;
        } else {
            $data['photo'] = $classModel->photo;
        }

        $classModel->update($data);

        return redirect()->route('instructor.classList')->with('success', 'Classroom updated successfully');
    }

    public function destroy(ClassModel $classModel)
    {
        $classModel->delete();
        return redirect()->route('instructor.classList')->with('success', 'Classroom deleted successfully.');
    }

    public function show($id)
    {
        $classroom = ClassModel::with('students')->where('instructor_id', auth()->id())->findOrFail($id);
        $students = User::where('role', 'student')->get();

        $threads = Thread::with(['user', 'replies.user'])
                        ->where('class_id', $id)
                        ->latest()
                        ->get();

        $materials = Material::where('class_id', $id)->latest()->get();

        $assignments = Assignment::with([
            'submissions.student'
        ])->where('class_id', $id)
          ->latest()
          ->get();

        return Inertia::render('Instructor/Classroom', [
            'classroom' => $classroom,
            'students' => $students,
            'initialThreads' => $threads,
            'materials' => $materials,
            'assignments' => $assignments,
        ]);
    }


    public function addStudent(Request $request, $id)
    {
        $request->validate([
            'student_id' => 'required|exists:users,id',
        ]);

        $class = ClassModel::where('instructor_id', auth()->id())->findOrFail($id);

        $class->students()->syncWithoutDetaching($request->student_id); // prevents duplicate entries

        return back();
    }

    public function storeThread(Request $request, $id)
    {
        $request->validate(['message' => 'required|string']);

        Thread::create([
            'class_id' => $id,
            'user_id' => auth()->id(),
            'message' => $request->message,
        ]);

        return back();
    }

    public function storeReply(Request $request, Thread $thread)
    {
        $request->validate(['message' => 'required|string']);

        Reply::create([
            'thread_id' => $thread->id,
            'user_id' => auth()->id(),
            'message' => $request->message,
        ]);

        return back();
    }

public function storeAss(Request $request)
{
    $request->validate([
        'title' => 'required|string|max:255',
        'file' => 'required|file|mimes:pdf,docx,txt,ppt,pptx|max:10240',
        'classroom_id' => 'required|exists:classes,id',
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
            'class_id' => $request->input('classroom_id'),
            'title' => $request->input('title'),
            'description' => $request->input('description', ''),
            'due_date' => $request->input('due_date'),
            'attachment' => $filePath,
        ]);

        // Notify all students in the class about the new assignment
        $class = ClassModel::find($request->input('classroom_id'));
        if ($class) {
            foreach ($class->students as $student) {
                $student->notify(new \App\Notifications\NewAssignmentNotification($assignment));
            }
        }

        return back()->with('success', 'Assignment uploaded successfully');
    } else {
        return back()->with('error', 'Assignment not uploaded successfully');
    }
}

public function showProfile()
    {
        return inertia('Instructor/Profile', [
            'user' => Auth::user(),
        ]);
    }

    public function update(Request $request)
    {
        $user = Auth::user();
        $request->validate([
            'firstname' => 'required|string|max:255',
            'middlename' => 'nullable|string|max:255',
            'lastname' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'contact_number' => 'nullable|string|max:255',
            'specialization' => 'nullable|string|max:255',
            'bio' => 'nullable|string',
        ]);
        $user->update($request->only([
            'firstname', 'middlename', 'lastname', 'email', 'contact_number', 'specialization', 'bio'
        ]));
        return response()->json(['success' => true]);
    }

}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Auth;
use App\Notifications\NewAssignmentNotification;
use App\Notifications\StudentAddedToClass;
use App\Notifications\StudentRemovedToClass;                                                               
use App\Models\User;
use App\Models\Thread;
use App\Models\Material;
use App\Models\Reply;
use App\Models\Task;
use App\Models\Assignment;
use App\Models\ClassModel;
use App\Models\QuizSubmission;
use App\Models\Quiz;
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
        $myStudents = ClassModel::where('instructor_id', $instructor->id)
            ->with('students')
            ->get()
            ->pluck('students')
            ->flatten()
            ->unique('id')
            ->values();


        // dd($myStudents);
        // dd($myClasses);

        return Inertia::render('Instructor/Dashboard', [
                'tasks' => $tasks,
                'myClasses' => $myClasses,
                'myStudents' => $myStudents
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

    
    // json response
    public function jsonClassList()
    {
        $classList = ClassModel::where('instructor_id', auth()->id())->get();

        return response()->json([
            'classList' => $classList,
        ]);
    }

    public function create()
    {
        return Inertia::render('Instructor/Create');
    }

    public function storeClassroom(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:255',
            'subcode' => 'required|string|max:255',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'photo' => 'nullable|image|mimes:jpg,jpeg,png|max:4096',
            'yearlevel' => 'required|int',
            'section' => 'required|string|max:25'
        ]);

        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $filename = time() . '.' . $file->getClientOriginalExtension();
            $path = $file->move(public_path('class'), $filename);
            $data['photo'] = $filename;
        }

        $data['instructor_id'] = auth()->id();

        ClassModel::create($data);

        return redirect()->route('instructor.classList')->with('success', 'Classroom created successfully.');
    }

    // HAI ANNA POLO I LOVE YOU!!!

    public function edit($id){
        $classModel = ClassModel::where('id', $id)->where('instructor_id', auth()->id())->firstOrFail();

        return Inertia::render('Instructor/Edit', [
            'classModel' => $classModel
        ]);
    }

    public function updateClassroom(Request $request, $id)
    {
        // dd($request->all());
        $classModel = ClassModel::where('id', $id)
                                ->where('instructor_id', auth()->id())
                                ->firstOrFail();

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string|max:255',
            'subcode' => 'sometimes|string|max:255',
            'start_time' => 'nullable|date_format:H:i:s',
            'end_time' => 'nullable|date_format:H:i:s|after:start_time',
            'photo' => 'nullable|image|mimes:jpg,jpeg,png|max:4096',
            'yearlevel' => 'sometimes|int',
            'section' => 'sometimes|string|max:255',
        ]);

        if ($request->hasFile('photo')){
            $file = $request->file('photo');
            $filename = time() . "." . $file->getClientOriginalExtension();
            $file->move(public_path('class'), $filename);
            $data['photo'] = $filename;
        } else {
            // Keep the original photo
            $data['photo'] = $classModel->photo;
        }

        $classModel->update($data);

        return redirect()->route('instructor.classList')->with('success', 'Classroom updated successfully.');
    }

    public function destroy($id)
    {
        $classModel = ClassModel::findOrFail($id);
        // dd($classModel);
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

        $quizzes = Quiz::with(['questions.choices', 'submissions.student'])->where('class_id', $id)->latest()->get();

        // dd($quizzes);

        $submissions = QuizSubmission::with(['student'])->get();

        // dd($submissions);

        return Inertia::render('Instructor/Classroom', [
            'classroom' => $classroom,
            'students' => $students,
            'initialThreads' => $threads,
            'materials' => $materials,
            'assignments' => $assignments,
            'quizzes' => $quizzes,
            'submissions' => $submissions,
        ]);
    }

    public function testClassroomList()
    {
        return Inertia::render('Instructor/ClassListTest');
    }

    public function testClassroom($id)
    {
        $classroom = ClassModel::with('students')
            ->where('instructor_id', auth()->id())
            ->findOrFail($id);

       return Inertia::render('Instructor/TestClassroom', [
            'classroom' => $classroom,
       ]);
    }

    public function getThreads($id)
    {
        $threads = Thread::with(['user', 'replies.user'])
            ->where('class_id', $id)
            ->latest()
            ->get();
        
        return response()->json([
            'threads' => $threads,
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

    public function addStudentToClassroom(Request $request, $id)
    {
        $request->validate([
            'student_id' => 'required|exists:users,id',
        ]);

        $class = ClassModel::where('instructor_id', auth()->id())->findOrFail($id);

        $class->students()->syncWithoutDetaching($request->student_id);

        $student = User::findOrFail($request->student_id);
        $student->notify(new StudentAddedToClass($class));

        return response()->json([
            'success' => true,
            'class' => $class,
        ]);
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

    // json response
    public function storeThreads(Request $request, $id)
    {
        $request->validate([
            'message' => 'required|string'
        ]);

        $thread = Thread::create([
            'class_id' => $id,
            'user_id' => auth()->id(),
            'message' => $request->message,
        ]);

        return response()->json([
            'success' => true, 
            'thread' => $thread,
        ]);
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

    public function editProfile()
    {
        $user = Auth::user();

        return inertia('Instructor/Profile', [
            'user' => $user,
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
            'profile_picture' => 'nullable|mimes:jpg,jpeg,png|max:4095',
        ]);

        if ($request->hasFile('profile_picture')) {
            $file = $request->file('profile_picture');
            $filename = time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('profiles'), $filename);

            $user->profile_picture = 'profiles/' . $filename;
        }

        $user->update($request->only([
            'firstname',
            'middlename',
            'lastname',
            'email',
            'contact_number',
            'specialization',
            'bio',
        ]));

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully!',
            'user' => $user,
        ]);
    }


    // Classroom Members
    public function getMembers($id)
    {
        $members = ClassModel::with('students', 'instructor')->findOrFail($id);

        return response()->json([
            'instructor' => $members->instructor,
            'students' => $members->students
        ]);
    }

    public function searchStudents(Request $request)
    {
        $request->validate([
            'query' => 'required|string|min:1'
        ]);

        $student = User::where('firstname', 'like', '%' . $request->input('query') . '%')
            ->where('id', '!=', auth()->id())
            ->limit(10)
            ->get(['id', 'firstname']);

        return response()->json($student);
    }

    public function removeStudent($classId, $studentId) 
    {
        $class = ClassModel::findOrFail($classId);
        $student = User::findOrFail($studentId);

        $class->students()->detach($student->id);

        $student = User::findOrFail($studentId);
        $student->notify(new StudentRemovedToClass($class));

        return response()->json([
            'message' => 'Student removed successfully',
            'class_id' => $classId,
            'student' => $studentId,
        ]);
        
    }
}
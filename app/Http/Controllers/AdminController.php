<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\ClassModel;
use App\Models\Thread;
use App\Models\Material;
use App\Models\Assignment;
use Carbon\Carbon;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function dashboard()
    {
        $instructors = User::where('role', 'instructor')->count();
        $students = User::where('role', 'student')->count();
        $classes = ClassModel::count();

        $months = collect();
        for ($i = 11; $i >= 0; $i--) {
            $months->push(Carbon::now()->subMonths($i)->format('M Y'));
        }

        // Fetch the count of users (instructors, students) and classes for each of the last 12 months
        $instructorsCount = [];
        $studentsCount = [];
        $classesCount = [];

        foreach ($months as $month) {
            // Parse month to get Carbon instance for that month
            $monthDate = Carbon::createFromFormat('M Y', $month); // Create a Carbon date object

            // Get instructors count for each month (assuming you have a `created_at` column for when they joined)
            $instructorsCount[] = User::where('role', 'instructor')
                ->whereMonth('created_at', $monthDate->month)
                ->whereYear('created_at', $monthDate->year)
                ->count();

            // Get students count for each month
            $studentsCount[] = User::where('role', 'student')
                ->whereMonth('created_at', $monthDate->month)
                ->whereYear('created_at', $monthDate->year)
                ->count();

            // Get classes count for each month (assuming you have a `created_at` column for class creation)
            $classesCount[] = ClassModel::whereMonth('created_at', $monthDate->month)
                ->whereYear('created_at', $monthDate->year)
                ->count();
        }

        $recentInstructors = User::where('role', 'instructor')->take(5)->get();
        $recentStudents = User::where('role', 'student')->take(5)->get();
        $recentClasses = ClassModel::latest()->take(5)->get();

        return Inertia::render('Admin/Dashboard', [
            'chartData' => [
                'months' => $months,
                'instructors' => $instructorsCount,
                'students' => $studentsCount,
                'classes' => $classesCount,
            ],
            'totalData' => [
                'instructors' => $instructors,
                'students' => $students,
                'classes' => $classes
            ],
            'recentInstructors' => $recentInstructors,
            'recentStudents' => $recentStudents,
            'recentClasses' => $recentClasses,
        ]);
    }

    public function createClassroom()
    {
        $instructors = User::where('role', 'instructor')->get();

        return Inertia::render('Admin/CreateClass', [
            'instructors' => $instructors,
        ]);
    }

    public function storeClassroom(Request $request)
    {
        // dd($request->all());
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:255',
            'subcode' => 'required|string|max:255',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'instructor_id' => 'required|exists:users,id',
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

        ClassModel::create($data);

        return redirect()->route('classroom.view')->with('success', 'Classroom created successfully');
    }

    public function classroomView()
    {
        return Inertia::render('Admin/Classroom');
    }

    public function classroom()
    {
        $classes = ClassModel::with(['instructor'])->withCount('students')->get();
        return response()->json($classes);
    }

    public function index()
    {
        $instructors = User::where('role', 'instructor')->get();

        return Inertia::render('Admin/Instructor', [
            'instructors' => $instructors,
        ]);
    }

    public function manageInstructor()
    {
        return Inertia::render('Admin/ManageAccount');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'firstname' => 'nullable|string|max:255',
            'middlename' => 'nullable|string|max:255',
            'lastname' => 'nullable|string|max:255',
            'email' => 'nullable|email|unique:users,email',
            'password' => 'nullable|string|min:8|confirmed',
            'specialization' => 'nullable|string|max:255',
            'contact_number' => 'nullable|string|max:20',
            'profile_picture' => 'nullable|image|mimes:jpg,jpeg,png|max:2048'
        ]);

        if ($request->hasFile('profile_picture')) {
            $file = $request->file('profile_picture');
            $filename = time() . '.' . $file->getClientOriginalExtension();
            $path = $file->move(public_path('profiles'), $filename);
            $data['profile_picture'] = $filename;
        }

        $data['role'] = 'instructor';
        $data['password'] = Hash::make($data['password']);
        $data['email_verified_at'] = now();

        User::create($data);

        return redirect()->route('admin.instructor')->with('message', 'Instructor account created successfully.');
    }

    public function edit(User $user)
    {
        return Inertia::render('Admin/EditAccount', [
            'user' => $user
        ]);
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'firstname' => 'nullable|string|max:255',
            'middlename' => 'nullable|string|max:255',
            'lastname' => 'nullable|string|max:255',
            'email' => 'nullable|email|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8|confirmed',
            'specialization' => 'nullable|string|max:255',
            'contact_number' => 'nullable|string|max:20',
            'profile_picture' => 'nullable|image|mimes:jpg,jpeg,png|max:2048'
        ]);

        if ($request->hasFile('profile_picture')) {
            $file = $request->file('profile_picture');
            $filename = time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('profiles'), $filename);
            $data['profile_picture'] = $filename;
        } else {
            $data['profile_picture'] = $user->profile_picture;
        }

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return redirect()->back()->with('message', 'Instructor account updated successfully.');
    }

    public function destroy(User $user)
    {
        $user->delete();
        return redirect()->route('admin.instructor');
    }

    public function profile()
    {
        $user = Auth::user();

        return Inertia::render('Admin/Profile', [
            'user' => $user,
        ]);
    }

    public function updateProfile(Request $request)
    {
        // dd($request->hasFile('profile_picture'));
        $user = Auth::user();

        $validated = $request->validate([
            'firstname' => 'required|string|max:255',
            'middlename' => 'nullable|string|max:255',
            'lastname' => 'required|string|max:255',
            'contact_number' => 'required|string|max:20',
            'password' => 'nullable|string|min:10|confirmed',
            'profile_picture' => 'nullable|image|max:2048',
        ]);

        if ($validated['password']) {
            $user->password = Hash::make($validated['password']);
        }

        if ($request->hasFile('profile_picture')) {
            $file = $request->file('profile_picture');
            $filename = time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('profiles'), $filename);
            $user->profile_picture = 'profiles/' . $filename;
        }

        $user->firstname = $validated['firstname'];
        $user->middlename = $validated['middlename'];
        $user->lastname = $validated['lastname'];
        $user->contact_number = $validated['contact_number'];

        $user->save();

        return redirect()->route('admin.profile')->with('succes', 'Profile updated successfully.');
    }

    public function showClassroom($id)
    {
        $classroom = ClassModel::with(['instructor', 'students'])->findOrFail($id);
        // dd($classroom);
        $students = User::where('role', 'student')->get();
        $threads = Thread::with(['user', 'replies.user'])
            ->where('class_id', $id)
            ->latest()
            ->get();

        // dd($threads);
        $materials = Material::where('class_id', $id)->latest()->get();
        $assignments = Assignment::with([
            'submissions.student'
        ])->where('class_id', $id)
          ->latest()
          ->get();

        return Inertia::render('Admin/ClassroomView', [
            'class_id' => $id,
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

        $classroom = ClassModel::findOrFail($id);

        $classroom->students()->syncWithoutDetaching([$request->student_id]);

        return back()->with('success', 'Student added by instructor!');
    }

    public function studentsAccount()
    {
        return Inertia::render('Admin/Students');
    }

    // json response
    public function getStudents()
    {
        $students = User::where('role', 'student')->get();

        return response()->json([
            'students' => $students
        ]);
    }

    public function resetPassword(Request $request, $id)
    {
        $request->validate([
            'password' => 'required|min:8',
        ]);
        
        $student = User::findOrFail($id);
        $student->password = bcrypt($request->password);
        $student->save();

        return response()->json([
            'message' => 'Password reset successful!'
        ]);
    }
}

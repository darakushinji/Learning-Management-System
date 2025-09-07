<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Material;
use App\Models\ClassModel;
use App\Models\Assignment;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use App\Notifications\NewMaterialNotification;

class ClassMaterialController extends Controller
{
    public function store(Request $request, $classId)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'materials_folder' => 'required|file|mimes:pdf,docx,txt,ppt,pptx|max:10240',
        ]);

        if ($request->hasFile('materials_folder')) {
            $file = $request->file('materials_folder');
            $filename = time() . '.' . $file->getClientOriginalExtension();
            $uploadPath = public_path('materials');

            if (!File::exists($uploadPath)) {
                File::makeDirectory($uploadPath, 0777, true);
            }

            $file->move($uploadPath, $filename);
            $filePath = $filename;

            $material = Material::create([
                'class_id' => $classId,
                'title' => $request->input('title'),
                'materials_folder' => $filePath,
            ]);

            // $class = ClassModel::with('students')
            //     ->find($request->input('class_id'));

            $class = ClassModel::with('students')
                ->find($classId);
            if ($class) {
                foreach ($class->students as $student) {
                    $student->notify(new NewMaterialNotification($material));
                }
            }

            return response()->json([
                'success' => true,
                'material' => $material,
            ]);
        } else {
            return response()->json([
                'success' => false,
            ]);
        }
    }

    public function fetchMaterials($id)
    {
        $materials = Material::where('class_id', $id)
            ->latest()
            ->get();

        return response()->json([
            'materials' => $materials
        ]);
    }

    public function getAss($id)
    {
        $assignments = Assignment::where('class_id', $id)
            ->latest()
            ->get();

        return response()->json([
            'assignments' => $assignments,
        ]);
    }
}

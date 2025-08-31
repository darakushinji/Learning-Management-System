<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Thread;

class ThreadController extends Controller
{
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
}

import React from "react";
import { Link } from "@inertiajs/react";
import { FiVideo } from "react-icons/fi";
import Threads from "./Classroom/Threads";
import InstructorLayout from "@/Layouts/InstructorLayout";

export default function TestClassroom({ classroom = { students: [] } }) {
    return (
        <InstructorLayout>
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-4 mb-4">
                    <div>
                        {""}
                        <h1 className="text-3xl font-semibold text-purple-700">
                            {classroom?.name || "Classroom"}
                        </h1>
                        <p className="text-gray-600">
                            {classroom?.description || ""}
                        </p>
                    </div>
                    <Link
                        href={route("video.call.start", classroom.id)}
                        title="Start Video Call"
                        className="text-purple-600 hocver:text-purple-800 text-3xl p-2 rounded-md transition"
                    >
                        <FiVideo />
                    </Link>
                </div>
            </div>
        </InstructorLayout>
    );
}

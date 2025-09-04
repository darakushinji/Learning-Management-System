import React from "react";
import { Link } from "@inertiajs/react";
import { FiVideo } from "react-icons/fi";
import Threads from "./Classroom/Threads";
import { useState } from "react";
import InstructorLayout from "@/Layouts/InstructorLayout";

export default function TestClassroom({ classroom = { students: [] } }) {
    const [activeTab, setActiveTab] = useState("threads");
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

                <div className="flex space-x-4 border-b mb-4">
                    {[
                        "threads",
                        "materials",
                        "assignments",
                        "quiz",
                        "members",
                    ].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-2 px-4 text-sm font-medium capitalize border-b-2 transition ${
                                activeTab === tab
                                    ? "border-purple-600 text-purple-600"
                                    : "border-transparent text-gray-500 hover:text-purple-600"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="mt-4">
                    {activeTab === "threads" && (
                        <Threads classId={classroom.id}></Threads>
                    )}
                </div>
            </div>
        </InstructorLayout>
    );
}

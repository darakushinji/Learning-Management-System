import { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import axios from "axios";

export default function Assignments({ classId }) {
    const { props } = usePage();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [duedate, setDuedate] = useState("");
    const [attachment, setAttachment] = useState("");
    const [assignments, setAssignments] = useState([]);
    const [assignmentProcessing, setAssignmentProcessing] = useState(false);
    const [assignmentTab, setAssignmentTab] = useState("ongoing");
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [gradingAll, setGradingAll] = useState(false);
    const [gradingData, setGradingData] = useState({});

    const tabLabels = {
        ongoing: "Ongoing",
        pastDue: "Past Due",
        completed: "Completed",
    };

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                if (!classId) return;
                const res = await axios.get(`/fetch/assignments/${classId}`);
                setAssignments(res.data.assignments);
            } catch (error) {
                console.error("Error fetching assignments.", error);
            }
        };
        fetchAssignments();
        const interval = setInterval(fetchAssignments, 1000);
        return () => clearInterval(interval);
    }, [classId]);

    const handleAddAssignment = async (e) => {
        e.preventDefault();
        setAssignmentProcessing(true);
        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("due_date", duedate);
            formData.append("file", attachment);

            const res = await axios.post(
                `/classroom/assignment/${classId}/store`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            setAssignments((prev) => [res.data.assignment, ...prev]);
            setTitle("");
            setDescription("");
            setDuedate("");
            setAttachment(null);
        } catch (error) {
            console.error("Error posting assignment.", error);
        } finally {
            setAssignmentProcessing(false);
        }
    };

    const getAssignmentsByStatus = (status) => {
        const now = new Date();
        if (!assignments) return [];
        if (status === "ongoing") {
            return assignments.filter((a) => new Date(a.due_date) >= now);
        } else if (status === "pastDue") {
            return assignments.filter(
                (a) =>
                    new Date(a.due_date) < now &&
                    (!a.submissions || a.submissions.length === 0)
            );
        } else if (status === "completed") {
            return assignments.filter(
                (a) => a.submissions && a.submissions.length > 0
            );
        }
        return assignments;
    };

    const updateGrade = async (submissionId) => {
        const data = gradingData[submissionId];
        if (!data) return;
        try {
            await axios.put(`/submissions/grade/${submissionId}`, data);
            alert("Grade updated!");
        } catch (error) {
            console.error("Error posting grade.", error);
            alert("Failed to update.");
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* Assignment List */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800">Assignments</h2>

                {/* Tabs */}
                <div className="flex gap-2 mb-4">
                    {[
                        { label: "Ongoing", key: "ongoing", color: "green" },
                        { label: "Past Due", key: "pastDue", color: "red" },
                        
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setAssignmentTab(tab.key)}
                            className={`px-4 py-2 rounded-full text-sm font-medium ${
                                assignmentTab === tab.key
                                    ? `bg-${tab.color}-100 text-${tab.color}-700`
                                    : "bg-gray-100 text-gray-500"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Assignment Cards */}
                {getAssignmentsByStatus(assignmentTab).length === 0 ? (
                    <div className="text-gray-500 text-center py-8">
                        No assignments in this category.
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {getAssignmentsByStatus(assignmentTab).map(
                            (assignment) => (
                                <div
                                    key={assignment.id}
                                    className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition cursor-pointer"
                                    onClick={() =>
                                        setSelectedAssignment(assignment)
                                    }
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-purple-700 text-lg">
                                                {assignment.title}
                                            </h3>
                                            <p className="text-gray-600 text-sm">
                                                {assignment.description}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Due:{" "}
                                                {new Date(
                                                    assignment.due_date
                                                ).toLocaleDateString()}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {assignment.submissions
                                                    ?.length || 0}{" "}
                                                submission(s)
                                            </p>
                                        </div>
                                        <span
                                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                                                assignmentTab === "ongoing"
                                                    ? "bg-green-100 text-green-700"
                                                    : assignmentTab ===
                                                      "pastDue"
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-blue-100 text-blue-700"
                                            }`}
                                        >
                                            {tabLabels[assignmentTab]}
                                        </span>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>

            {/* Assignment Form */}
            <form
                onSubmit={handleAddAssignment}
                encType="multipart/form-data"
                className="bg-white p-6 rounded-lg shadow-md space-y-4 overflow-y-auto max-h-[85vh]"
            >
                <h2 className="text-xl font-semibold">Create Assignment</h2>

                <input
                    type="text"
                    value={title}
                    placeholder="Title"
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border p-3 rounded"
                    required
                />
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description"
                    className="w-full border p-3 rounded"
                />
                <input
                    type="date"
                    value={duedate}
                    onChange={(e) => setDuedate(e.target.value)}
                    className="w-full border p-3 rounded"
                    required
                />
                <input
                    type="file"
                    onChange={(e) => setAttachment(e.target.files[0])}
                    className="w-full border p-3 rounded"
                />

                <button
                    type="submit"
                    className="w-full py-2 bg-purple-600 text-white rounded"
                    disabled={assignmentProcessing}
                >
                    {assignmentProcessing
                        ? "Uploading..."
                        : "Upload Assignment"}
                </button>
            </form>

            {/* Assignment Modal */}
            {selectedAssignment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6 relative overflow-y-auto max-h-[90vh]">
                        <button
                            onClick={() => setSelectedAssignment(null)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-lg"
                        >
                            ×
                        </button>
                        <h3 className="text-xl font-bold mb-2">
                            {selectedAssignment.title}
                        </h3>
                        <p className="mb-4 text-gray-700">
                            {selectedAssignment.description}
                        </p>
                        <p className="mb-4 text-sm text-gray-500">
                            Due:{" "}
                            {new Date(
                                selectedAssignment.due_date
                            ).toLocaleDateString()}
                        </p>

                        <h4 className="font-semibold mb-2">Submissions</h4>
                        <ul className="space-y-4">
                            {selectedAssignment.submissions?.length > 0 ? (
                                selectedAssignment.submissions.map(
                                    (submission) => (
                                        <li
                                            key={submission.id}
                                            className="border rounded p-4 bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium">
                                                    {submission.student
                                                        ? `${submission.student.firstname}`
                                                        : "Unknown Student"}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Submitted:{" "}
                                                    {submission.created_at
                                                        ? new Date(
                                                              submission.created_at
                                                          ).toLocaleString()
                                                        : "-"}
                                                </p>
                                                <div className="flex flex-col md:flex-row md:items-center gap-2 mt-2">
                                                    <input
                                                        type="text"
                                                        value={
                                                            gradingData[
                                                                submission.id
                                                            ]?.grade ??
                                                            submission.grade ??
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            setGradingData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    [submission.id]:
                                                                        {
                                                                            ...prev[
                                                                                submission
                                                                                    .id
                                                                            ],
                                                                            grade: e
                                                                                .target
                                                                                .value,
                                                                        },
                                                                })
                                                            )
                                                        }
                                                        className="border p-1 w-20 rounded"
                                                        placeholder="Grade"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={
                                                            gradingData[
                                                                submission.id
                                                            ]?.feedback ??
                                                            submission.feedback ??
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            setGradingData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    [submission.id]:
                                                                        {
                                                                            ...prev[
                                                                                submission
                                                                                    .id
                                                                            ],
                                                                            feedback:
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                        },
                                                                })
                                                            )
                                                        }
                                                        className="border p-1 w-40 rounded"
                                                        placeholder="Feedback"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateGrade(
                                                                submission.id
                                                            )
                                                        }
                                                        className="px-3 py-1 bg-purple-600 text-white rounded text-sm"
                                                    >
                                                        Save
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <a
                                                    href={`/submissions/${submission.assignment_folder}`}
                                                    target="_blank"
                                                    className="text-purple-600 underline"
                                                >
                                                    View Submission
                                                </a>
                                            </div>
                                        </li>
                                    )
                                )
                            ) : (
                                <li className="text-gray-400">
                                    No submissions yet.
                                </li>
                            )}
                        </ul>
                        {selectedAssignment.submissions?.length > 0 && (
                            <button
                                onClick={() => {
                                    setGradingAll(true);
                                    selectedAssignment.submissions.forEach(
                                        (submission) => {
                                            if (gradingData[submission.id]) {
                                                updateGrade(submission.id);
                                            }
                                        }
                                    );
                                    setTimeout(
                                        () => setGradingAll(false),
                                        1000
                                    );
                                }}
                                className="mt-6 px-4 py-2 bg-green-600 text-white rounded"
                                disabled={gradingAll}
                            >
                                {gradingAll ? "Saving..." : "Save All Grades"}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

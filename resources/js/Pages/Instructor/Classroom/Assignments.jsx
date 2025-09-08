import { useState, useEffect, React } from "react";
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

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                if (!classId) {
                    console.warn(
                        "No classId provided to Assignments component."
                    );
                    return;
                }

                const res = await axios.get(`/fetch/assignments/${classId}`);
                console.log("Assignments:", res.data.assignments);
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
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
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

    useEffect(() => {
        if (selectedAssignment) {
            document
                .getElementById("assignemtn-details")
                ?.scrollIntoView({ behavior: "smooth" });
        }
    });

    const updateGrade = async (submissionId) => {
        const data = gradingData[submissionId];
        if (!data) return;

        const res = await axios.post(`/`);
    };

    return (
        <>
            <div>
                <form
                    onSubmit={handleAddAssignment}
                    encType="multipart/form-data"
                    className="mb-6 space-y-4"
                >
                    <div>
                        <label className="block font-semibold mb-1">
                            Assignment Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            placeholder="Title"
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full border p-3 rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block font-semibold mb-1">
                            Assignment Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Description"
                            className="w-full border p-3 rounded"
                        />
                    </div>
                    <div>
                        <label className="block font-semibold mb-1">
                            Due Date
                        </label>
                        <input
                            type="date"
                            value={duedate}
                            onChange={(e) => setDuedate(e.target.value)}
                            className="w-full border p-3 rounded"
                            required
                        />
                    </div>
                    <div>
                        <label>Upload Assignment File</label>
                        <input
                            type="file"
                            onChange={(e) => setAttachment(e.target.files[0])}
                            className="w-full border p-3 rounded"
                        />
                    </div>

                    <button
                        type="submit"
                        className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-md"
                        disabled={assignmentProcessing}
                    >
                        {assignmentProcessing ? "Uploading" : "Upload"}
                    </button>
                </form>

                <div className="flex gap-2 mb-4">
                    {[
                        {
                            label: "Ongoing",
                            key: "ongoing",
                            color: "green",
                        },
                        {
                            label: "Past Due",
                            key: "pastDue",
                            color: "red",
                        },
                        {
                            label: "Completed",
                            key: "completed",
                            color: "blue",
                        },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setAssignmentTab(tab.key)}
                            className={`px-4 py-2 rounded-t font-semibold border-b-2 focus:outline-none ${
                                assignmentTab === tab.key
                                    ? `border-${tab.color}-600 text-${tab.color}-600 bg-${tab.color}-50`
                                    : "border-transparent text-gray-500 bg-white"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <ul className="space-y-4 mb-6">
                    {getAssignmentsByStatus(assignmentTab).map((assignment) => (
                        <li
                            key={assignment.id}
                            className="border rounded-lg p-4 bg-white shadow cursor-pointer hover:bg-gray transition"
                            onClick={() => setSelectedAssignment(assignment)}
                            title="Click to view and grade submissions"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-semibold flex items-center gap-2">
                                        {assignment.title}
                                        <span
                                            className={`inline-block px-2 py-0.5 rounded text-xs bg-${
                                                assignmentTab === "ongoing"
                                                    ? "green"
                                                    : assignmentTab ===
                                                      "pastDue"
                                                    ? "red"
                                                    : "blue"
                                            }-100 text-${
                                                assignmentTab === "ongoing"
                                                    ? "green"
                                                    : assignmentTab ===
                                                      "pastDue"
                                                    ? "red"
                                                    : "blue"
                                            }-700 ml-2`}
                                        >
                                            {assignmentTab
                                                .charAt(0)
                                                .toUpperCase() +
                                                assignmentTab.slice()}
                                        </span>
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Due:{" "}
                                        {new Date(
                                            assignment.due_date
                                        ).toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {assignment.submissions?.length || 0}{" "}
                                        submission(s)
                                    </p>
                                </div>
                            </div>
                        </li>
                    ))}
                    {getAssignmentsByStatus(assignmentTab).length === 0 && (
                        <li className="text-gray-500 text-center py-8">
                            No Assignment in this category.
                        </li>
                    )}
                </ul>
                {selectedAssignment && (
                    <div className="fixed inset-0 z-50 items-center justify-center bg-black bg-opacity-30">
                        <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6 relative animate-fade-in overflow-y-auto max-h-[90vh]">
                            <button
                                onClick={() => setSelectedAssignment(null)}
                                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-lg"
                                title="Close"
                            >
                                ×
                            </button>
                            <h3 className="text-lg font-bold mb-2">
                                {selectedAssignment.title}b
                            </h3>
                            <h3 className="mb-2 text-gray-700">
                                {selectedAssignment.description}
                            </h3>
                            <p className="mb-4 text-sm text-gray-500">
                                Due:{" "}
                                {new Date(
                                    selectedAssignment.due_date
                                ).toLocaleDateString()}
                            </p>
                            <h4 className="font-semibold mb-2">Submissions</h4>
                            <ul className="space-y-4">
                                {selectedAssignment.submissions &&
                                selectedAssignment.submissions.length > 0 ? (
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
                                                        <label className="text-sm mr-2">
                                                            Grade:
                                                        </label>
                                                        <input
                                                            type="text"
                                                            defaultValue={
                                                                submission.grade ||
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
                                                        />
                                                        <label className="text-sm ml-4 mr-2">
                                                            Feedback:
                                                        </label>
                                                        <input
                                                            type="text"
                                                            defaultValue={
                                                                submission.feedback ||
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
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateGrade(
                                                                    submission.id
                                                                )
                                                            }
                                                            className="ml-2 px-3 py-1 bg-purple-600 text-white rounded text-sm"
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
                            {selectedAssignment.submissions &&
                                selectedAssignment.submissions.length > 0 && (
                                    <button
                                        onClick={() => {
                                            setGradingAll(true);
                                            selectedAssignment.submissions.forEach(
                                                (submission) => {
                                                    if (
                                                        gradingData[
                                                            submission.id
                                                        ]
                                                    ) {
                                                        updateGrade(
                                                            submission.id
                                                        );
                                                    }
                                                }
                                            );
                                            setTimeout(() =>
                                                setGradingAll(false)
                                            ),
                                                1000;
                                        }}
                                        className="mt-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                        disabled={gradingAll}
                                    >
                                        {gradinAll
                                            ? "Saving..."
                                            : "Save All Grades"}
                                    </button>
                                )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

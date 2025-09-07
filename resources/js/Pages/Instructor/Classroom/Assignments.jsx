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
                                {selectedAssignment.title}
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
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

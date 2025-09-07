import { useState, useEffect, React } from "react";
import usePage from "@inertiajs/react";
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
            </div>
        </>
    );
}

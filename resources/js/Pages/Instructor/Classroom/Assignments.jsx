import { useState, useEffect, React } from "react";
import axios from "axios";

export default function Assignments({ classId }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [duedate, setDuedate] = useState("");
    const [attachment, setAttachment] = useState("");
    const [assignments, setAssignments] = useState([]);
    const [assignmentProcessing, setAssignmentProcessing] = useState(false);

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

    const handleAddAssignment = async (e) => {};

    return (
        <>
            <div>Hello</div>
        </>
    );
}

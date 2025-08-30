import { useState, useEffect, React } from "react";
import axios from "axios";

export default function Threads({ classId }) {
    const [initialThreads, setInitialThreads] = useState([]);
    const [threads, setThreads] = useState(initialThreads);

    console.log("Classroom ID:", classId);

    useEffect(() => {
        const fetchThreads = async () => {
            try {
                if (!classId) {
                    console.warn("No classId provided to Threads component.");
                    return;
                }

                const res = await axios.get(`/threads/${classId}`);
                console.log("Initial Threads:", res.data.threads);
                setInitialThreads(res.data.threads);
            } catch (error) {
                console.error("Error fetching initial threads.", error);
            }
        };
        fetchThreads();
        const interval = setInterval(fetchThreads, 1000);
        return () => clearInterval(interval);
    }, [classId]);

    const handleCreateThread = (e) => {};
    return (
        <div>
            <form onSubmit={handleCreateThread} className="mb-6"></form>
        </div>
    );
}

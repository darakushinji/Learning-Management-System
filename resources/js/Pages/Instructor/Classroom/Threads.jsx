import { useState, useEffect, React } from "react";
import axios from "axios";

export default function Threads({ classId }) {
    const [threadData, setThreadData] = useState("");
    const [threads, setThreads] = useState([]);

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
                setThreads(res.data.threads);
            } catch (error) {
                console.error("Error fetching initial threads.", error);
            }
        };
        fetchThreads();
        const interval = setInterval(fetchThreads, 1000);
        return () => clearInterval(interval);
    }, [classId]);

    const handleCreateThread = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post(`/classroom/${classId}/threads`, {
                message: threadData,
            });
            setThreads((prev) => [res.data.thread, ...prev]);
            setThreadData("");
        } catch (error) {
            alert("Tangina hindi gumana tol");
            console.error("Error starting discussions.", error);
        }
    };

    const handleReply = async (e) => {};
    return (
        <div>
            <form onSubmit={handleCreateThread} className="mb-6">
                <textarea
                    value={threadData}
                    onChange={(e) => setThreadData(e.target.value)}
                    className="w-full border p-3 rounded"
                    rows="3"
                    required
                />

                <button
                    type="submit"
                    className="mt-2 bg-purple-500 text-white px-4 py-2"
                >
                    Post Thread
                </button>
            </form>
            <div className="space-y-6">
                {threads?.map((thread) => (
                    <div
                        key={thread.id}
                        className="border p-4 rounded-lg bg-white shadow-sm"
                    >
                        <div className="flex items-center mb-2">
                            <span className="font-semibold">
                                {thread?.user?.firstname || "Anonymous"}
                            </span>
                            <span className="text-gray-400 text-sm ml-2">
                                {new Date(thread.created_at).toLocaleString()}
                            </span>
                        </div>
                        <p className="mb-4">{thread?.message || ""}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

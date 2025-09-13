import { useState, useEffect, React } from "react";
import axios from "axios";

export default function Threads({ classId }) {
    const [threadData, setThreadData] = useState("");
    const [threads, setThreads] = useState([]);
    const [replyData, setReplyData] = useState({
        thread_id: null,
        message: "",
    });
    const [replyProcessing, setReplyProcessing] = useState(false);

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

    const handleReplyClick = (threadId) => {
        setReplyData({ thread_id: threadId, message: "" });
    };

    const handleCreateReply = async (threadId, e) => {
        e.preventDefault();
        if (!replyData.message) return;

        setReplyProcessing(true);

        try {
            const res = await axios.post(`/threads/${threadId}/replies`, {
                message: replyData.message,
            });
            setThreads((prev) =>
                prev.map((thread) =>
                    thread.id === threadId
                        ? {
                              ...thread,
                              replies: [
                                  res.data.reply,
                                  ...(thread.replies || []),
                              ],
                          }
                        : thread
                )
            );

            alert("Success");

            setReplyData({ thread_id: null, message: "" });
        } catch (error) {
            console.error("Error posting reply:", error);
        } finally {
            setReplyProcessing(false);
        }
    };

    const resetReply = async (e) => {};
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
                            <img
                                src={
                                    thread?.user?.profile_picture
                                        ? `/${thread.user.profile_picture}`
                                        : "/default-avatar.png"
                                }
                                alt="profile"
                                className="w-8 h-8 rounded-full mr-2 object-cover border"
                            />
                            <span className="font-semibold">
                                {thread?.user?.firstname || "Anonymous"}
                            </span>
                            <span className="text-gray-400 text-sm ml-2">
                                {new Date(thread.created_at).toLocaleString()}
                            </span>
                        </div>
                        <p className="mb-4">{thread?.message || ""}</p>
                        <button
                            onClick={() => handleReplyClick(thread.id)}
                            className="text-sm text-purple-600 mt-2"
                        >
                            Reply
                        </button>
                        {replyData.thread_id === thread.id && (
                            <form
                                onSubmit={(e) =>
                                    handleCreateReply(thread.id, e)
                                }
                                className="ml-6 mt-4"
                            >
                                <textarea
                                    value={replyData.message}
                                    onChange={(e) =>
                                        setReplyData({
                                            ...replyData,
                                            message: e.target.value,
                                        })
                                    }
                                    placeholder="write your reply..."
                                    className="w-full border p-2 rounded-md"
                                    rows="2"
                                />
                                <div className="flex space-x-2 mt-2">
                                    <button
                                        type="submit"
                                        className="bg-purple-600 text-white px-3 py-1 rounded-md"
                                        disabled={replyProcessing}
                                    >
                                        Post Reply
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetReply}
                                        className="bg-gray-200 px-3 py-1 rounded"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}

                        {thread.replies?.length > 0 && (
                            <div className="mt-4 ml-6 space-y-4">
                                {thread.replies.map((reply) => (
                                    <div
                                        key={reply.id}
                                        className="border-l-2 pl-4 py-2"
                                    >
                                        <div className="flex items-start mb-1">
                                            <img
                                                src={
                                                    reply?.user?.profile_picture
                                                        ? `/${reply.user.profile_picture}`
                                                        : "/default-avatar.png"
                                                }
                                                alt="profile"
                                                className="w-8 h-8 rounded-full mr-2 object-cover border"
                                            />

                                            <div className="flex flex-col">
                                                <span className="font-semibold">
                                                    {reply?.user?.firstname ||
                                                        "Anonymous"}
                                                </span>

                                                <p className="ml-1">
                                                    {reply?.message || ""}
                                                </p>

                                                <span className="text-gray-400 text-sm ml-1">
                                                    {new Date(
                                                        reply.created_at
                                                    ).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

import { useEffect, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import axios from "axios";
import {
    BellIcon,
    CheckCircleIcon,
    ClipboardDocumentListIcon,
    AcademicCapIcon,
} from "@heroicons/react/24/outline";

export default function Notification() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/notifications");
            setNotifications(res.data);
        } catch (err) {
            setNotifications([]);
        }
        setLoading(false);
    };

    const markAsRead = async (id) => {
        await axios.post(`/notifications/${id}/read`);
        fetchNotifications();
    };

    // Detect notification type
    const getNotificationType = (notif) => {
        if (notif.type && notif.type.includes("Assignment"))
            return "assignment";
        if (notif.type && notif.type.includes("SubmissionGraded"))
            return "graded";
        if (notif.type && notif.type.includes("StudentAddedToClass"))
            return "student_added";
        if (notif.type && notif.type.includes("StudentRemovedToClass"))
            return "student_removed";
        return "material";
    };

    // Render notification content
    const renderNotificationContent = (notif, type) => {
        if (type === "graded") {
            return (
                <div>
                    <p className="font-semibold text-lg text-green-800 flex items-center gap-2">
                        <AcademicCapIcon className="h-5 w-5" />
                        Submission graded!
                    </p>
                    <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-600">
                        <span>
                            <span className="font-medium">Grade:</span>{" "}
                            {notif.data.grade ?? "-"}
                        </span>
                        <span>
                            <span className="font-medium">Feedback:</span>{" "}
                            {notif.data.feedback ?? "-"}
                        </span>
                    </div>
                </div>
            );
        }

        if (type === "assignment") {
            return (
                <>
                    <p className="font-semibold text-lg text-purple-800 flex items-center gap-2">
                        <ClipboardDocumentListIcon className="h-5 w-5" />
                        New assignment posted:{" "}
                        <span className="text-black">{notif.data.title}</span>
                    </p>
                    <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-600">
                        <span>
                            <span className="font-medium">Class:</span>{" "}
                            {notif.data.class_name}
                        </span>
                        <span>
                            <span className="font-medium">Due date:</span>{" "}
                            {new Date(notif.data.due_date).toLocaleString()}
                        </span>
                    </div>
                </>
            );
        }

        if (type === "student_added") {
            return (
                <div>
                    <p className="font-semibold text-lg text-blue-800 flex items-center gap-2">
                        <BellIcon className="h-5 w-5" />
                        You’ve been added to{" "}
                        <span className="text-black">
                            {notif.data.class_name}
                        </span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                        Added at:{" "}
                        {new Date(notif.data.added_at).toLocaleString()}
                    </p>
                </div>
            );
        }

        if (type === "student_removed") {
            return (
                <div>
                    <p className="font-semibold text-lg text-blue-800 flex items-center gap-2">
                        <BellIcon className="h-5 w-5" />
                        You’ve been removed from{" "}
                        <span className="text-black">
                            {notif.data.class_name}
                        </span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                        Removed at:{" "}
                        {new Date(notif.data.removed_at).toLocaleString()}
                    </p>
                </div>
            );
        }

        // Default → material
        return (
            <>
                <p className="font-semibold text-lg text-purple-800 flex items-center gap-2">
                    <BellIcon className="h-5 w-5" />
                    New material uploaded:{" "}
                    <span className="text-black">{notif.data.title}</span>
                </p>
                <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-600">
                    <span>
                        <span className="font-medium">Class:</span>{" "}
                        {notif.data.class_name}
                    </span>
                    <span>
                        <span className="font-medium">Uploaded at:</span>{" "}
                        {new Date(notif.data.uploaded_at).toLocaleString()}
                    </span>
                </div>
            </>
        );
    };

    return (
        <AuthenticatedLayout>
            <div className="min-h-screen max-w-2xl mx-auto p-6">
                <div className="flex items-center gap-3 mb-6">
                    <BellIcon className="h-8 w-8 text-purple-600" />
                    <h1 className="text-3xl font-bold">Notifications</h1>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-32">
                        <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></span>
                        <span className="ml-3 text-gray-500">Loading...</span>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center mt-10">
                        <BellIcon className="h-12 w-12 text-gray-300 mb-2" />
                        <p className="text-gray-500">No notifications found.</p>
                    </div>
                ) : (
                    <ul className="space-y-4">
                        {notifications.map((notif) => {
                            const type = getNotificationType(notif);
                            return (
                                <li
                                    key={notif.id}
                                    className={`p-5 rounded-lg shadow flex items-center gap-4 ${
                                        notif.read_at
                                            ? "bg-gray-100"
                                            : "bg-purple-50 border-l-4 border-purple-600"
                                    }`}
                                >
                                    <div className="flex-1">
                                        {renderNotificationContent(notif, type)}
                                    </div>

                                    {!notif.read_at ? (
                                        <button
                                            onClick={() => markAsRead(notif.id)}
                                            className="flex items-center gap-1 text-xs bg-purple-600 hover:bg-purple-700 transition text-white px-4 py-2 rounded shadow"
                                        >
                                            <CheckCircleIcon className="h-4 w-4" />
                                            Mark as read
                                        </button>
                                    ) : (
                                        <span className="flex items-center gap-1 text-xs text-green-600">
                                            <CheckCircleIcon className="h-4 w-4" />
                                            Read
                                        </span>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

import { useForm, usePage, router, Link } from "@inertiajs/react";
import InstructorLayout from "@/Layouts/InstructorLayout";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { FiVideo } from "react-icons/fi";
import Threads from "./Classroom/Threads";
import "react-toastify/dist/ReactToastify.css";

export default function Classroom({
    classroom = { students: [] },
    students = [],
    initialThreads = [],
    quizzes = [],
    submissions = [],
}) {
    const { class_id } = usePage().props;
    console.log("Or from classroom.id:", classroom?.id);
    const { props } = usePage();
    const [activeTab, setActiveTab] = useState("threads");
    const [threads, setThreads] = useState(initialThreads);
    const [materials, setMaterials] = useState(props.materials || []);
    const [gradingData, setGradingData] = useState({});
    const [assignmentTab, setAssignmentTab] = useState("ongoing");
    const [gradingAll, setGradingAll] = useState(false);
    const [quizList, setQuizList] = useState(quizzes);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [questions, setQuestions] = useState([
        {
            question_text: "",
            correct_choice: "A",
            choices: [
                { label: "A", text: "" },
                { label: "B", text: "" },
                { label: "C", text: "" },
                { label: "D", text: "" },
            ],
        },
    ]);
    console.log("This is the Class ID:", class_id);
    console.log("Submissions:", submissions);
    // Quiz form
    const {
        data: quizData,
        setData: setQuizData,
        post: postQuiz,
        processing: quizProcessing,
        reset: resetQuiz,
        errors: quizErrors,
    } = useForm({
        class_id: classroom.id,
        title: "",
        description: "",
        start_time: "",
        end_time: "",
        duration_minutes: "",
        questions: questions,
    });

    useEffect(() => {
        setQuizList(quizzes);
    }, [quizzes]);

    // Quiz handlers
    const handleQuizInputChange = (e) => {
        setQuizData(e.target.name, e.target.value);
    };

    const handleQuestionChange = (idx, field, value) => {
        const updated = [...questions];
        updated[idx][field] = value;
        setQuestions(updated);
        setQuizData("questions", updated);
    };

    const handleChoiceChange = (qIdx, cIdx, value) => {
        const updated = [...questions];
        updated[qIdx].choices[cIdx].text = value;
        setQuestions(updated);
        setQuizData("questions", updated);
    };

    const handleCorrectChoiceChange = (qIdx, value) => {
        const updated = [...questions];
        updated[qIdx].correct_choice = value;
        setQuestions(updated);
        setQuizData("questions", updated);
    };

    const addQuestion = () => {
        setQuestions([
            ...questions,
            {
                question_text: "",
                correct_choice: "A",
                choices: [
                    { label: "A", text: "" },
                    { label: "B", text: "" },
                    { label: "C", text: "" },
                    { label: "D", text: "" },
                ],
            },
        ]);
    };

    const removeQuestion = (idx) => {
        if (questions.length === 1) return;
        const updated = questions.filter((_, i) => i !== idx);
        setQuestions(updated);
        setQuizData("questions", updated);
    };

    const handleCreateQuiz = (e) => {
        e.preventDefault();
        postQuiz(route("quiz.store", classroom.id), {
            onSuccess: (...args) => {
                resetQuiz();
                setQuestions([
                    {
                        question_text: "",
                        correct_choice: "A",
                        choices: [
                            { label: "A", text: "" },
                            { label: "B", text: "" },
                            { label: "C", text: "" },
                            { label: "D", text: "" },
                        ],
                    },
                ]);
                router.reload({ only: ["quizzes"] });
                toast.success("Quiz created successfully.");
            },
            onError: () => {
                toast.error("Failed to create quiz. Please check your input.");
            },
        });
    };

    useEffect(() => {
        setThreads(props.initialThreads || []);
    }, [props.initialThreads]);

    const { id: classroomId } = classroom || {};

    const [selectedAssignment, setSelectedAssignment] = useState(null);

    useEffect(() => {
        if (selectedAssignment) {
            document
                .getElementById("assignment-details")
                ?.scrollIntoView({ behavior: "smooth" });
        }
    }, [selectedAssignment]);

    const {
        data: studentData,
        setData: setStudentData,
        post: postStudent,
        processing: studentProcessing,
        reset: resetStudent,
    } = useForm({ student_id: "" });

    const {
        data: threadData,
        setData: setThreadData,
        post: postThread,
        processing: threadProcessing,
        reset: resetThread,
    } = useForm({ message: "" });

    const {
        data: replyData,
        setData: setReplyData,
        post: postReply,
        processing: replyProcessing,
        reset: resetReply,
    } = useForm({ thread_id: "", message: "" });

    const {
        data: materialData,
        setData: setMaterialData,
        post: postMaterial,
        processing: materialProcessing,
        reset: materialReset,
        progress,
    } = useForm({ title: "", materials_folder: null, class_id: classroom.id });

    const {
        data: assignmentData,
        setData: setAssignmentData,
        post: postAssignment,
        processing: assignmentProcessing,
        reset: resetAssignment,
    } = useForm({
        title: "",
        file: null,
        due_date: "",
        classroom_id: classroomId, // Ensure classroomId is available
    });

    const handleAddStudent = (e) => {
        e.preventDefault();
        postStudent(route("instructor.classroom.addStudent", classroom.id), {
            onSuccess: () => resetStudent(),
        });
    };

    const handleCreateThread = (e) => {
        e.preventDefault();
        postThread(route("thread.store", classroom.id), {
            onSuccess: () => {
                resetThread();
                setThreads([...props.initialThreads]);
            },
        });
    };

    const handleCreateReply = (threadId, e) => {
        e.preventDefault();
        postReply(route("thread.reply", threadId), {
            onSuccess: () => {
                resetReply();
                setThreads([...props.initialThreads]);
            },
        });
    };

    const handleReplyClick = (threadId) => {
        setReplyData({ ...replyData, thread_id: threadId, message: "" });
    };

    const handleAddMaterial = (e) => {
        e.preventDefault();
        postMaterial(route("materials.store", { classroom: classroom.id }), {
            forceFormData: true,
            onSuccess: (response) => {
                materialReset();
                let newMaterial = response?.material || materialData;
                if (!newMaterial.id) {
                    newMaterial = {
                        ...newMaterial,
                        id: `temp-${Date.now()}-${Math.random()}`,
                        created_at: new Date().toISOString(),
                    };
                }
                setMaterials((prev) => [newMaterial, ...(prev || [])]);
                setActiveTab("materials");
            },
            onError: (errors) => {
                console.error("Upload error:", errors);
            },
        });
    };

    const handleCreateAssignment = (e) => {
        e.preventDefault();
        postAssignment(
            route("assignments.store", { classroom: classroom.id }),
            {
                forceFormData: true,
                onSuccess: () => {
                    console.log("Assignment uploaded!");
                    resetAssignment();
                    window.location.reload();
                },
                onError: (errors) => {
                    console.error("Upload failed:", errors);
                },
            }
        );
    };

    const updateGrade = (submissionId) => {
        const data = gradingData[submissionId];
        if (!data) return;

        router.put(`/submissions/${submissionId}/grade`, data, {
            onSuccess: () => {
                toast.success("Grade updated!");
            },
            onError: () => {
                toast.error("Failed to update");
            },
        });
    };

    const getAssignmentsByStatus = (status) => {
        const now = new Date();
        if (!props.assignments) return [];
        if (status === "ongoing") {
            return props.assignments.filter((a) => new Date(a.due_date) >= now);
        } else if (status === "pastDue") {
            return props.assignments.filter(
                (a) =>
                    new Date(a.due_date) < now &&
                    (!a.submissions || a.submissions.length === 0)
            );
        } else if (status === "completed") {
            return props.assignments.filter(
                (a) => a.submissions && a.submissions.length > 0
            );
        }
        return props.assignments;
    };

    return (
        <InstructorLayout>
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between border-b pb-4 mb-4">
                    <div>
                        {" "}
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
                        className="text-purple-600 hover:text-purple-800 text-3xl p-2 rounded-full transition"
                    >
                        <FiVideo />
                    </Link>
                </div>

                {/* Tab Buttons */}
                <div className="flex space-x-4 border-b mb-4">
                    {[
                        "threads",
                        "thread sample",
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

                {/* Tab Content */}
                <div className="mt-4">
                    {/* THREADS */}
                    {activeTab === "threads" && (
                        <div>
                            {/* Create Thread */}
                            <form
                                onSubmit={handleCreateThread}
                                className="mb-6"
                            >
                                <textarea
                                    value={threadData.message}
                                    onChange={(e) =>
                                        setThreadData("message", e.target.value)
                                    }
                                    placeholder="Start a new discussion..."
                                    className="w-full border p-3 rounded"
                                    rows="3"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="mt-2 bg-purple-600 text-white px-4 py-2 rounded"
                                    disabled={threadProcessing}
                                >
                                    Post Thread
                                </button>
                            </form>

                            {/* Threads List */}
                            <div className="space-y-6">
                                {threads?.map((thread) => (
                                    <div
                                        key={thread.id}
                                        className="border p-4 rounded-lg bg-white shadow-sm"
                                    >
                                        <div className="flex items-center mb-2">
                                            <span className="font-semibold">
                                                {thread?.user?.firstname ||
                                                    "Anonymous"}
                                            </span>
                                            <span className="text-gray-400 text-sm ml-2">
                                                {new Date(
                                                    thread.created_at
                                                ).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="mb-4">
                                            {thread?.message || ""}
                                        </p>

                                        {/* Reply Form */}
                                        {replyData.thread_id === thread.id && (
                                            <form
                                                onSubmit={(e) =>
                                                    handleCreateReply(
                                                        thread.id,
                                                        e
                                                    )
                                                }
                                                className="ml-6 mt-4"
                                            >
                                                <textarea
                                                    value={replyData.message}
                                                    onChange={(e) =>
                                                        setReplyData(
                                                            "message",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Write your reply..."
                                                    className="w-full border p-2 rounded"
                                                    rows="2"
                                                    required
                                                />
                                                <div className="flex space-x-2 mt-2">
                                                    <button
                                                        type="submit"
                                                        className="bg-purple-600 text-white px-3 py-1 rounded"
                                                        disabled={
                                                            replyProcessing
                                                        }
                                                    >
                                                        Post Reply
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            resetReply()
                                                        }
                                                        className="bg-gray-200 px-3 py-1 rounded"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        )}

                                        <button
                                            onClick={() =>
                                                handleReplyClick(thread.id)
                                            }
                                            className="text-sm text-purple-600 mt-2"
                                        >
                                            Reply
                                        </button>

                                        {/* Replies */}
                                        {thread.replies?.length > 0 && (
                                            <div className="mt-4 ml-6 space-y-4">
                                                {thread.replies.map((reply) => (
                                                    <div
                                                        key={reply.id}
                                                        className="border-l-2 pl-4 py-2"
                                                    >
                                                        <div className="flex items-center mb-1">
                                                            <span className="font-semibold">
                                                                {reply?.user
                                                                    ?.firstname ||
                                                                    "Anonymous"}
                                                            </span>
                                                            <span className="text-gray-400 text-sm ml-2">
                                                                {new Date(
                                                                    reply.created_at
                                                                ).toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <p>
                                                            {reply?.message ||
                                                                ""}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {threads?.length === 0 && (
                                    <p className="text-gray-500">
                                        No discussion threads yet. Start one
                                        above!
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "thread sample" && (
                        <Threads classId={classroom.id}></Threads>
                    )}

                    {activeTab === "materials" && (
                        <div>
                            {/* Upload Form */}
                            <form
                                onSubmit={handleAddMaterial}
                                encType="multipart/form-data"
                                className="mb-6 space-y-4"
                            >
                                <div>
                                    <label className="block font-semibold mb-1">
                                        Material Title
                                    </label>
                                    <input
                                        type="text"
                                        value={materialData.title}
                                        onChange={(e) =>
                                            setMaterialData(
                                                "title",
                                                e.target.value
                                            )
                                        }
                                        className="w-full border p-3 rounded"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">
                                        Upload Material
                                    </label>
                                    <input
                                        type="file"
                                        onChange={(e) =>
                                            setMaterialData(
                                                "materials_folder",
                                                e.target.files[0]
                                            )
                                        }
                                        className="w-full border p-3 rounded"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="mt-4 bg-purple-600 text-white px-4 py-2 rounded"
                                    disabled={materialProcessing}
                                >
                                    {materialProcessing
                                        ? "Uploading..."
                                        : "Upload"}
                                </button>
                            </form>
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold">
                                    Uploaded Materials
                                </h2>
                                {materials.length === 0 ? (
                                    <p className="text-gray-500">
                                        No materials uploaded yet.
                                    </p>
                                ) : (
                                    <ul className="space-y-2">
                                        {materials.map((material) => (
                                            <li
                                                key={material.id}
                                                className="border p-4 rounded shadow-sm bg-white"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <h3 className="font-medium">
                                                            {material.title}
                                                        </h3>
                                                        <a
                                                            href={`/materials/${material.materials_folder}`}
                                                            target="_blank"
                                                        >
                                                            View/Download
                                                        </a>
                                                    </div>
                                                    <span className="text-sm text-gray-400">
                                                        {new Date(
                                                            material.created_at
                                                        ).toLocaleString()}
                                                    </span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "assignments" && (
                        <div>
                            {/* Assignment Creation Form */}
                            <form
                                onSubmit={handleCreateAssignment}
                                encType="multipart/form-data"
                                className="mb-6 space-y-4"
                            >
                                <div>
                                    <label className="block font-semibold mb-1">
                                        Assignment Title
                                    </label>
                                    <input
                                        type="text"
                                        value={assignmentData.title}
                                        onChange={(e) =>
                                            setAssignmentData(
                                                "title",
                                                e.target.value
                                            )
                                        }
                                        className="w-full border p-3 rounded"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">
                                        Upload Assignment File
                                    </label>
                                    <input
                                        type="file"
                                        onChange={(e) =>
                                            setAssignmentData(
                                                "file",
                                                e.target.files[0]
                                            )
                                        }
                                        className="w-full border p-3 rounded"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">
                                        Due Date
                                    </label>
                                    <input
                                        type="date"
                                        value={assignmentData.due_date}
                                        onChange={(e) =>
                                            setAssignmentData(
                                                "due_date",
                                                e.target.value
                                            )
                                        }
                                        className="w-full border p-3 rounded"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="mt-4 bg-purple-600 text-white px-4 py-2 rounded"
                                    disabled={assignmentProcessing}
                                >
                                    {assignmentProcessing
                                        ? "Uploading..."
                                        : "Upload Assignment"}
                                </button>
                            </form>
                            {/* Assignment Status Tabs */}
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
                                        onClick={() =>
                                            setAssignmentTab(tab.key)
                                        }
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
                            {/* Assignment List by Tab */}
                            <ul className="space-y-4 mb-6">
                                {getAssignmentsByStatus(assignmentTab).map(
                                    (assignment) => (
                                        <li
                                            key={assignment.id}
                                            className="border rounded-lg p-4 bg-white shadow cursor-pointer hover:bg-gray-50 transition"
                                            onClick={() =>
                                                setSelectedAssignment(
                                                    assignment
                                                )
                                            }
                                            title="Click to view and grade submissions"
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h3 className="font-semibold flex items-center gap-2">
                                                        {assignment.title}
                                                        <span
                                                            className={`inline-block px-2 py-0.5 rounded text-xs bg-${
                                                                assignmentTab ===
                                                                "ongoing"
                                                                    ? "green"
                                                                    : assignmentTab ===
                                                                      "pastDue"
                                                                    ? "red"
                                                                    : "blue"
                                                            }-100 text-${
                                                                assignmentTab ===
                                                                "ongoing"
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
                                                                assignmentTab.slice(
                                                                    1
                                                                )}
                                                        </span>
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
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
                                                <span className="text-purple-600 text-sm font-medium">
                                                    Grade & Details →
                                                </span>
                                            </div>
                                        </li>
                                    )
                                )}
                                {getAssignmentsByStatus(assignmentTab)
                                    .length === 0 && (
                                    <li className="text-gray-500 text-center py-8">
                                        No assignments in this category.
                                    </li>
                                )}
                            </ul>
                            {/* Assignment Details Modal for Grading */}
                            {selectedAssignment && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                                    <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6 relative animate-fade-in overflow-y-auto max-h-[90vh]">
                                        <button
                                            onClick={() =>
                                                setSelectedAssignment(null)
                                            }
                                            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-lg"
                                            title="Close"
                                        >
                                            ×
                                        </button>
                                        <h3 className="text-lg font-bold mb-2">
                                            {selectedAssignment.title}
                                        </h3>
                                        <p className="mb-2 text-gray-700">
                                            {selectedAssignment.description}
                                        </p>
                                        <p className="mb-4 text-sm text-gray-500">
                                            Due:{" "}
                                            {new Date(
                                                selectedAssignment.due_date
                                            ).toLocaleString()}
                                        </p>
                                        <h4 className="font-semibold mb-2">
                                            Submissions
                                        </h4>
                                        <ul className="space-y-4">
                                            {selectedAssignment.submissions &&
                                            selectedAssignment.submissions
                                                .length > 0 ? (
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
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            setGradingData(
                                                                                (
                                                                                    prev
                                                                                ) => ({
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
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            setGradingData(
                                                                                (
                                                                                    prev
                                                                                ) => ({
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
                                                                    View
                                                                    Submission
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
                                            selectedAssignment.submissions
                                                .length > 0 && (
                                                <button
                                                    onClick={() => {
                                                        setGradingAll(true);
                                                        selectedAssignment.submissions.forEach(
                                                            (submission) => {
                                                                if (
                                                                    gradingData[
                                                                        submission
                                                                            .id
                                                                    ]
                                                                ) {
                                                                    updateGrade(
                                                                        submission.id
                                                                    );
                                                                }
                                                            }
                                                        );
                                                        setTimeout(
                                                            () =>
                                                                setGradingAll(
                                                                    false
                                                                ),
                                                            1000
                                                        );
                                                    }}
                                                    className="mt-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                                    disabled={gradingAll}
                                                >
                                                    {gradingAll
                                                        ? "Saving..."
                                                        : "Save All Grades"}
                                                </button>
                                            )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "quiz" && (
                        <div className="max-w-2xl mx-auto bg-red-500">
                            <div className="mb-8">
                                <h2 className="text-lg font-bold mb-2">
                                    Existing Quizzes
                                </h2>
                                {quizList.length === 0 ? (
                                    <div className="text-gray-500">
                                        No quizzes yet.
                                    </div>
                                ) : (
                                    <ul className="space-y-4">
                                        {quizList.map((quiz) => (
                                            <li
                                                key={quiz.id}
                                                className="border rounded p-4 bg-gray-50"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div className="font-semibold text-purple-700">
                                                        <h3>{quiz.title}</h3>
                                                    </div>
                                                    <p className="text-gray-500 text-sm mb-1">
                                                        {quiz.description}
                                                    </p>
                                                    <span className="text-xs text-gray-500">
                                                        {quiz.questions
                                                            ?.length || 0}{" "}
                                                        question(s)
                                                    </span>
                                                </div>
                                                <button
                                                    className="px-4 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                                                    onClick={() =>
                                                        setSelectedQuiz(quiz)
                                                    }
                                                >
                                                    View
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {selectedQuiz && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                                        <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6 relative animate-fade-in overflow-y-auto max-h-[90vh]">
                                            <button
                                                onClick={() =>
                                                    setSelectedQuiz(null)
                                                }
                                                className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-lg"
                                            >
                                                x
                                            </button>
                                            <h3 className="text-lg font-bold mb-2">
                                                {selectedQuiz.title}
                                            </h3>
                                            <p className="mb-2 text-gray-700">
                                                {selectedQuiz.description}
                                            </p>
                                            <h4 className="mb-4 list-decimal pl-6">
                                                Questions
                                            </h4>
                                            <ol className="mb-4 list-decimal pl-6">
                                                {selectedQuiz.questions?.map(
                                                    (q, idx) => (
                                                        <li
                                                            key={q.id || idx}
                                                            className="mb-2"
                                                        >
                                                            <div className="font-medium">
                                                                {
                                                                    q.question_text
                                                                }
                                                            </div>
                                                            <ul className="ml-4 mt-1">
                                                                {q.choices?.map(
                                                                    (
                                                                        c,
                                                                        cIdx
                                                                    ) => (
                                                                        <li
                                                                            key={
                                                                                c.id ||
                                                                                cIdx
                                                                            }
                                                                            className={
                                                                                q.correct_choice ===
                                                                                c.label
                                                                                    ? "text-green-600"
                                                                                    : ""
                                                                            }
                                                                        >
                                                                            <span className="font-semibold">
                                                                                {
                                                                                    c.label
                                                                                }{" "}
                                                                                .
                                                                            </span>
                                                                            {
                                                                                c.text
                                                                            }
                                                                            {q.correct_choice ===
                                                                                c.label && (
                                                                                <span className="ml-2 text-xs text-green-600">
                                                                                    (Correct)
                                                                                </span>
                                                                            )}
                                                                        </li>
                                                                    )
                                                                )}
                                                            </ul>
                                                        </li>
                                                    )
                                                )}
                                            </ol>
                                            <h4 className="font-semibold mb-2">
                                                Submissions
                                            </h4>
                                            {selectedQuiz.submissions &&
                                            selectedQuiz.submissions.length >
                                                0 ? (
                                                <ul className="space-y-2">
                                                    {selectedQuiz.submissions.map(
                                                        (submission) => (
                                                            <li
                                                                key={
                                                                    submission.id
                                                                }
                                                                className="border rounded p-3 flex justify-between items-center "
                                                            >
                                                                <div>
                                                                    <span>
                                                                        {submission
                                                                            .student
                                                                            ?.firstname ||
                                                                            "Unknown Student"}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-sm">
                                                                        Score:{" "}
                                                                        <span className="font-bold">
                                                                            {submission.score ??
                                                                                "-"}{" "}
                                                                            /{" "}
                                                                            {selectedQuiz
                                                                                .questions
                                                                                ?.length ||
                                                                                0}
                                                                        </span>
                                                                    </span>
                                                                </div>
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            ) : (
                                                <div className="text-gray-500">
                                                    No submissions yet.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <form
                                onSubmit={handleCreateQuiz}
                                className="bg-white p-6 rounded shadow"
                            >
                                <h2 className="text-xl font-semibold">
                                    Create Quiz
                                </h2>
                                <div className="mb-4">
                                    <label className="block font-semibold">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={quizData.title}
                                        onChange={handleQuizInputChange}
                                        className="w-full border rounded px-3 py-2"
                                        required
                                    />
                                    {quizErrors?.title && (
                                        <div className="text-red-500 text-sm">
                                            {quizErrors.title}
                                        </div>
                                    )}
                                </div>
                                <div clasName="mb-4">
                                    <label className="block font-semibold">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={quizData.description}
                                        onChange={handleQuizInputChange}
                                        className="w-full border rounded px-3 py-2"
                                    />
                                    {quizErrors?.description && (
                                        <div className="text-red-500 text-sm">
                                            {quizErrors.description}
                                        </div>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <label className="block font-semibold">
                                        Start Time
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="start_time"
                                        value={quizData.start_time}
                                        onChange={handleQuizInputChange}
                                        className="w-full border rounded px-3 py-2"
                                    />
                                    {quizErrors?.start_time && (
                                        <div className="text-red-500 text-xs">
                                            {quizErrors.start_time}
                                        </div>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <label className="block font-semibold">
                                        End Time
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="end_time"
                                        value={quizData.end_time}
                                        onChange={handleQuizInputChange}
                                        className="w-full border rounded px-3 py-2"
                                    />
                                    {quizErrors?.end_time && (
                                        <div className="text-red-500 text-xs">
                                            {quizErrors.end_time}
                                        </div>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <label className="block font-semibold">
                                        Duration
                                    </label>
                                    <input
                                        type="number"
                                        name="duration_minutes"
                                        value={quizData.duration_minutes}
                                        onChange={handleQuizInputChange}
                                        className="w-full border rounded px-3 py-2"
                                    />
                                    {quizErrors?.duration_minutes && (
                                        <div className="text-red-500 text-xs">
                                            {quizErrors.duration_minutes}
                                        </div>
                                    )}
                                </div>
                                {questions.map((q, idx) => (
                                    <div
                                        key={idx}
                                        className="mb-6 border p-4 rounded bg-gray-50"
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="font-semibold">
                                                Question {idx + 1}
                                            </label>
                                            {questions.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeQuestion(idx)
                                                    }
                                                    className="text-red-500 text-xs"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Question text"
                                            value={q.question_text}
                                            onChange={(e) =>
                                                handleQuestionChange(
                                                    idx,
                                                    "question_text",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full border rounded px-3 py-2 mb-2"
                                            required
                                        />
                                        <div className="mb-2">
                                            <label className="block font-semibold mb-1">
                                                Choices
                                            </label>
                                            {q.choices.map((c, cIdx) => (
                                                <div
                                                    key={c.label}
                                                    className="flex items-center mb-1"
                                                >
                                                    <span className="w-6">
                                                        {c.label}
                                                    </span>
                                                    <input
                                                        type="text"
                                                        placeholder={`Choice ${c.label}`}
                                                        value={c.text}
                                                        onChange={(e) =>
                                                            handleChoiceChange(
                                                                idx,
                                                                cIdx,
                                                                e.target.value
                                                            )
                                                        }
                                                        className="flex-1 border rounded px-2 py-1"
                                                        required
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <div>
                                            <label className="block font-semibold">
                                                Correct Answer
                                            </label>
                                            <select
                                                value={q.correct_choice}
                                                onChange={(e) =>
                                                    handleCorrectChoiceChange(
                                                        idx,
                                                        e.target.value
                                                    )
                                                }
                                                className="border rounded px-2 py-1"
                                            >
                                                <option value="A">A</option>
                                                <option value="B">B</option>
                                                <option value="C">C</option>
                                                <option value="D">D</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addQuestion}
                                    className="mb-4 px-4 py-2 bg-green-500 text-white rounded"
                                >
                                    Add Question
                                </button>
                                <div>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-blue-600 text-white rounded"
                                        disabled={quizProcessing}
                                    >
                                        {quizProcessing
                                            ? "Creating"
                                            : "Create Quiz"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === "members" && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">
                                Class Members
                            </h2>

                            {/* Add Student Form */}
                            <form
                                onSubmit={handleAddStudent}
                                className="flex space-x-4 mb-6"
                            >
                                <select
                                    value={studentData.student_id}
                                    onChange={(e) =>
                                        setStudentData(
                                            "student_id",
                                            e.target.value
                                        )
                                    }
                                    className="border px-3 py-2 rounded w-1/2"
                                    required
                                >
                                    <option value="">
                                        Select a student to add
                                    </option>
                                    {students.map((student) => (
                                        <option
                                            key={student.id}
                                            value={student.id}
                                        >
                                            {student.firstname}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    type="submit"
                                    disabled={studentProcessing}
                                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
                                >
                                    Add Student
                                </button>
                            </form>

                            {/* List of Current Students */}
                            <ul className="space-y-2">
                                {classroom.students.length > 0 ? (
                                    classroom.students.map((student) => (
                                        <li
                                            key={student.id}
                                            className="border px-4 py-2 rounded bg-gray-50"
                                        >
                                            {student.firstname}
                                        </li>
                                    ))
                                ) : (
                                    <li>No students yet.</li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </InstructorLayout>
    );
}

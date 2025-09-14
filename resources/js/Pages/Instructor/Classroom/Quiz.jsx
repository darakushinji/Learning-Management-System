import { useState, useEffect } from "react";
import axios from "axios";

export default function Quiz({ classId }) {
    const [quizList, setQuizList] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [quizData, setQuizData] = useState({
        class_id: classId,
        title: "",
        description: "",
        start_time: "",
        end_time: "",
        duration_minutes: "",
        questions: [
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
        ],
    });

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const res = await axios.get(`/quizzes/${classId}`);
                setQuizList(res.data.quizzes);
            } catch (error) {
                console.error("Error fetching quizzes:", error);
            }
        };
        fetchQuizzes();
        const interval = setInterval(fetchQuizzes, 1000);
        return () => clearInterval(interval);
    }, [classId]);

    useEffect(() => {
        if (quizData.start_time && quizData.end_time) {
            const start = new Date(quizData.start_time);
            const end = new Date(quizData.end_time);

            if (!isNaN(start) && !isNaN(end) && end > start) {
                const diffMs = end - start;
                const diffMins = Math.floor(diffMs / 60000);

                setQuizData((prev) => ({
                    ...prev,
                    duration_minutes: diffMins,
                }));
            }
        }
    }, [quizData.start_time, quizData.end_time]);

    // handlers...
    const handleQuizInputChange = (e) =>
        setQuizData({ ...quizData, [e.target.name]: e.target.value });

    const handleQuestionChange = (idx, field, value) => {
        const updated = [...quizData.questions];
        updated[idx][field] = value;
        setQuizData({ ...quizData, questions: updated });
    };

    const handleChoiceChange = (qIdx, cIdx, value) => {
        const updated = [...quizData.questions];
        updated[qIdx].choices[cIdx].text = value;
        setQuizData({ ...quizData, questions: updated });
    };

    const handleCorrectChoiceChange = (qIdx, value) => {
        const updated = [...quizData.questions];
        updated[qIdx].correct_choice = value;
        setQuizData({ ...quizData, questions: updated });
    };

    const addQuestion = () => {
        setQuizData({
            ...quizData,
            questions: [
                ...quizData.questions,
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
            ],
        });
    };

    const removeQuestion = (idx) => {
        if (quizData.questions.length === 1) return;
        setQuizData({
            ...quizData,
            questions: quizData.questions.filter((_, i) => i !== idx),
        });
    };

    const handleCreateQuiz = async (e) => {
        e.preventDefault();
        try {
            await axios.post("/quiz", quizData);
            setQuizData({
                class_id: classId,
                title: "",
                description: "",
                start_time: "",
                end_time: "",
                duration_minutes: "",
                questions: [
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
                ],
            });
            const res = await axios.get(`/quizzes/${classId}`);
            setQuizList(res.data.quizzes);
        } catch (error) {
            console.error("Failed to create quiz", error);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* Quiz List */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800">
                    Existing Quizzes
                </h2>
                {quizList.length === 0 ? (
                    <div className="text-gray-500">No quizzes yet.</div>
                ) : (
                    <div className="grid gap-4">
                        {quizList.map((quiz) => (
                            <div
                                key={quiz.id}
                                className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-purple-700 text-lg">
                                            {quiz.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            {quiz.description}
                                        </p>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {quiz.questions?.length || 0}{" "}
                                        question(s)
                                    </span>
                                </div>
                                <button
                                    className="mt-3 px-4 py-1 bg-blue-500 text-white rounded text-sm"
                                    onClick={() => setSelectedQuiz(quiz)}
                                >
                                    View
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quiz Form */}
            <form
                onSubmit={handleCreateQuiz}
                className="bg-white p-6 rounded-lg shadow-md space-y-4 overflow-y-auto max-h-[85vh]"
            >
                <h2 className="text-xl font-semibold">Create Quiz</h2>

                <input
                    type="text"
                    name="title"
                    placeholder="Quiz Title"
                    value={quizData.title}
                    onChange={handleQuizInputChange}
                    className="w-full border rounded px-3 py-2"
                    required
                />
                <textarea
                    name="description"
                    placeholder="Description"
                    value={quizData.description}
                    onChange={handleQuizInputChange}
                    className="w-full border rounded px-3 py-2"
                />
                <div className="grid grid-cols-2 gap-3">
                    <input
                        type="datetime-local"
                        name="start_time"
                        value={quizData.start_time}
                        onChange={handleQuizInputChange}
                        className="border rounded px-3 py-2"
                    />
                    <input
                        type="datetime-local"
                        name="end_time"
                        value={quizData.end_time}
                        onChange={handleQuizInputChange}
                        className="border rounded px-3 py-2"
                    />
                </div>
                <input
                    type="number"
                    name="duration_minutes"
                    placeholder="Duration (minutes)"
                    value={quizData.duration_minutes}
                    readOnly
                    className="w-full border rounded px-3 py-2"
                />

                {/* Questions */}
                <div className="space-y-4">
                    {quizData.questions.map((q, idx) => (
                        <div
                            key={idx}
                            className="border rounded p-4 bg-gray-50"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold">
                                    Question {idx + 1}
                                </span>
                                {quizData.questions.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeQuestion(idx)}
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

                            {q.choices.map((c, cIdx) => (
                                <div
                                    key={c.label}
                                    className="flex items-center mb-2"
                                >
                                    <span className="w-6">{c.label}</span>
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

                            <select
                                value={q.correct_choice}
                                onChange={(e) =>
                                    handleCorrectChoiceChange(
                                        idx,
                                        e.target.value
                                    )
                                }
                                className="border rounded px-2 py-1 mt-2"
                            >
                                <option value="A">Correct: A</option>
                                <option value="B">Correct: B</option>
                                <option value="C">Correct: C</option>
                                <option value="D">Correct: D</option>
                            </select>
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={addQuestion}
                    className="w-full py-2 bg-green-500 text-white rounded"
                >
                    + Add Question
                </button>

                <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 text-white rounded"
                >
                    Create Quiz
                </button>
            </form>

            {/* Modal */}
            {selectedQuiz && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6 relative overflow-y-auto max-h-[90vh]">
                        <button
                            onClick={() => setSelectedQuiz(null)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-lg"
                        >
                            ×
                        </button>
                        <h3 className="text-xl font-bold mb-2">
                            {selectedQuiz.title}
                        </h3>
                        <p className="mb-4 text-gray-700">
                            {selectedQuiz.description}
                        </p>
                        <ol className="list-decimal pl-6 space-y-2">
                            {selectedQuiz.questions?.map((q, idx) => (
                                <li key={idx}>
                                    <p className="font-medium">
                                        {q.question_text}
                                    </p>
                                    <ul className="ml-4 mt-1 space-y-1">
                                        {q.choices?.map((c, cIdx) => (
                                            <li
                                                key={cIdx}
                                                className={
                                                    q.correct_choice === c.label
                                                        ? "text-green-600"
                                                        : "text-gray-700"
                                                }
                                            >
                                                {c.label}. {c.text}
                                                {q.correct_choice ===
                                                    c.label && (
                                                    <span className="ml-2 text-xs">
                                                        (Correct)
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            ))}
                        </ol>
                        <h4 className="font-semibold mb-2">Submissions</h4>{" "}
                        {selectedQuiz.submissions &&
                        selectedQuiz.submissions.length > 0 ? (
                            <ul className="space-y-2">
                                {" "}
                                {selectedQuiz.submissions.map((submission) => (
                                    <li
                                        key={submission.id}
                                        className="border rounded p-3 flex justify-between items-center"
                                    >
                                        {" "}
                                        <span>
                                            {" "}
                                            {submission.student?.firstname ||
                                                "Unknown Student"}{" "}
                                        </span>{" "}
                                        <span className="text-sm">
                                            {" "}
                                            Score:{" "}
                                            <span className="font-bold">
                                                {" "}
                                                {submission.score ?? "-"} /{" "}
                                                {selectedQuiz.questions
                                                    ?.length || 0}{" "}
                                            </span>{" "}
                                        </span>{" "}
                                    </li>
                                ))}{" "}
                            </ul>
                        ) : (
                            <div className="text-gray-500">
                                {" "}
                                No submissions yet.{" "}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

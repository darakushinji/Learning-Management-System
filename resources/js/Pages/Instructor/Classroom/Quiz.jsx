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

    // Fetch quizzes
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

    // Input handlers
    const handleQuizInputChange = (e) => {
        setQuizData({ ...quizData, [e.target.name]: e.target.value });
    };

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
        const updated = quizData.questions.filter((_, i) => i !== idx);
        setQuizData({ ...quizData, questions: updated });
    };

    // Submit
    const handleCreateQuiz = async (e) => {
        e.preventDefault();
        try {
            await axios.post("/quiz", quizData);
            // reset form
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
            // refresh list
            const res = await axios.get(`/quizzes/${classId}`);
            setQuizList(res.data.quizzes);
        } catch (error) {
            console.error("Failed to create quiz", error);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-red-500">
            {/* Quiz List */}
            <div className="mb-8">
                <h2 className="text-lg font-bold mb-2">Existing Quizzes</h2>
                {quizList.length === 0 ? (
                    <div className="text-gray-500">No quizzes yet.</div>
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
                                        {quiz.questions?.length || 0}{" "}
                                        question(s)
                                    </span>
                                </div>
                                <button
                                    className="px-4 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
                                    onClick={() => setSelectedQuiz(quiz)}
                                >
                                    View
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                {/* Modal */}
                {selectedQuiz && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                        <div className="w-full max-w-2xl bg-white rounded-md shadow-md p-6 relative animate-fade-in overflow-y-auto max-h-[90vh]">
                            <button
                                onClick={() => setSelectedQuiz(null)}
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
                            <h4 className="mb-4">Questions</h4>
                            <ol className="mb-4 list-decimal pl-6">
                                {selectedQuiz.questions?.map((q, idx) => (
                                    <li key={idx} className="mb-2">
                                        <div className="font-medium">
                                            {q.question_text}
                                        </div>
                                        <ul className="ml-4 mt-1">
                                            {q.choices?.map((c, cIdx) => (
                                                <li
                                                    key={cIdx}
                                                    className={
                                                        q.correct_choice ===
                                                        c.label
                                                            ? "text-green-600"
                                                            : ""
                                                    }
                                                >
                                                    <span className="font-semibold">
                                                        {c.label}.
                                                    </span>{" "}
                                                    {c.text}
                                                    {q.correct_choice ===
                                                        c.label && (
                                                        <span className="ml-2 text-xs text-green-600">
                                                            (Correct)
                                                        </span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                ))}
                            </ol>
                            <h4 className="font-semibold mb-2">Submissions</h4>
                            {selectedQuiz.submissions &&
                            selectedQuiz.submissions.length > 0 ? (
                                <ul className="space-y-2">
                                    {selectedQuiz.submissions.map(
                                        (submission) => (
                                            <li
                                                key={submission.id}
                                                className="border rounded p-3 flex justify-between items-center"
                                            >
                                                <span>
                                                    {submission.student
                                                        ?.firstname ||
                                                        "Unknown Student"}
                                                </span>
                                                <span className="text-sm">
                                                    Score:{" "}
                                                    <span className="font-bold">
                                                        {submission.score ??
                                                            "-"}{" "}
                                                        /{" "}
                                                        {selectedQuiz.questions
                                                            ?.length || 0}
                                                    </span>
                                                </span>
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

            {/* Quiz Form */}
            <form
                onSubmit={handleCreateQuiz}
                className="bg-white p-6 rounded shadow"
            >
                <h2 className="text-xl font-semibold">Create Quiz</h2>

                <div className="mb-4">
                    <label className="block font-semibold">Title</label>
                    <input
                        type="text"
                        name="title"
                        value={quizData.title}
                        onChange={handleQuizInputChange}
                        className="w-full border rounded px-3 py-2"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block font-semibold">Description</label>
                    <textarea
                        name="description"
                        value={quizData.description}
                        onChange={handleQuizInputChange}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                <div className="mb-4">
                    <label className="block font-semibold">Start Time</label>
                    <input
                        type="datetime-local"
                        name="start_time"
                        value={quizData.start_time}
                        onChange={handleQuizInputChange}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                <div className="mb-4">
                    <label className="block font-semibold">End Time</label>
                    <input
                        type="datetime-local"
                        name="end_time"
                        value={quizData.end_time}
                        onChange={handleQuizInputChange}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                <div className="mb-4">
                    <label className="block font-semibold">
                        Duration (minutes)
                    </label>
                    <input
                        type="number"
                        name="duration_minutes"
                        value={quizData.duration_minutes}
                        onChange={handleQuizInputChange}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                {quizData.questions.map((q, idx) => (
                    <div
                        key={idx}
                        className="mb-6 border p-4 rounded bg-gray-50"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <label className="font-semibold">
                                Question {idx + 1}
                            </label>
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

                        <div className="mb-2">
                            <label className="block font-semibold mb-1">
                                Choices
                            </label>
                            {q.choices.map((c, cIdx) => (
                                <div
                                    key={c.label}
                                    className="flex items-center mb-1"
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
                    >
                        Create Quiz
                    </button>
                </div>
            </form>
        </div>
    );
}

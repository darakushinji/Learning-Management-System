import { useState, useEffect, React } from "react";
import axios from "axios";

export default function Members({ classId }) {
    const [instructor, setInstructor] = useState(null);
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await axios.get(`/classroom/${classId}/members`);
                setInstructor(res.data.instructor);
                setStudents(res.data.students);
            } catch (error) {
                console.error("Error fetching members:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMembers();
    }, [classId]);

    const handleSearch = async (e) => {
        const value = e.target.value;
        setSearch(value);
        if (value.length > 1) {
            try {
                const res = await axios.get(`/students/search?query=${value}`);
                setSuggestions(res.data);
            } catch (err) {
                console.error("Search failed:", err);
            }
        } else {
            setSuggestions([]);
        }
    };

    const handleAddStudent = async (studentId) => {
        setAdding(true);
        try {
            await axios.post(`/instructor/${classId}/add-member`, {
                student_id: studentId,
            });
            const res = await axios.get(`/classroom/${classId}/members`);
            setStudents(res.data.students);
        } catch (err) {
            console.error("Error adding student:", err);
        } finally {
            setSearch("");
            setSuggestions([]);
            setAdding(false);
        }
    };

    if (loading)
        return (
            <div className="text-gray-400 text-center py-8 animate-pulse">
                Loading members...
            </div>
        );

    return (
        <div className="w-full bg-gray-50 p-4 rounded-xl shadow-lg">
            {/* Search */}
            <div className="relative mb-4">
                <input
                    type="text"
                    placeholder="Search students..."
                    value={search}
                    onChange={handleSearch}
                    className="w-full border border-gray-300 p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {suggestions.length > 0 && (
                    <ul className="absolute w-full mt-1 bg-white border border-gray-200 rounded-xl shadow max-h-48 overflow-y-auto z-10">
                        {suggestions.map((student) => (
                            <li
                                key={student.id}
                                className="p-2 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                                onClick={() => handleAddStudent(student.id)}
                            >
                                <span>
                                    {student.firstname} {student.lastname}
                                </span>
                                {adding && (
                                    <span className="text-xs text-gray-400">
                                        Adding...
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Instructor */}
            {instructor && (
                <div className="flex items-center mb-4 p-3 bg-white rounded-xl shadow hover:shadow-md transition cursor-default">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700">
                        {instructor.firstname[0]}
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-gray-500">Instructor</p>
                        <h2 className="font-semibold text-gray-900">
                            {instructor.firstname} {instructor.lastname}
                        </h2>
                    </div>
                </div>
            )}

            {/* Students */}
            <div className="space-y-2 overflow-y-auto max-h-[400px]">
                {students.length > 0 ? (
                    students.map((student) => (
                        <div
                            key={student.id}
                            className="flex items-center p-3 bg-white rounded-xl shadow hover:shadow-md transition cursor-pointer"
                        >
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-medium text-gray-700">
                                {student.firstname[0]}
                            </div>
                            <div className="ml-3 flex-1">
                                <h3 className="text-gray-900 font-medium">
                                    {student.firstname} {student.lastname}
                                </h3>
                                <p className="text-xs text-gray-400">Student</p>
                            </div>
                            <span
                                className="w-3 h-3 rounded-full bg-green-400"
                                title="Online"
                            ></span>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-400 text-center py-8">
                        No students enrolled.
                    </p>
                )}
            </div>
        </div>
    );
}

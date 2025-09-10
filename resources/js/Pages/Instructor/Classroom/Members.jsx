import { useState, useEffect, React } from "react";
import axios from "axios";

export default function Members({ classId }) {
    const [instructor, setInstructor] = useState([]);
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await axios.get(`/classroom/${classId}/members`);
                setInstructor(res.data.instructor);
                console.log("Instructor:", res.data.instructor);
                setStudents(res.data.students);
                console.log("Students:", res.data.students);
            } catch (error) {
                console.error("Error fetching members.");
            } finally {
                setLoading(false);
            }
        };
        fetchMembers();
        const interval = setInterval(fetchMembers, 1000);
        return () => clearInterval(interval);
    }, [classId]);

    const handleSearch = async (e) => {
        const value = e.target.value;
        setSearch(value);

        if (value.length > 1) {
            const res = await axios.get(`/students/search?query=${value}`);
            setSuggestions(res.data);
        } else {
            setSuggestions([]);
        }
    };

    const handleAddStudent = async (studentId) => {
        setLoading(true);

        try {
            await axios.post(`/instructor/${classId}/add-member`, {
                student_id: studentId,
            });
        } catch (error) {
            console.error("Error adding student.", error);
        } finally {
            setSearch("");
            setSuggestions([]);
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Class Members</h2>
            <h3 className="text-md font-semibold">
                Instructor: {instructor.firstname}
            </h3>
            <ul className="list-disc ml-6">
                {students.length > 0 ? (
                    students.map((student) => (
                        <li key={student.id}>{student.firstname}</li>
                    ))
                ) : (
                    <p>No student found.</p>
                )}
            </ul>
            <input
                type="text"
                placeholder="Search student..."
                value={search}
                onChange={handleSearch}
            />
            {suggestions.length > 0 && (
                <ul className="border rounded mt-2 bg-white">
                    {suggestions.map((student) => (
                        <li
                            key={student.id}
                            className="p-2 hover:bg-gray-200 cursor-pointer"
                            onClick={() => handleAddStudent(student.id)}
                        >
                            {student.firstname}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

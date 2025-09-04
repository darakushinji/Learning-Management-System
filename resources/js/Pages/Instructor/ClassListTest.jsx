import { Link } from "@inertiajs/react";
import { useState, useEffect } from "react";
import axios from "axios";
import InstructorLayout from "@/Layouts/InstructorLayout";

export default function ClassListTest() {
    const [classList, setClassList] = useState([]);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await axios.get("/instructor/classes/list");
                console.log(res.data.classList);
                setClassList(res.data.classList);
            } catch (error) {
                console.error("Error fetching Classes", error);
            }
        };
        fetchClasses();
        const interval = setInterval(fetchClasses, 1000);
        return () => clearInterval(interval);
    });

    return (
        <InstructorLayout>
            <div className="min-h-screen bg-white p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-bold text-indigo-800 tracking-tight">
                            Your Classes
                        </h2>
                        <Link href={route("instructor.create")}>
                            Create New
                        </Link>
                    </div>

                    {classList && classList.length > 0 ? (
                        <div></div>
                    ) : (
                        <div className="flex justify-center items-center h-64">
                            <span className="text-lg text-gray-500">
                                No classes yet. Click "Create New" to get
                                started.
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </InstructorLayout>
    );
}

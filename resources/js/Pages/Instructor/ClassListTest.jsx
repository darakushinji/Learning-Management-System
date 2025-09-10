import { Link } from "@inertiajs/react";
import { useState, useEffect } from "react";
import axios from "axios";
import InstructorLayout from "@/Layouts/InstructorLayout";

export default function ClassListTest() {
    const [classList, setClassList] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let firstLoad = true;
        const fetchClasses = async () => {
            try {
                if (firstLoad) setLoading(true);
                const res = await axios.get("/instructor/classes/list");
                console.log(res.data.classList);
                setCount(res.data.classList.length);
                setClassList(res.data.classList);
            } catch (error) {
                console.error("Error fetching Classes", error);
            } finally {
                if (firstLoad) {
                    setLoading(false);
                    firstLoad = false;
                }
            }
        };
        fetchClasses();
        const interval = setInterval(fetchClasses, 1000);
        return () => clearInterval(interval);
    }, []);

    const SkeletonCard = () => (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-full border border-gray-200 animate-pulse">
            <div className="bg-gray-300 h-40 w-full"></div>
            <div className="p-5 space-y-3 flex flex-col flex-grow">
                <div className="h-5 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="mt-auto space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
            </div>
        </div>
    );

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

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols md:grid-cols-3 lg-grid-cols-4 gap-8">
                            {[...Array(6)].map((_, i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </div>
                    ) : classList && classList.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols md:grid-cols-3 lg-grid-cols-4 gap-8">
                            {classList.map((cls) => (
                                <Link
                                    key={cls.id}
                                    href={route("test.classroom", cls.id)}
                                    className="group"
                                >
                                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-full transform transition duration-300 hover:-translate-y-1 hover:shadow-2xl border border-transparent hover:border-indigo-300">
                                        {cls.photo && (
                                            <div className="aspect-w-16 aspect-h-9 bg-gray-100 flex items-center justify-center">
                                                <img
                                                    src={`/class/${cls.photo}`}
                                                    alt={cls.name}
                                                    className="object-contain"
                                                />
                                            </div>
                                        )}
                                        <div className="p-5 flex flex-col flex-grow">
                                            <h3 className="text-xl font-bold text-indigo-900 mb-1 truncate">
                                                {cls.name}
                                            </h3>
                                            <p className="text-gray-600 text-sm mb-3 line-clamp-2 min-h-[2.5em]">
                                                {cls.description ||
                                                    "No description available."}
                                            </p>
                                            <div className="mt-auto space-y-1">
                                                {cls.section && (
                                                    <p className="text-sm text-gray-700">
                                                        <span className="font-semibold text-indigo-700">
                                                            Section:
                                                        </span>{" "}
                                                        {cls.section}
                                                    </p>
                                                )}
                                                {cls.yearlevel && (
                                                    <p className="text-sm text-gray-700">
                                                        <span className="font-semibold text-indigo-700">
                                                            Year:
                                                        </span>{" "}
                                                        {cls.yearlevel}
                                                    </p>
                                                )}
                                                {cls.students_count !==
                                                    undefined && (
                                                    <p className="text-sm text-gray-700">
                                                        <span className="font-semibold text-indigo-700">
                                                            Students Enrolled:
                                                        </span>{" "}
                                                        {cls.students_count}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="mt-3 text-right">
                                                <Link
                                                    href={route(
                                                        "instructor.classroom.edit",
                                                        cls.id
                                                    )}
                                                    className="text-sm text-indigo-600 hover:underline"
                                                >
                                                    Edit
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="flex justify-center items-center h-64">
                            <span className="text-lg text-gray-500">
                                No classes yet. Click "Create New" to get
                                started.
                            </span>
                        </div>
                    )}

                    {/* {classList && classList.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols md:grid-cols-3 lg-grid-cols-4 gap-8">
                            {classList.map((cls) => (
                                <Link
                                    key={cls.id}
                                    href={route("test.classroom", cls.id)}
                                    className="group"
                                >
                                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-full transform transition duration-300 hover:-translate-y-1 hover:shadow-2xl border border-transparent hover:border-indigo-300">
                                        {cls.photo && (
                                            <div className="aspect-w-16 aspect-h-9 bg-gray-100 flex items-center justify-center">
                                                <img
                                                    src={`/class/${cls.photo}`}
                                                    alt={cls.name}
                                                    className="object-contain"
                                                />
                                            </div>
                                        )}
                                        <div className="p-5 flex flex-col flex-grow">
                                            <h3 className="text-xl font-bold text-indigo-900 mb-1 truncate">
                                                {cls.name}
                                            </h3>
                                            <p className="text-gray-600 text-sm mb-3 line-clamp-2 min-h-[2.5em]">
                                                {cls.description ||
                                                    "No description available."}
                                            </p>
                                            <div className="mt-auto space-y-1">
                                                {cls.section && (
                                                    <p className="text-sm text-gray-700">
                                                        <span className="font-semibold text-indigo-700">
                                                            Section:
                                                        </span>{" "}
                                                        {cls.section}
                                                    </p>
                                                )}
                                                {cls.yearlevel && (
                                                    <p className="text-sm text-gray-700">
                                                        <span className="font-semibold text-indigo-700">
                                                            Year:
                                                        </span>{" "}
                                                        {cls.yearlevel}
                                                    </p>
                                                )}
                                                {cls.students_count !==
                                                    undefined && (
                                                    <p className="text-sm text-gray-700">
                                                        <span className="font-semibold text-indigo-700">
                                                            Students Enrolled:
                                                        </span>{" "}
                                                        {cls.students_count}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="mt-3 text-right">
                                                <Link
                                                    href={route(
                                                        "instructor.classroom.edit",
                                                        cls.id
                                                    )}
                                                    className="text-sm text-indigo-600 hover:underline"
                                                >
                                                    Edit
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="flex justify-center items-center h-64">
                            <span className="text-lg text-gray-500">
                                No classes yet. Click "Create New" to get
                                started.
                            </span>
                        </div>
                    )} */}
                </div>
            </div>
        </InstructorLayout>
    );
}

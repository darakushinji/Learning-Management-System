import { useState, useEffect, React } from "react";
import axios from "axios";

export default function Materials({ classId }) {
    const [title, setTitle] = useState("");
    const [materialData, setMaterialData] = useState("");
    const [materials, setMaterials] = useState([]);
    const [materialProcessing, setMaterialProcessing] = useState(false);

    useEffect(() => {
        const fetchMaterials = async () => {
            try {
                if (!classId) return console.warn("No classId provided.");

                const res = await axios.get(
                    `/classroom/material/fetch/${classId}`
                );
                setMaterials(res.data.materials);
            } catch (error) {
                console.error("Failed to fetch materials.", error);
            }
        };

        fetchMaterials();
        const interval = setInterval(fetchMaterials, 1000);
        return () => clearInterval(interval);
    }, [classId]);

    const handleAddMaterial = async (e) => {
        e.preventDefault();
        setMaterialProcessing(true);

        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("materials_folder", materialData);

            const res = await axios.post(
                `/class/materials/${classId}`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            setMaterials((prev) => [res.data.material, ...prev]);
            setTitle("");
            setMaterialData(null);
        } catch (error) {
            console.error(
                "Upload failed:",
                error.response?.data || error.message
            );
            alert("Upload failed. Check console for details.");
        } finally {
            setMaterialProcessing(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upload Form */}
            <form
                onSubmit={handleAddMaterial}
                encType="multipart/form-data"
                className="p-6 bg-white rounded-xl shadow-md space-y-4"
            >
                <h2 className="text-lg font-bold text-gray-700">
                    Upload Material
                </h2>
                <div>
                    <label className="block font-medium mb-1">
                        Material Title
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-purple-500"
                        required
                    />
                </div>
                <div>
                    <label className="block font-medium mb-1">
                        Upload File
                    </label>
                    <input
                        type="file"
                        onChange={(e) => setMaterialData(e.target.files[0])}
                        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-purple-600 text-white px-5 py-2 rounded-lg shadow hover:bg-purple-700 transition disabled:opacity-50"
                    disabled={materialProcessing}
                >
                    {materialProcessing ? "Uploading..." : "Upload"}
                </button>
            </form>

            {/* Materials List */}
            <div>
                <h2 className="text-xl font-semibold mb-4">
                    Uploaded Materials
                </h2>
                {materials.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                        No materials uploaded yet.
                    </p>
                ) : (
                    <ul className="grid grid-cols-1 gap-6">
                        {materials.map((material) => (
                            <li
                                key={material.id}
                                className="p-5 bg-white rounded-xl shadow hover:shadow-md transition flex flex-col justify-between"
                            >
                                <div>
                                    <h3 className="font-semibold text-gray-800 text-lg">
                                        {material.title}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {new Date(
                                            material.created_at
                                        ).toLocaleString()}
                                    </p>
                                </div>
                                <a
                                    href={`/materials/${material.materials_folder}`}
                                    target="_blank"
                                    className="mt-4 inline-block bg-purple-100 text-purple-600 px-3 py-1 rounded-lg text-sm font-medium hover:bg-purple-200 transition"
                                >
                                    View / Download
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

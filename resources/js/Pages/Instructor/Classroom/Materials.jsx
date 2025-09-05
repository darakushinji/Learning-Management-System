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
                if (!classId) {
                    console.warn("No classId provided to Materials component.");
                    return;
                }

                const res = await axios.get(
                    `/classroom/material/fetch/${classId}`
                );
                setMaterials(res.data.materials);
            } catch (error) {
                console.error("Failed to fetch the material.", error);
            }
        };
        fetchMaterials();
        const interval = setInterval(fetchMaterials, 1000);
        return () => clearInterval(interval);
    });

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
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
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
        <>
            <div>
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
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
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
                            onChange={(e) => setMaterialData(e.target.files[0])}
                            className="w-full border p-3 rounded"
                        />
                    </div>

                    <button
                        type="submit"
                        className="mt-4 bg-purple-600 text-white px-4 py-2 rounded"
                        disabled={materialProcessing}
                    >
                        {materialProcessing ? "Uploading..." : "Upload"}
                    </button>
                </form>
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">
                        Uploaded Materials
                    </h2>
                    {materials.length === 0 ? (
                        <p className="text-gray-500">
                            No Materials uploaded yet.
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
        </>
    );
}

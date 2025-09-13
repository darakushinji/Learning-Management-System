import { useState } from "react";
import InstructorLayout from "@/Layouts/InstructorLayout";
import axios from "axios";

export default function Profile({ user }) {
    const [form, setForm] = useState({
        firstname: user.firstname || "",
        middlename: user.middlename || "",
        lastname: user.lastname || "",
        email: user.email || "",
        contact_number: user.contact_number || "",
        specialization: user.specialization || "",
        bio: user.bio || "",
        profile_picture: null,
    });

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "profile_picture") {
            setForm({ ...form, profile_picture: files[0] });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        Object.keys(form).forEach((key) => {
            if (form[key] !== null) {
                formData.append(key, form[key]);
            }
        });

        // Add method spoofing for Laravel
        formData.append("_method", "PUT");

        try {
            const res = await axios.post("/instructor/profile", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            alert(res.data.message);
        } catch (err) {
            console.error(err.response?.data || err.message);
            alert("Update failed!");
        }
    };

    return (
        <InstructorLayout>
            <div className="max-w-xl mx-auto mt-10 bg-white p-8 rounded shadow">
                <h1 className="text-2xl font-bold mb-6">My Profile</h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {[
                        "firstname",
                        "middlename",
                        "lastname",
                        "email",
                        "contact_number",
                        "specialization",
                        "bio",
                    ].map((field) => (
                        <div key={field}>
                            <label className="block font-medium mb-1 capitalize">
                                {field.replace("_", " ")}
                            </label>
                            {field === "bio" ? (
                                <textarea
                                    name={field}
                                    value={form[field]}
                                    onChange={handleChange}
                                    className="w-full border rounded px-3 py-2"
                                    rows={3}
                                />
                            ) : (
                                <input
                                    type={field === "email" ? "email" : "text"}
                                    name={field}
                                    value={form[field]}
                                    onChange={handleChange}
                                    className="w-full border rounded px-3 py-2"
                                />
                            )}
                        </div>
                    ))}

                    {/* Profile Picture Upload */}
                    <div>
                        <label className="block font-medium mb-1">
                            Profile Picture
                        </label>
                        <input
                            type="file"
                            name="profile_picture"
                            accept="image/*"
                            onChange={handleChange}
                            className="w-full"
                        />
                    </div>

                    <button
                        type="submit"
                        className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
                    >
                        Update Profile
                    </button>
                </form>
            </div>
        </InstructorLayout>
    );
}

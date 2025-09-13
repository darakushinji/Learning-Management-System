import { useState } from "react";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Transition } from "@headlessui/react";
import { Link, usePage } from "@inertiajs/react";
import axios from "axios";

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = "",
}) {
    const user = usePage().props.auth.user;

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

    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [recentlySuccessful, setRecentlySuccessful] = useState(false);

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
        setProcessing(true);
        setErrors({});

        const formData = new FormData();
        Object.keys(form).forEach((key) => {
            if (form[key] !== null) {
                formData.append(key, form[key]);
            }
        });

        try {
            const res = await axios.post("/profile/update", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            alert(res.data.message);
            setRecentlySuccessful(true);
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
            }
            console.error(err.response?.data || err.message);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Profile Information
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Update your account's profile information and email address.
                </p>
            </header>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                {/* Firstname */}
                <div>
                    <InputLabel htmlFor="firstname" value="First Name" />
                    <TextInput
                        id="firstname"
                        name="firstname"
                        value={form.firstname}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full"
                    />
                    <InputError className="mt-2" message={errors.firstname} />
                </div>

                {/* Lastname */}
                <div>
                    <InputLabel htmlFor="lastname" value="Last Name" />
                    <TextInput
                        id="lastname"
                        name="lastname"
                        value={form.lastname}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full"
                    />
                    <InputError className="mt-2" message={errors.lastname} />
                </div>

                {/* Contact Number */}
                <div>
                    <InputLabel
                        htmlFor="contact_number"
                        value="Contact Number"
                    />
                    <TextInput
                        id="contact_number"
                        name="contact_number"
                        value={form.contact_number}
                        onChange={handleChange}
                        className="mt-1 block w-full"
                    />
                    <InputError
                        className="mt-2"
                        message={errors.contact_number}
                    />
                </div>

                {/* Bio */}
                <div>
                    <InputLabel htmlFor="bio" value="Bio" />
                    <textarea
                        id="bio"
                        name="bio"
                        value={form.bio}
                        onChange={handleChange}
                        className="mt-1 block w-full border rounded px-3 py-2"
                        rows={3}
                    />
                    <InputError className="mt-2" message={errors.bio} />
                </div>

                {/* Profile Picture */}
                <div>
                    <InputLabel
                        htmlFor="profile_picture"
                        value="Profile Picture"
                    />
                    <input
                        type="file"
                        id="profile_picture"
                        name="profile_picture"
                        accept="image/*"
                        onChange={handleChange}
                        className="mt-1 block w-full"
                    />
                    <InputError
                        className="mt-2"
                        message={errors.profile_picture}
                    />
                </div>

                {/* Email verification (optional) */}
                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800">
                            Your email address is unverified.
                            <Link
                                href={route("verification.send")}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === "verification-link-sent" && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                A new verification link has been sent to your
                                email address.
                            </div>
                        )}
                    </div>
                )}

                {/* Submit */}
                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">Saved.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}

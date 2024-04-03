"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import getAllDepartments from "@/lib/getAllDepartments";
import { useAuth } from "@/app/layout";

export default function CreateCourse() {
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const authContext = useAuth();
    const { isLoggedIn, userData, loading, password } = authContext;
    const router = useRouter();

    useEffect(() => {
        document.title = "InterEd Hub | Create Course";
        const metaDescription = document.querySelector(
            'meta[name="description"]'
        );
        if (metaDescription) {
            metaDescription.content =
                "An online school management system. This is the login page.";
        }

        if (!isLoggedIn) {
            router.push("/");
        }

        getAllDepartments().then((data) => setDepartments(data));
    }, [router, isLoggedIn]);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const title = formData.get("title");
        const description = formData.get("description");
        const duration = formData.get("duration");
        const credit = formData.get("credit");
        const department = formData.get("department");
        const image = formData.get("image");

        try {
            const response = await axios.post(
                "https://inter-ed-hub-drf.onrender.com/courses/create/",
                {
                    title,
                    description,
                    duration,
                    credit,
                    department,
                    image,
                },
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization:
                            "Basic " +
                            Buffer.from(
                                userData.username + ":" + password
                            ).toString("base64"),
                    },
                }
            );

            console.log(response);
            setError("");
            setSuccess("Course created successfully!");

            router.push("/teacher/profile");
        } catch (error) {
            if (error.response) {
                setError(error.response.data.detail);
            } else {
                setError("An error occurred while processing your request.");
            }
            console.error("Course creation failed:", error);
        }
    }

    return (
        <>
            {loading ? (
                <div className="min-h-screen w-24 m-auto">
                    <span className="loading loading-infinity loading-lg"></span>
                </div>
            ) : (
                <div className="bg-base-100 min-h-screen py-12">
                    <div className="max-w-4xl mx-auto px-4">
                        <div className="bg-white shadow-md rounded-md p-8">
                            {error && (
                                <div
                                    role="alert"
                                    className="alert alert-error my-6"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="stroke-current shrink-0 h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <span>{error}</span>
                                </div>
                            )}
                            {success && (
                                <div
                                    role="alert"
                                    className="alert alert-success my-6"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="stroke-current shrink-0 h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <span>{success}</span>
                                </div>
                            )}
                            {userData.user_type === "Teacher" ? (
                                <>
                                    <h1 className="text-3xl font-bold text-gray-800 mb-4">
                                        Create a New Course
                                    </h1>
                                    <label htmlFor="title" className="label">
                                        Teacher:
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue={
                                            userData.first_name +
                                            " " +
                                            userData.last_name
                                        }
                                        className="input input-bordered input-primary w-full"
                                        disabled
                                    />
                                    <form
                                        onSubmit={handleSubmit}
                                        encType="multipart/form-data"
                                    >
                                        <div className="mb-4">
                                            <label
                                                htmlFor="title"
                                                className="label"
                                            >
                                                Title
                                            </label>
                                            <input
                                                type="text"
                                                id="title"
                                                name="title"
                                                className="input input-bordered input-primary w-full"
                                                required
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label
                                                htmlFor="description"
                                                className="label"
                                            >
                                                Description
                                            </label>
                                            <textarea
                                                id="description"
                                                name="description"
                                                className="textarea textarea-bordered textarea-primary w-full"
                                                required
                                            ></textarea>
                                        </div>
                                        <div className="mb-4">
                                            <label
                                                htmlFor="image"
                                                className="label"
                                            >
                                                Image
                                            </label>
                                            <input
                                                type="file"
                                                id="image"
                                                name="image"
                                                accept="image/*"
                                                className="file-input file-input-bordered file-input-primary w-full"
                                                required
                                            />
                                        </div>
                                        <div className="flex gap-12 mb-4">
                                            <div className="w-1/2">
                                                <label
                                                    htmlFor="duration"
                                                    className="label"
                                                >
                                                    Duration
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    id="duration"
                                                    name="duration"
                                                    placeholder="in hours"
                                                    className="input input-bordered input-primary w-full"
                                                    required
                                                />
                                            </div>
                                            <div className="w-1/2">
                                                <label
                                                    htmlFor="credit"
                                                    className="label"
                                                >
                                                    Credit
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    id="credit"
                                                    name="credit"
                                                    className="input input-bordered input-primary w-full"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <label
                                                htmlFor="department"
                                                className="label"
                                            >
                                                Department
                                            </label>
                                            <select
                                                id="department"
                                                name="department"
                                                className="select select-bordered select-primary w-full"
                                                required
                                                value={selectedDepartment}
                                                onChange={(e) =>
                                                    setSelectedDepartment(
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="" disabled>
                                                    Select Department
                                                </option>
                                                {departments.map(
                                                    (department) => (
                                                        <option
                                                            key={department.id}
                                                            value={
                                                                department.id
                                                            }
                                                        >
                                                            {department.name}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </div>
                                        <div className="w-40 m-auto mt-12">
                                            <button
                                                type="submit"
                                                className="btn btn-primary w-full"
                                            >
                                                Create Course
                                            </button>
                                        </div>
                                    </form>
                                </>
                            ) : (
                                <div className="alert alert-error my-6">
                                    <span>
                                        You need to be a teacher to create a
                                        course.
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

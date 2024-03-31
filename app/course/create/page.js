"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import getAllDepartments from "@/lib/getAllDepartments";

export default function CreateCourse() {
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        getAllDepartments().then((data) => setDepartments(data));
    }, []);

    const router = useRouter();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const token = localStorage.getItem("token");
    const parsedToken = JSON.parse(token);

    const username = parsedToken.username;
    const password = localStorage.getItem("password");

    useEffect(() => {
        document.title = "InterED Hub | Create Course";
        const metaDescription = document.querySelector(
            'meta[name="description"]'
        );
        if (metaDescription) {
            metaDescription.content =
                "An online school management system. This is the login page.";
        }
    }, []);

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
                            Buffer.from(username + ":" + password).toString(
                                "base64"
                            ),
                    },
                }
            );

            console.log(response);
            setError("");
            setSuccess("Course created successfully!");

            // router.push("/");
        } catch (error) {
            setError(error.response.data.detail);
            console.error("Course creation failed:", error);
        }
    }

    return (
        <div className="bg-base-100 min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white shadow-md rounded-md p-8">
                    {error && (
                        <div role="alert" className="alert alert-error my-6">
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
                        <div role="alert" className="alert alert-success my-6">
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
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">
                        Create a New Course
                    </h1>
                    <label
                        htmlFor="title"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                        Teacher: {parsedToken.first_name}{" "}
                        {parsedToken.last_name}
                    </label>
                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                        <div className="mb-4">
                            <label
                                htmlFor="title"
                                className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                                Title
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label
                                htmlFor="description"
                                className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows="4"
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                                required
                            ></textarea>
                        </div>
                        <div className="flex gap-12 mb-4">
                            <div className="w-1/2">
                                <label
                                    htmlFor="duration"
                                    className="block text-sm font-semibold text-gray-700 mb-2"
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
                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div className="w-1/2">
                                <label
                                    htmlFor="credit"
                                    className="block text-sm font-semibold text-gray-700 mb-2"
                                >
                                    Credit
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    id="credit"
                                    name="credit"
                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label
                                htmlFor="department"
                                className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                                Department
                            </label>
                            <select
                                id="department"
                                name="department"
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                                required
                            >
                                <option value="" disabled selected>
                                    Select Department
                                </option>
                                {departments.map((department, index) => (
                                    <option key={index} value={department.id}>
                                        {department.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label
                                htmlFor="image"
                                className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                                Image
                            </label>
                            <input
                                type="file"
                                id="image"
                                name="image"
                                accept="image/*"
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <button type="submit" className="btn btn-primary">
                                Create Course
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

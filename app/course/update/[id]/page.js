"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/layout";
import getCourse from "@/lib/getCourse";
import Image from "next/image";
import axios from "axios";
import getAllDepartments from "@/lib/getAllDepartments";

export default function CourseUpdate({ params }) {
    const { id } = params;

    const authContext = useAuth();
    const { isLoggedIn, teacherData, password, loading } = authContext;
    const router = useRouter();

    const [departments, setDepartments] = useState([]);
    const [courseData, setCourseData] = useState({});
    const [courseLoading, setCourseLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        document.title = "InterEd Hub | Course Update";
        const metaDescription = document.querySelector(
            'meta[name="description"]'
        );
        if (metaDescription) {
            metaDescription.content =
                "An online school management system. This is the course update page.";
        }

        if (!isLoggedIn) {
            router.push("/");
        }

        if (id) {
            getCourse(id).then((data) => {
                setCourseData(data);
                setCourseLoading(false);
            });
        }

        getAllDepartments().then((data) => setDepartments(data));
    }, [router, isLoggedIn, id]);

    async function handleUpdate(e) {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const title = form.get("title");
        const description = form.get("description");
        const image = form.get("image");
        const department = form.get("department");
        const credit = form.get("credit");
        const duration = form.get("duration");

        const data = {
            title,
            description,
            image,
            department,
            credit,
            duration,
        };

        try {
            const response = await axios.put(
                `https://inter-ed-hub-drf.onrender.com/courses/${courseData.id}/update/`,
                data,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization:
                            "Basic " +
                            Buffer.from(
                                teacherData.username + ":" + password
                            ).toString("base64"),
                    },
                }
            );
            window.location.reload();
            setSuccess("Course updated successfully.");
            console.log(response.data);
        } catch (error) {
            setError(error.message + ": " + error.response.data.detail);
            console.log(error);
        }
    }

    return (
        <>
            {courseLoading || loading ? (
                <div className="min-h-screen w-24 m-auto">
                    <span className="loading loading-infinity loading-lg"></span>
                </div>
            ) : (
                <div className="min-h-screen lg:w-1/2 m-auto">
                    <div className="hero-content flex-col">
                        <div className="text-center lg:text-left">
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
                            <h2 className="text-5xl font-bold">
                                Update Course
                            </h2>
                            <p className="py-6">
                                Update your course details here.
                            </p>
                        </div>
                        <div className="lg:p-16 p-10 w-full shadow-2xl bg-base-100">
                            {courseData.image ? (
                                <>
                                    <div className="w-32 m-auto rounded">
                                        <Image
                                            alt="Course Cover"
                                            src={courseData.image}
                                            width={500}
                                            height={300}
                                        />
                                    </div>
                                </>
                            ) : (
                                <span className="loading loading-spinner text-primary w-12 m-auto mt-6"></span>
                            )}
                            <form
                                onSubmit={handleUpdate}
                                encType="multipart/form-data"
                            >
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">
                                            Course Title
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        placeholder="Course Title"
                                        className="input input-bordered input-primary w-full"
                                        defaultValue={courseData.title}
                                        required
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">
                                            Description
                                        </span>
                                    </label>
                                    <textarea
                                        name="description"
                                        placeholder="Course Description"
                                        className="textarea textarea-bordered"
                                        defaultValue={courseData.description}
                                        required
                                    ></textarea>
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">
                                            Image
                                        </span>
                                    </label>
                                    <input
                                        type="file"
                                        name="image"
                                        className="file-input file-input-bordered file-input-primary w-full"
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">
                                            Department
                                        </span>
                                    </label>
                                    <select
                                        name="department"
                                        className="select select-bordered select-primary w-full"
                                        defaultValue={courseData.department}
                                        required
                                    >
                                        {departments.map((department) => (
                                            <option
                                                selected={
                                                    department.name ===
                                                    teacherData.department
                                                }
                                                key={department.id}
                                                value={department.id}
                                            >
                                                {department.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">
                                            Credit
                                        </span>
                                    </label>
                                    <input
                                        type="number"
                                        name="credit"
                                        min="0"
                                        step="0.01"
                                        placeholder="Credit"
                                        className="input input-bordered input-primary w-full"
                                        defaultValue={courseData.credit}
                                        required
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">
                                            Duration
                                        </span>
                                    </label>
                                    <input
                                        type="number"
                                        name="duration"
                                        min="0"
                                        step="0.01"
                                        placeholder="Duration"
                                        className="input input-bordered input-primary w-full"
                                        defaultValue={courseData.duration}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-primary mt-6"
                                >
                                    Update Course
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

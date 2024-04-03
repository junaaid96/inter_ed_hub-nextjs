"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/layout";
import getAllDepartments from "@/lib/getAllDepartments";
import getCourse from "@/lib/getCourse";
import Image from "next/image";

export default function CourseUpdate() {
    const authContext = useAuth();
    const { isLoggedIn, userData, password } = authContext;
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
            // router.push("/");
        }
        getCourse(userData.id).then((data) => {
            setCourseData(data);
            setCourseLoading(false);
        });
        getAllDepartments().then((data) => setDepartments(data));
    }, [router, isLoggedIn, userData.id]);

    return (
        <>
            {courseLoading ? (
                <div className="min-h-screen w-24 m-auto">
                    <span className="loading loading-infinity loading-lg"></span>
                </div>
            ) : (
                <div className="min-h-screen lg:w-1/2 m-auto">
                    <div className="hero-content flex-col">
                        <div className="text-center lg:text-left">
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
                            <form action="">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">
                                            Course Title
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Course Title"
                                        className="input input-bordered input-primary w-full"
                                        value={courseData.title}
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
                                        className="file-input file-input-bordered file-input-primary w-full"
                                        required
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">
                                            Department
                                        </span>
                                    </label>
                                    <select
                                        className="select select-bordered select-primary w-full"
                                        value={courseData.department}
                                        defaultValue={courseData.department}
                                        required
                                    >
                                        {departments.map((department) => (
                                            <option
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
                                        placeholder="Credit"
                                        className="input input-bordered input-primary w-full"
                                        value={courseData.credit}
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
                                        placeholder="Duration"
                                        className="input input-bordered input-primary w-full"
                                        value={courseData.duration}
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

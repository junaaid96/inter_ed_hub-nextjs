"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/layout";
import Link from "next/link";
import filterCourseByTeacher from "@/lib/filterCourseByTeacher";

export default function TeacherProfile() {
    const authContext = useAuth();
    const { isLoggedIn, userData, loading } = authContext;
    const router = useRouter();
    const [myCourses, setMyCourses] = useState([]);
    const [courseLoading, setCourseLoading] = useState(true);

    useEffect(() => {
        document.title = "InterEd Hub | Teacher Profile";
        const metaDescription = document.querySelector(
            'meta[name="description"]'
        );
        if (metaDescription) {
            metaDescription.content =
                "An online school management system. This is the teacher profile page.";
        }

        if (!isLoggedIn) {
            router.push("/");
        }

        filterCourseByTeacher(userData.username).then((data) => {
            setMyCourses(data.results);
            setCourseLoading(false);
        });
    }, [router, isLoggedIn, userData]);

    return loading ? (
        <div className="min-h-screen w-24 m-auto">
            <span className="loading loading-infinity loading-lg"></span>
        </div>
    ) : (
        <div className="bg-base-100 min-h-screen py-12">
            <div className="px-12">
                <div className="shadow-md rounded-md overflow-hidden">
                    <div className="px-6 py-8 sm:flex sm:items-center sm:justify-between">
                        <div className="text-center sm:text-left sm:mb-0">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                Hello, {userData.first_name}{" "}
                                {userData.last_name}!
                            </h1>
                            <p className="text-gray-600 mb-2">
                                This is your profile page.
                            </p>
                        </div>
                        <div className="flex items-center mt-4 sm:mt-0">
                            <div className="relative w-32 h-32 overflow-hidden">
                                <Image
                                    fill
                                    src={userData.profile_pic}
                                    alt="Profile Image"
                                />
                            </div>
                            <div className="ml-4">
                                <p className="text-gray-800 font-semibold">
                                    {userData.first_name} {userData.last_name}
                                </p>
                                <p className="text-gray-600">
                                    {userData.email}
                                </p>
                                <Link
                                    className="btn btn-primary btn-sm mt-4"
                                    href={`/teacher/profile/update`}
                                >
                                    Update
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-6">
                        <div className="border-b border-gray-200 pb-4 mb-4">
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                Professional Information
                            </h2>
                            <p className="text-gray-700">
                                <span className="font-semibold">
                                    Designation:
                                </span>{" "}
                                {userData.designation}
                            </p>
                            <p className="text-gray-700">
                                <span className="font-semibold">
                                    Department:
                                </span>{" "}
                                {userData.department}
                            </p>
                        </div>
                        <div className="border-b border-gray-200 pb-4 mb-4">
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                Personal Information
                            </h2>
                            <p className="text-gray-700">
                                <span className="font-semibold">Phone:</span>{" "}
                                {userData.phone}
                            </p>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                About Teacher
                            </h2>
                            <p className="text-gray-700">{userData.bio}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800 my-12">
                    My Courses
                </h1>
                {courseLoading ? (
                    <div className="min-h-screen w-24 m-auto">
                        <span className="loading loading-infinity loading-lg"></span>
                    </div>
                ) : myCourses.length === 0 ? (
                    <p>No courses found.</p>
                ) : (
                    <div className="flex flex-wrap justify-center gap-6">
                        {myCourses.map((myCourse) => (
                            <div
                                key={myCourse.id}
                                className="flex flex-col items-center mb-4"
                            >
                                <div className="card w-96 bg-base-100 shadow-xl">
                                    <figure>
                                        <Image
                                            src={myCourse.image}
                                            alt="Course Cover"
                                            width={384}
                                            height={216}
                                        />
                                    </figure>
                                    <div className="card-body">
                                        <h2 className="card-title">
                                            {myCourse.title}
                                        </h2>
                                        <p>{myCourse.description}</p>
                                        <div className="card-actions justify-end">
                                            <Link href={"/course/update"} className="btn btn-primary">
                                                Update
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

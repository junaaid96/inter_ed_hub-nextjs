"use client";

import Image from "next/image";
import { useEffect } from "react";

export default function TeacherProfile() {
    const token = localStorage.getItem("token");

    useEffect(() => {
        document.title = "InterED Hub | Teacher Profile";
        const metaDescription = document.querySelector(
            'meta[name="description"]'
        );
        if (metaDescription) {
            metaDescription.content =
                "An online school management system. This is the teacher profile page.";
        }
    }, []);

    if (!token) {
        return (
            <div>
                <h1>Unauthorized</h1>
                <p>You must be logged in to view this page.</p>
            </div>
        );
    }

    try {
        const parsedToken = JSON.parse(token);
        const {
            username,
            profile_pic,
            first_name,
            last_name,
            email,
            bio,
            designation,
            department,
            phone,
        } = parsedToken;

        return (
            <div className="bg-gray-100 min-h-screen py-12">
                <div className="px-12">
                    <div className="shadow-md rounded-md overflow-hidden">
                        <div className="px-6 py-8 sm:flex sm:items-center sm:justify-between">
                            <div className="text-center sm:text-left sm:mb-0">
                                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                    Hello, {first_name} {last_name}!
                                </h1>
                                <p className="text-gray-600 mb-2">
                                    This is your profile page.
                                </p>
                            </div>
                            <div className="flex items-center mt-4 sm:mt-0">
                                <div className="relative w-32 h-32 overflow-hidden">
                                    <Image
                                        fill
                                        src={profile_pic}
                                        alt="Profile Image"
                                    />
                                </div>
                                <div className="ml-4">
                                    <p className="text-gray-800 font-semibold">
                                        {first_name} {last_name}
                                    </p>
                                    <p className="text-gray-600">{email}</p>
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
                                    {designation}
                                </p>
                                <p className="text-gray-700">
                                    <span className="font-semibold">
                                        Department:
                                    </span>{" "}
                                    {department}
                                </p>
                            </div>
                            <div className="border-b border-gray-200 pb-4 mb-4">
                                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                    Personal Information
                                </h2>
                                <p className="text-gray-700">
                                    <span className="font-semibold">
                                        Phone:
                                    </span>{" "}
                                    {phone}
                                </p>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                    About Teacher
                                </h2>
                                <p className="text-gray-700">{bio}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800 my-4">
                        All My Courses
                    </h1>
                    <div className="px-12">
                        <div className="card lg:card-side bg-base-100 shadow-xl">
                            <figure>
                                <Image
                                    src={profile_pic}
                                    alt="Course Cover"
                                    width={500}
                                    height={500}
                                />
                            </figure>
                            <div className="card-body">
                                <h2 className="card-title">
                                    Title
                                </h2>
                                <p>
                                    description
                                </p>
                                <div className="card-actions justify-end">
                                    <button className="btn btn-primary">
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error("Error parsing the token:", error);
        return (
            <div>
                <h1>Error</h1>
                <p>There was an error processing your authentication token.</p>
            </div>
        );
    }
}

"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/layout";
import axios from "axios";
import getAllDepartments from "@/lib/getAllDepartments";

export default function StudentProfileUpdate() {
    const authContext = useAuth();
    const { isLoggedIn, studentData, password, loading } = authContext;
    const router = useRouter();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        document.title = "InterEd Hub | Student Profile Update";
        const metaDescription = document.querySelector(
            'meta[name="description"]'
        );
        if (metaDescription) {
            metaDescription.content =
                "An online school management system. This is the student profile update page.";
        }

        if (!isLoggedIn) {
            router.push("/");
        }

        getAllDepartments().then((data) => setDepartments(data));
    }, [router, isLoggedIn]);

    async function handleUpdate(e) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const username = formData.get("username");
        const first_name = formData.get("first_name");
        const last_name = formData.get("last_name");
        const email = formData.get("email");
        const profile_pic = formData.get("profile_pic");
        const bio = formData.get("bio");
        const department = formData.get("department");
        const phone = formData.get("phone");

        const data = {
            username,
            first_name,
            last_name,
            email,
            profile_pic,
            bio,
            department,
            phone,
        };

        try {
            const response = await axios.put(
                "https://inter-ed-hub-drf.onrender.com/students/update/",
                data,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization:
                            "Basic " +
                            Buffer.from(
                                studentData.username + ":" + password
                            ).toString("base64"),
                    },
                }
            );
            window.location.reload();
            setSuccess("Profile Updated Successfully!");
            console.log(response);
        } catch (error) {
            setError("An error occurred. Please try again later.");
            console.error(error);
        }
    }

    return (
        <>
            {loading ? (
                <div className="min-h-screen w-24 m-auto">
                    <span className="loading loading-infinity loading-lg"></span>
                </div>
            ) : (
                <div className="hero min-h-screen">
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
                            <h1 className="text-5xl font-bold">
                                Student Profile Update
                            </h1>
                            <p className="py-6">
                                Welcome! Please update your profile details
                                below.
                            </p>
                            <div className="card flex-shrink-0 w-full shadow-2xl bg-base-100">
                                {studentData.profile_pic ? (
                                    <>
                                        <div className="avatar">
                                            <div className="w-24 m-auto mt-6 rounded">
                                                <Image
                                                    alt="Profile Picture"
                                                    src={
                                                        studentData.profile_pic
                                                    }
                                                    width={100}
                                                    height={100}
                                                    className="circle"
                                                />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <span className="loading loading-spinner text-primary w-12 m-auto mt-6"></span>
                                )}
                                <form
                                    className="card-body"
                                    onSubmit={handleUpdate}
                                    encType="multipart/form-data"
                                >
                                    <div className="form-control">
                                        <label
                                            className="label"
                                            htmlFor="username"
                                        >
                                            <span className="label-text">
                                                Username
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            id="username"
                                            name="username"
                                            placeholder="Username"
                                            className="input input-bordered input-primary"
                                            value={studentData.username}
                                            disabled
                                        />
                                    </div>
                                    <div className="lg:flex lg:gap-6">
                                        <div className="form-control">
                                            <label
                                                className="label"
                                                htmlFor="first_name"
                                            >
                                                <span className="label-text">
                                                    First Name
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                id="first_name"
                                                name="first_name"
                                                placeholder="First Name"
                                                className="input input-bordered input-primary"
                                                defaultValue={
                                                    studentData.first_name
                                                }
                                                required
                                            />
                                        </div>
                                        <div className="form-control">
                                            <label
                                                className="label"
                                                htmlFor="last_name"
                                            >
                                                <span className="label-text">
                                                    Last Name
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                id="last_name"
                                                name="last_name"
                                                placeholder="Last Name"
                                                className="input input-bordered input-primary"
                                                defaultValue={
                                                    studentData.last_name
                                                }
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="lg:flex lg:gap-6">
                                        <div className="form-control">
                                            <label
                                                className="label"
                                                htmlFor="email"
                                            >
                                                <span className="label-text">
                                                    Email
                                                </span>
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                placeholder="Email"
                                                className="input input-bordered input-primary"
                                                value={studentData.email}
                                                disabled
                                            />
                                        </div>
                                        <div className="form-control">
                                            <label
                                                className="label"
                                                htmlFor="phone"
                                            >
                                                <span className="label-text">
                                                    Phone
                                                </span>
                                            </label>
                                            <input
                                                type="tel"
                                                id="phone"
                                                name="phone"
                                                placeholder="Phone"
                                                className="input input-bordered input-primary"
                                                defaultValue={studentData.phone}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-control">
                                        <label
                                            className="label"
                                            htmlFor="profile_pic"
                                        >
                                            <span className="label-text">
                                                Profile Picture
                                            </span>
                                        </label>
                                        <input
                                            type="file"
                                            id="profile_pic"
                                            name="profile_pic"
                                            className="file-input file-input-bordered file-input-primary w-full"
                                        />
                                    </div>
                                    <div className="form-control">
                                        <label className="label" htmlFor="bio">
                                            <span className="label-text">
                                                Bio
                                            </span>
                                        </label>
                                        <textarea
                                            id="bio"
                                            name="bio"
                                            placeholder="Bio"
                                            className="textarea textarea-bordered textarea-primary"
                                            defaultValue={studentData.bio}
                                            required
                                        ></textarea>
                                    </div>
                                    <div className="form-control">
                                        <label
                                            className="label"
                                            htmlFor="department"
                                        >
                                            <span className="label-text">
                                                Department
                                            </span>
                                        </label>
                                        <select
                                            id="department"
                                            name="department"
                                            className="select select-bordered select-primary"
                                            defaultValue={
                                                studentData.department
                                            }
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

                                    <button
                                        type="submit"
                                        className="btn btn-primary mt-6"
                                    >
                                        Update Profile
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

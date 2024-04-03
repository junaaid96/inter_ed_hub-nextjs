"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/layout";
import getAllDepartments from "@/lib/getAllDepartments";

export default function Register() {
    const router = useRouter();
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const authContext = useAuth();
    const { isLoggedIn } = authContext;
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState("");

    useEffect(() => {
        document.title = "InterEd Hub | Teacher Registration";
        const metaDescription = document.querySelector(
            'meta[name="description"]'
        );
        if (metaDescription) {
            metaDescription.content =
                "An online school management system. This is the teacher registration page.";
        }

        if (isLoggedIn) {
            router.push("/");
        }

        getAllDepartments().then((data) => setDepartments(data));
    }, [router, isLoggedIn]);

    async function handleRegister(e) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const username = formData.get("username");
        const first_name = formData.get("first_name");
        const last_name = formData.get("last_name");
        const email = formData.get("email");
        const password = formData.get("password");
        const confirm_password = formData.get("confirm_password");
        const profile_pic = formData.get("profile_pic");
        const bio = formData.get("bio");
        const designation = formData.get("designation");
        const department = formData.get("department");
        const phone = formData.get("phone");

        if (password !== confirm_password) {
            setError("Passwords do not match!");
            return;
        }

        try {
            const response = await axios.post(
                "https://inter-ed-hub-drf.onrender.com/teachers/register/",
                {
                    username,
                    first_name,
                    last_name,
                    email,
                    password,
                    confirm_password,
                    profile_pic,
                    bio,
                    designation,
                    department,
                    phone,
                },
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            console.log(response);

            setSuccess(
                "Registration successful. Please activate your account before login!"
            );
        } catch (error) {
            setError(error.response.data.message);
            console.error("Registration failed:", error);
        }
    }

    return (
        <div className="hero min-h-screen">
            <div className="hero-content flex-col">
                <div className="text-center lg:text-left">
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
                        <div role="alert" className="alert alert-success">
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
                    <h1 className="text-5xl font-bold">Teacher Register</h1>
                    <p className="py-6">
                        Welcome! Please fill in the following details to create
                        your account.
                    </p>
                </div>
                <div className="card flex-shrink-0 w-full shadow-2xl bg-base-100">
                    <form className="card-body" onSubmit={handleRegister}>
                        <div className="form-control">
                            <label className="label" htmlFor="username">
                                <span className="label-text">Username</span>
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                placeholder="Username"
                                className="input input-bordered input-primary"
                                required
                                aria-label="Username"
                            />
                        </div>
                        <div className="lg:flex lg:gap-6">
                            <div className="form-control">
                                <label className="label" htmlFor="first_name">
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
                                    required
                                    aria-label="First Name"
                                />
                            </div>
                            <div className="form-control">
                                <label className="label" htmlFor="last_name">
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
                                    required
                                    aria-label="Last Name"
                                />
                            </div>
                        </div>
                        <div className="lg:flex lg:gap-6">
                            <div className="form-control">
                                <label className="label" htmlFor="email">
                                    <span className="label-text">Email</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="Email"
                                    className="input input-bordered input-primary"
                                    required
                                    aria-label="Email"
                                />
                            </div>
                            <div className="form-control">
                                <label className="label" htmlFor="phone">
                                    <span className="label-text">Phone</span>
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    placeholder="Phone"
                                    className="input input-bordered input-primary"
                                    required
                                    aria-label="Phone"
                                />
                            </div>
                        </div>
                        <div className="lg:flex lg:gap-6">
                            <div className="form-control">
                                <label className="label" htmlFor="password">
                                    <span className="label-text">Password</span>
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder="Password"
                                    className="input input-bordered input-primary"
                                    required
                                    aria-label="Password"
                                />
                            </div>
                            <div className="form-control">
                                <label
                                    className="label"
                                    htmlFor="confirm_password"
                                >
                                    <span className="label-text">
                                        Confirm Password
                                    </span>
                                </label>
                                <input
                                    type="password"
                                    id="confirm_password"
                                    name="confirm_password"
                                    placeholder="Confirm Password"
                                    className="input input-bordered input-primary"
                                    required
                                    aria-label="Confirm Password"
                                />
                            </div>
                        </div>
                        <div className="form-control">
                            <label className="label" htmlFor="profile_pic">
                                <span className="label-text">
                                    Profile Picture
                                </span>
                            </label>
                            <input
                                type="file"
                                id="profile_pic"
                                name="profile_pic"
                                className="input input-bordered input-primary"
                                required
                                aria-label="Profile Picture"
                            />
                        </div>
                        <div className="form-control">
                            <label className="label" htmlFor="bio">
                                <span className="label-text">Bio</span>
                            </label>
                            <textarea
                                id="bio"
                                name="bio"
                                placeholder="Bio"
                                className="textarea textarea-bordered textarea-primary"
                                required
                                aria-label="Bio"
                            ></textarea>
                        </div>
                        <div className="lg:flex lg:gap-6">
                            <div className="form-control">
                                <label className="label" htmlFor="designation">
                                    <span className="label-text">
                                        Designation
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    id="designation"
                                    name="designation"
                                    placeholder="Designation"
                                    className="input input-bordered input-primary"
                                    required
                                    aria-label="Designation"
                                />
                            </div>
                            <div className="form-control">
                                <label className="label" htmlFor="department">
                                    <span className="label-text">
                                        Department
                                    </span>
                                </label>
                                <select
                                    id="department"
                                    name="department"
                                    className="select select-bordered select-primary"
                                    required
                                    value={selectedDepartment}
                                    onChange={(e) =>
                                        setSelectedDepartment(e.target.value)
                                    }
                                >
                                    <option value="" disabled>
                                        Select Department
                                    </option>
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
                        </div>

                        <div className="form-control mt-6">
                            <button type="submit" className="btn btn-primary">
                                Register
                            </button>
                        </div>
                    </form>
                </div>
                <Link href="/teacher/login" className="font-bold">
                    Already have an account? Please{" "}
                    <span className="text-primary">Login</span>
                </Link>
            </div>
        </div>
    );
}

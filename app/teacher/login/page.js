"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/layout";

export default function Login() {
    const router = useRouter();
    const [error, setError] = useState("");
    const authContext = useAuth();
    const { isLoggedIn, setIsLoggedIn } = authContext;

    useEffect(() => {
        document.title = "InterEd Hub | Teacher Login";
        const metaDescription = document.querySelector(
            'meta[name="description"]'
        );
        if (metaDescription) {
            metaDescription.content =
                "An online school management system. This is the teacher login page.";
        }

        if (isLoggedIn) {
            router.push("/");
        }
    }, [router, isLoggedIn]);

    async function handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const username = formData.get("username");
        const password = formData.get("password");

        try {
            const response = await axios.post(
                "https://inter-ed-hub-drf.onrender.com/teachers/login/",
                {
                    username,
                    password,
                }
            );
            localStorage.setItem("password", password);

            console.log(response);

            localStorage.setItem("token", JSON.stringify(response.data.token));

            router.push("/");

            setIsLoggedIn(true);
        } catch (error) {
            setError(error.response.data.message);
            console.error("Login failed:", error);
        }
    }

    return (
        <div className="hero min-h-screen">
            <div className="hero-content flex-col">
                <div className="text-center lg:text-left">
                    {error &&
                        (error ===
                        "Please activate your account before login!" ? (
                            <div
                                role="alert"
                                className="alert alert-warning my-6"
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
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                                <span>{error}</span>
                            </div>
                        ) : (
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
                        ))}
                    <h1 className="text-5xl font-bold">Teacher Login</h1>
                    <p className="py-6">
                        Welcome back! Please enter your credentials to access
                        your account.
                    </p>
                </div>
                <div className="card flex-shrink-0 w-full shadow-2xl bg-base-100">
                    <form className="card-body" onSubmit={handleLogin}>
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
                            <label className="label">
                                <Link
                                    href="#"
                                    className="label-text-alt link link-hover"
                                >
                                    Forgot password?
                                </Link>
                            </label>
                        </div>
                        <div className="form-control mt-6">
                            <button type="submit" className="btn btn-primary">
                                Login
                            </button>
                        </div>
                    </form>
                </div>
                <Link href="/teacher/register" className="font-bold">
                    Don't have an account? Please{" "}
                    <span className="text-primary">Register</span>
                </Link>
            </div>
        </div>
    );
}

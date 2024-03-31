"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchTerm, useAuth } from "../layout";

export default function NavBar() {
    const searchTermContext = useSearchTerm();
    const authContext = useAuth();

    async function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("password");
        authContext.setIsLoggedIn(false);
    }

    const token = localStorage.getItem("token");
    const parsedToken = token ? JSON.parse(token) : null;

    const { first_name, last_name, profile_pic } = parsedToken || {};

    return (
        <div className="navbar bg-base-200 rounded-md">
            <div className="flex-1 max-sm:hidden">
                <Image src="/icon.png" alt="icon" width={60} height={60} />
                <Link href={"/"} className="btn btn-ghost text-xl font-bold">
                    InterEd Hub
                </Link>
                <div className="form-control w-1/3 m-auto">
                    <input
                        id="search"
                        type="text"
                        placeholder="Search"
                        className="input input-bordered w-24 md:w-auto max-sm:hidden"
                        value={searchTermContext.searchTerm}
                        onChange={(e) =>
                            searchTermContext.setSearchTerm(e.target.value)
                        }
                    />
                </div>
            </div>
            <div className="flex-none gap-3 max-sm:justify-between max-sm:flex-1">
                {/* for sm devices */}
                <div className="dropdown lg:hidden md:hidden justify-end">
                    <div
                        tabIndex={0}
                        role="button"
                        className="btn btn-ghost btn-circle"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16M4 18h7"
                            />
                        </svg>
                    </div>
                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
                    >
                        <div className="flex">
                            <Image
                                src="/icon.png"
                                alt="icon"
                                width={30}
                                height={30}
                            />
                            <Link
                                href={"/"}
                                className="btn btn-ghost font-bold"
                            >
                                InterEd Hub
                            </Link>
                        </div>
                        <Link className="btn btn-ghost shadow my-3" href="/">
                            Home
                        </Link>
                        <div className="form-control">
                            <input
                                type="text"
                                placeholder="Search"
                                className="input input-bordered w-40"
                            />
                        </div>
                    </ul>
                </div>
                <Link className="btn btn-ghost shadow max-sm:hidden" href="/">
                    Home
                </Link>
                {authContext.isLoggedIn && (
                    <>
                        <Link
                            className="btn btn-ghost shadow"
                            href="/course/create"
                        >
                            Create Course
                        </Link>
                        <div className="dropdown dropdown-end">
                            <div
                                tabIndex={0}
                                role="button"
                                className="btn btn-ghost btn-circle avatar"
                            >
                                <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                    <Image
                                        alt="Profile Picture"
                                        src={profile_pic}
                                        width={40}
                                        height={40}
                                    />
                                </div>
                            </div>
                            <ul
                                tabIndex={0}
                                className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
                            >
                                <li className="pointer-events-none">
                                    <p className="font-bold">
                                        {first_name} {last_name}
                                    </p>
                                </li>
                                <li>
                                    <Link href="/teacher/profile">Profile</Link>
                                </li>
                                <li>
                                    <button onClick={handleLogout}>
                                        Logout
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </>
                )}
                {!authContext.isLoggedIn && (
                    <>
                        <Link className="btn btn-ghost shadow" href="/login">
                            Login
                        </Link>
                        <Link className="btn btn-ghost shadow" href="/register">
                            Register
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}

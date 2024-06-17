"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchTerm, useAuth } from "@/app/layout";
import { useRouter } from "next/navigation";

export default function NavBar() {
    const searchTermContext = useSearchTerm();
    const { searchTerm, setSearchTerm } = searchTermContext;
    const authContext = useAuth();
    const { isLoggedIn, setIsLoggedIn, teacherData, studentData } = authContext;
    const router = useRouter();

    async function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("password");
        setIsLoggedIn(false);
        router.push("/");
    }

    return (
        <nav className="navbar bg-base-200 rounded-md px-4 py-2">
            <div className="flex-1 flex items-center">
                <Image src="/icon.png" alt="icon" width={60} height={60} />
                <Link
                    href="/"
                    className="btn btn-ghost lg:text-xl lg:font-bold ml-2 text-sm"
                >
                    InterEd Hub
                </Link>
                <div className=" sm:flex form-control w-1/3 mx-auto">
                    <input
                        id="search"
                        type="text"
                        placeholder="Search"
                        className="input input-bordered w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="flex-none gap-3 flex items-center">
                {!isLoggedIn && (
                    <div className="dropdown lg:hidden dropdown-end">
                        <button
                            tabIndex={0}
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
                        </button>
                        <ul
                            tabIndex={0}
                            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
                        >
                            <li>
                                <Link
                                    className="btn btn-ghost shadow btn-sm"
                                    href="/login"
                                >
                                    Login
                                </Link>
                            </li>
                            <li>
                                <Link
                                    className="btn btn-ghost shadow btn-sm"
                                    href="/register"
                                >
                                    Register
                                </Link>
                            </li>
                        </ul>
                    </div>
                )}

                {isLoggedIn && teacherData.user_type === "Teacher" && (
                    <>
                        <div className="hidden lg:block">
                            <Link
                                className="btn btn-ghost shadow"
                                href="/course/create"
                            >
                                Create Course
                            </Link>
                        </div>
                        <div className="dropdown dropdown-end">
                            <button
                                tabIndex={0}
                                className="btn btn-ghost btn-circle avatar"
                            >
                                <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                    <Image
                                        alt="Profile Picture"
                                        src={teacherData.profile_pic}
                                        width={40}
                                        height={40}
                                    />
                                </div>
                            </button>
                            <ul
                                tabIndex={0}
                                className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
                            >
                                <li className="pointer-events-none">
                                    <p className="font-bold">
                                        {teacherData.first_name}{" "}
                                        {teacherData.last_name} (
                                        {teacherData.user_type})
                                    </p>
                                </li>
                                <li>
                                    <Link
                                        className="btn btn-ghost shadow lg:hidden"
                                        href="/course/create"
                                    >
                                        Create Course
                                    </Link>
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
                {isLoggedIn && studentData.user_type === "Student" && (
                    <div className="dropdown dropdown-end">
                        <button
                            tabIndex={0}
                            className="btn btn-ghost btn-circle avatar"
                        >
                            <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                <Image
                                    alt="Profile Picture"
                                    src={studentData.profile_pic}
                                    width={40}
                                    height={40}
                                />
                            </div>
                        </button>
                        <ul
                            tabIndex={0}
                            className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
                        >
                            <li className="pointer-events-none">
                                <p className="font-bold">
                                    {studentData.first_name}{" "}
                                    {studentData.last_name} (
                                    {studentData.user_type})
                                </p>
                            </li>
                            <li>
                                <Link href="/student/profile">Profile</Link>
                            </li>
                            <li>
                                <button onClick={handleLogout}>Logout</button>
                            </li>
                        </ul>
                    </div>
                )}
                {!isLoggedIn && (
                    <div className="hidden lg:block">
                        <Link className="btn btn-ghost shadow" href="/login">
                            Login
                        </Link>
                        <Link className="btn btn-ghost shadow" href="/register">
                            Register
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}

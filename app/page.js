"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import Carousel from "./components/Carousel";
import Hero from "./components/Hero";
import Roadmap from "./components/Roadmap";
import { useSearchTerm } from "./layout";
import getAllDepartments from "@/lib/getAllDepartments";

export default function Home() {
    const searchTermContext = useSearchTerm();
    const [courses, setCourses] = useState({ count: 0, results: [] });
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        async function fetchDepartments() {
            try {
                const data = await getAllDepartments();
                setDepartments(data);
            } catch (error) {
                console.error("Error fetching departments:", error);
            }
        }
        fetchDepartments();
    }, []);

    const filterCourse = async (departmentSlug) => {
        try {
            const response = await axios.get(
                `https://inter-ed-hub-drf.onrender.com/courses/?department=${departmentSlug}`,
                {
                    params: {
                        page_size: currentPage,
                    },
                }
            );
            setCourses(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching courses:", error);
        }
    };

    useEffect(() => {
        async function fetchCourses() {
            try {
                const response = await axios.get(
                    `https://inter-ed-hub-drf.onrender.com/courses/?search=${searchTermContext.searchTerm}`,
                    {
                        params: {
                            page_size: currentPage,
                        },
                    }
                );
                setCourses(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching courses:", error);
            }
        }
        fetchCourses();
    }, [currentPage, searchTermContext.searchTerm]);

    const totalPages = Math.ceil(courses.count / 6);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <main className="container mx-auto my-10 px-4 text-center">
            <Hero />

            {/* All Courses */}
            <h2 className="mt-6 mb-3 text-2xl font-bold">Available Courses</h2>
            {/* Filter Course by Department */}
            <button
                className="btn btn-sm btn-outline btn-rounded mt-2 mr-2"
                onClick={() => filterCourse("")}
            >
                All Departments
            </button>
            {departments.map((department) => (
                <button
                    key={department.id}
                    className="btn btn-sm btn-outline btn-rounded mt-2 mr-2"
                    onClick={() => filterCourse(department.slug)}
                >
                    {department.name}
                </button>
            ))}
            <p className="mt-5">Total Courses Found: {courses.count}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                {loading ? (
                    <span className="loading loading-bars loading-lg"></span>
                ) : (
                    courses.results.map((course) => (
                        <div
                            key={course.id}
                            className="border rounded-lg overflow-hidden shadow-md"
                        >
                            <Link href={`/course/${course.id}`}>
                                <div className="relative h-52">
                                    <Image
                                        fill
                                        src={course.image}
                                        alt={course.title}
                                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                                    />
                                </div>
                            </Link>
                            <div className="p-4">
                                <Link
                                    href={`/course/${course.id}`}
                                    className="block text-lg font-semibold hover:text-blue-500"
                                >
                                    {course.title}
                                </Link>
                                <p className="mt-2 text-gray-700">
                                    {course.description}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination of courses */}
            <div className="join mt-10 flex items-center justify-center">
                {[...Array(totalPages)].map((_, index) => (
                    <input
                        key={index}
                        className="join-item btn btn-square"
                        type="radio"
                        name="options"
                        aria-label={index + 1}
                        defaultChecked={currentPage === index + 1}
                        onClick={() => handlePageChange(index + 1)}
                    />
                ))}
            </div>

            {/* All Teachers */}
            <h2 className="mt-10 text-2xl font-bold">Meet our Teachers</h2>
            <p>
                "Meet the guiding light of our digital classroom journey - the
                teacher of our online school management system, seamlessly
                leading us through the virtual corridors of knowledge."
            </p>
            <div className="w-1/2 m-auto mt-10">
                <Carousel />
            </div>
            {/* Roadmap */}
            <div className="mt-12">
                <h1 className="text-2xl font-bold mb-6">Roadmap</h1>
                <Roadmap />
            </div>
        </main>
    );
}

"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/app/layout";
import getCourse from "@/lib/getCourse";

export default function EnrollButton({ courseId }) {
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const authContext = useAuth();
    const { studentData, password } = authContext;

    useEffect(() => {
        async function checkEnrollment() {
            try {
                const course = await getCourse(courseId);
                const studentName =
                    studentData.first_name + " " + studentData.last_name;
                if (course.enrolled_students.includes(studentName)) {
                    setIsEnrolled(true);
                }
            } catch (error) {
                console.error(error);
            }
        }
        checkEnrollment();
    }, [courseId, studentData]);

    async function handleEnroll() {
        try {
            const response = await axios.post(
                `https://inter-ed-hub-drf.onrender.com/courses/${courseId}/enroll/`,
                {},
                {
                    headers: {
                        Authorization:
                            "Basic " +
                            Buffer.from(
                                studentData.username + ":" + password
                            ).toString("base64"),
                    },
                }
            );
            window.location.reload();
            setError("");
            setSuccess(response.data.message);
            setIsEnrolled(true);
            console.log(response.data);
        } catch (error) {
            setSuccess("");
            setError(error.response.data.message || "You are not a Student!");
            console.error(error);
        }
    }

    return (
        <>
            {studentData.user_type === "Student" && (
                <>
                    {isEnrolled ? (
                        <button className="btn btn-primary" disabled>
                            Enrolled
                        </button>
                    ) : (
                        <button
                            className="btn btn-primary"
                            onClick={handleEnroll}
                        >
                            Enroll
                        </button>
                    )}
                </>
            )}
            {error && (
                <div className="toast">
                    <div className="alert alert-info">
                        <span>{error}</span>
                    </div>
                </div>
            )}
            {success && (
                <div className="toast">
                    <div className="alert alert-success">
                        <span>{success}</span>
                    </div>
                </div>
            )}
        </>
    );
}

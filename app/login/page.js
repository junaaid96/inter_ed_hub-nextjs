"use client";

import { useState } from "react";
import StudentLogin from "../student/login/page";
import TeacherLogin from "../teacher/login/page";

export default function Login() {
    const [activeTab, setActiveTab] = useState("Teacher Login");

    return (
        <div className="my-12 lg:w-1/2 lg:m-auto lg:my-12">
            <div role="tablist" className="tabs tabs-lifted">
                <input
                    type="radio"
                    name="my_tabs_2"
                    role="tab"
                    className="tab"
                    aria-label="Teacher Login"
                    checked={activeTab === "Teacher Login"}
                    onChange={() => setActiveTab("Teacher Login")}
                />
                {activeTab === "Teacher Login" && (
                    <div
                        role="tabpanel"
                        className="tab-content bg-base-100 border-base-300 rounded-box p-6"
                    >
                        <TeacherLogin />
                    </div>
                )}

                <input
                    type="radio"
                    name="my_tabs_2"
                    role="tab"
                    className="tab"
                    aria-label="Student Login"
                    checked={activeTab === "Student Login"}
                    onChange={() => setActiveTab("Student Login")}
                />
                {activeTab === "Student Login" && (
                    <div
                        role="tabpanel"
                        className="tab-content bg-base-100 border-base-300 rounded-box p-6"
                    >
                        <StudentLogin />
                    </div>
                )}
            </div>
        </div>
    );
}

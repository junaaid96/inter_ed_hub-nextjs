"use client";

import { useState } from "react";
import StudentRegister from "../student/register/page";
import TeacherRegister from "../teacher/register/page";

export default function Register() {
    const [activeTab, setActiveTab] = useState("Teacher Register");

    return (
        <div className="my-12 lg:w-1/2 lg:m-auto lg:my-12">
            <div role="tablist" className="tabs tabs-lifted">
                <input
                    type="radio"
                    name="my_tabs_2"
                    role="tab"
                    className="tab"
                    aria-label="Teacher Reg"
                    checked={activeTab === "Teacher Register"}
                    onChange={() => setActiveTab("Teacher Register")}
                />
                {activeTab === "Teacher Register" && (
                    <div
                        role="tabpanel"
                        className="tab-content bg-base-100 border-base-300 rounded-box lg:p-6"
                    >
                        <TeacherRegister />
                    </div>
                )}

                <input
                    type="radio"
                    name="my_tabs_2"
                    role="tab"
                    className="tab w-1/2"
                    aria-label="Student Reg"
                    checked={activeTab === "Student Register"}
                    onChange={() => setActiveTab("Student Register")}
                />
                {activeTab === "Student Register" && (
                    <div
                        role="tabpanel"
                        className="tab-content bg-base-100 border-base-300 rounded-box lg:p-6"
                    >
                       
                        <StudentRegister />
                    </div>
                )}
            </div>
        </div>
    );
}

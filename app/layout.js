"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import { createContext, useState, useEffect, useContext } from "react";
import getTeacher from "@/lib/getTeacher";
import getStudent from "@/lib/getStudent";

const inter = Inter({ subsets: ["latin"] });

const AuthContext = createContext();
const SearchTermContext = createContext();

export default function RootLayout({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [password, setPassword] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [teacherData, setTeacherData] = useState({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        profile_pic: null,
        bio: "",
        designation: "",
        department: "",
        phone: "",
    });
    const [studentData, setStudentData] = useState({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        profile_pic: null,
        bio: "",
        department: "",
        phone: "",
    });
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        document.title = "InterEd Hub";
        const metaDescription = document.querySelector(
            'meta[name="description"]'
        );
        if (metaDescription) {
            metaDescription.content = "An online school management system.";
        }
        
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("token");
            const parsedToken = token ? JSON.parse(token) : null;
            const pass = localStorage.getItem("password") || "";
            setPassword(pass);
            setIsLoggedIn(!!parsedToken); // !! converts to boolean

            if (parsedToken && parsedToken.user_type === "Teacher") {
                getTeacher(parsedToken.teacher_id).then((data) => {
                    setTeacherData(data);
                    setLoading(false);
                });
            } else if (parsedToken && parsedToken.user_type === "Student") {
                getStudent(parsedToken.student_id).then((data) => {
                    setStudentData(data);
                    setLoading(false);
                });
            } else {
                console.log("Token is not available. User needs to log in.");
                setLoading(false);
            }
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn,
                setIsLoggedIn,
                teacherData,
                studentData,
                password,
                loading,
            }}
        >
            <SearchTermContext.Provider value={{ searchTerm, setSearchTerm }}>
                <html lang="en" data-theme="pastel">
                    <body className={inter.className}>
                        <NavBar />
                        {children}
                        <Footer />
                    </body>
                </html>
            </SearchTermContext.Provider>
        </AuthContext.Provider>
    );
}

export function useSearchTerm() {
    return useContext(SearchTermContext);
}

export function useAuth() {
    return useContext(AuthContext);
}

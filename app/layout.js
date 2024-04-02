"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import { createContext, useState, useEffect, useContext } from "react";

const inter = Inter({ subsets: ["latin"] });

const AuthContext = createContext();
const SearchTermContext = createContext();

// export const metadata = {
//     title: "InterED Hub",
//     description: "A online school management system.",
// };

export default function RootLayout({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        document.title = "InterEd Hub";
        const metaDescription = document.querySelector(
            'meta[name="description"]'
        );
        if (metaDescription) {
            metaDescription.content = "An online school management system.";
        }

        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token); // !! converts to boolean
    }, []);

    return (
        <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
            <SearchTermContext.Provider value={{ searchTerm, setSearchTerm }}>
                <html lang="en" data-theme="emerald">
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

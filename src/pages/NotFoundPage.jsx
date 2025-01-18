import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = ({darkMode = true}) => {
    return (
        <div className="w-10/12 mx-auto p-6 text-center">
            <img src="/error-animation.gif" alt="Not Found Animation" className={`w-full max-w-96 mx-auto mt-8 ${darkMode && "invert"}`} />
            <h2 className={`text-3xl font-bold ${darkMode ? "text-white":"text-gray-800"}`}>404 - Page Not Found</h2>
            <p className={`text-lg  ${darkMode ? "text-white":"text-gray-500"}`}>
                Sorry, the page you're looking for doesn't exist.
            </p>
            <Link
                to="/"
                className="relative inline-flex items-center justify-center p-0.5 mt-8 mb-16 me-2 overflow-hidden text-sm font-medium text-purple-600 rounded-lg group bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white  focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800"
            >
                <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-opacity-0">
                    Back to Home
                </span>
            </Link>
        </div>
    );
};

export default NotFoundPage;

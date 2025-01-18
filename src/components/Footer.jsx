import React from "react";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = ({ darkMode }) => {
    return (
        <footer
            className={`${darkMode ? "bg-black text-white" : "bg-gray-200 text-black"
                } pb-4 pt-[64px] xl:fixed bottom-[0%] w-full -z-10`}
        >
            <div className="w-10/12 mx-auto ">

                <div className="w-full max-w-screen-xl mx-auto p-4 py-8">
                    <div className="flex items-center justify-between max-xl:block">
                        <div>
                            <Link to="/" className="flex items-center mb-4 mb-0 space-x-3 rtl:space-x-reverse">
                                <img src={darkMode?"/logo-dark.png":"/logo-light.png"} className="h-8" alt="Flowbite Logo" />
                                <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Tutors Hub</span>
                            </Link>
                            <div>
                                <span className="block mt-2 text-sm ">Your trusted platform to get a perfect tutor for you or your family.</span>
                            </div>
                            
                        </div>
                        <div className="">
                            <div className="mb-4 font-bold text-lg ">
                                <span>Quick Links</span>
                            </div>
                            <ul className="flex flex-wrap items-center mb-4 text-sm font-medium text-gray-500  dark:text-gray-400">
                                <li>
                                    <a href="#" className="hover:underline me-4 md:me-6">About</a>
                                </li>
                                <li>
                                    <a href="#" className="hover:underline me-4 md:me-6">Privacy Policy</a>
                                </li>
                                <li>
                                    <a href="#" className="hover:underline me-4 md:me-6">Licensing</a>
                                </li>
                                <li>
                                    <a href="#" className="hover:underline">Contact</a>
                                </li>
                            </ul>
                            <div>
                                <div className="flex mt-4 space-x-4">
                                    <a
                                        href="https://facebook.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-white text-blue-700"
                                    >
                                        <FaFacebook size={24} />
                                    </a>
                                    <a
                                        href="https://instagram.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-white text-pink-700"
                                    >
                                        <FaInstagram size={24} />
                                    </a>
                                    <a
                                        href="https://twitter.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-white text-blue-500"
                                    >
                                        <FaTwitter size={24} />
                                    </a>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                    <hr className="my-6 border-gray-200 mx-auto dark:border-gray-700 " />
                    <span className="block text-sm text-gray-500 text-center dark:text-gray-400">© {new Date().getFullYear()} Tutors System. All rights reserved.</span>
                </div>



            </div>
        </footer>
    );
};

export default Footer;

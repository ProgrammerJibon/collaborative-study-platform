import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaChalkboardTeacher, FaBookReader, FaHome, FaUser, FaUsers } from 'react-icons/fa';
import { IoIosCreate } from 'react-icons/io';
import { MdEditNote, MdOutlineEdit } from 'react-icons/md';
import { FaGears } from 'react-icons/fa6';
import { LuComponent } from 'react-icons/lu';

const Dashboard = ({ user }) => {
    const navigate = useNavigate();
    const path = encodeURIComponent(location.pathname);
    useEffect(() => {
        if (!user) {
            navigate("/login?next=" + path);
        }
    }, [user]);
    if (!user) {
        return "Login required...";
    }

    const links = {
        default: [
            { path: '/', label: 'Home', icon: <FaHome /> },
        ],
        tutor: [
            { path: '/create-study-session', label: 'Create Study Session', icon: <FaChalkboardTeacher /> },
            { path: '/view-all-study-session', label: 'View Study Sessions', icon: <FaBookReader /> },
        ],
        student: [
            { path: '/view-booked-session', label: 'View Booked Session', icon: <FaBookReader /> },
            { path: '/create-note', label: 'Create Personal Note', icon: <IoIosCreate /> },
            { path: '/view-my-notes', label: 'Manage Personal Notes', icon: <MdEditNote /> },
        ],
        admin: [
            { path: '/view-all-users', label: 'View All Users', icon: <FaUsers /> },
            { path: '/manage-all-study-session', label: 'View Study Sessions', icon: <FaBookReader /> },
        ]
    };


    const userLinks = links["default"].concat(user.role in links ? links[user.role] : []) || [];

    return (
        <div className="w-10/12 mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">{user?.role?.toCapitalize()} Dashboard</h2>
            <div className="flex flex-wrap ">
                {userLinks.map((link, index) => (
                    <Link
                        key={index}
                        to={link.path}
                        className="flex flex-col items-center justify-center p-4 my-4 mr-4  rounded shadow-sm shadow-gray-500 hover:bg-blue-500 hover:text-white transition w-[256px] h-[128px]"
                    >
                        <div className="text-3xl mb-2">{link.icon}</div>
                        <span className="text-center font-medium ">{link.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HashLoader } from 'react-spinners';
import { toast } from 'react-toastify';

const ViewAllStudySessions = ({ user }) => {
    const navigate = useNavigate();
    const path = encodeURIComponent(location.pathname);
    useEffect(() => {
        if (!user) {
            navigate("/login?next=" + path);
        }
    }, [user]);
    
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 5;

    

    const fetchSessions = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const response = await fetch(
                `http://localhost:5000/tutor-sessions?userId=${user._id}&page=${page}&limit=${limit}`
            );
            const data = await response.json();
            if (response.ok) {
                setSessions(data.sessions);
                setTotalPages(Math.ceil(data.total / limit));
            } else {
                toast.error(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error fetching sessions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, [user, page]);

    const handlePageChange = (newPage) => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        })
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    if (!user) {
        return <p>Please log in to view your study sessions.</p>;
    }

    return (
        <div className="w-10/12 mx-auto p-4 pb-32">
            <h2 className="text-2xl font-bold mb-4">View All Study Sessions</h2>
            {isLoading ? (
                <div>
                    <p>Loading sessions...</p>
                    <HashLoader color='yellow' />
                </div>
            ) : (
                <>
                    <div className="grid gap-4">
                        {sessions.map((session) => (
                            <div key={session._id} className="border p-4 rounded shadow">
                                <div className="text-lg font-bold">{session?.title}</div>
                                <div>{session.description}</div>
                                <div>
                                    Status:{' '}
                                    <span
                                        className={`font-bold ${session.status === 'rejected'
                                            ? 'text-red-500'
                                            : session.status === 'pending'
                                                ? 'text-yellow-500'
                                                : 'text-green-500'
                                            }`}
                                    >
                                        {session.status}
                                    </span>
                                </div>

                                {session.status === 'rejected' && (
                                    <div>
                                        <div className="text-sm">Reason: {session.rejectionReason}</div>
                                        <div className="text-sm">Admin Feedback: {session.feedback}</div>
                                        <button
                                            onClick={() => handleRequestApproval(session._id)}
                                            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                        >
                                            Request Approval
                                        </button>
                                    </div>
                                )}

                                {session.status === 'approved' && (
                                    <div className="flex space-x-2">
                                        <Link
                                            to={`/upload-materials/${session._id}`}
                                            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                        >
                                            <span>Upload Materials</span>
                                        </Link>
                                        <Link
                                            to={`/view-materials/${session._id}`}
                                            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                        >
                                            <span>View Materials</span>
                                        </Link>
                                    </div>
                                )}
                                <Link
                                    to={`/study-session/${session._id}`}
                                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    <span>View Details</span>
                                </Link>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center mt-4 space-x-2">
                        <button
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 1}
                            className="px-4 py-2 bg-gray-500 rounded disabled:opacity-50"
                        >
                            Previous
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => handlePageChange(i + 1)}
                                className={`px-4 py-2 ${page === i + 1
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-500'
                                    } rounded`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page === totalPages}
                            className="px-4 py-2 bg-gray-500  rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ViewAllStudySessions;

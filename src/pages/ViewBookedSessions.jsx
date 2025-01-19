import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HashLoader } from 'react-spinners';
import { toast } from 'react-toastify';

const ViewBookedSessions = ({ user }) => {
    const navigate = useNavigate();
    const path = encodeURIComponent(location.pathname);
    useEffect(() => {
        if (!user) {
            navigate("/login?next=" + path);
        }else{
            fetchBookedSessions();
        }
    }, [user]);
    
    const [bookedSessions, setBookedSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const fetchBookedSessions = async () => {
        if (!user) {
            toast.error('Please log in to view your booked sessions.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`https://tutor-hub-beta.vercel.app/booked-sessions?studentEmail=${user.email}`);
            const data = await response.json();
            if (response.ok) {
                setBookedSessions(data);
            } else {
                toast.error(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error fetching booked sessions:', error);
            toast.error('Failed to fetch booked sessions. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };


    if (!user) {
        return "Login required...";
    }

    return (
        <div className="w-10/12 mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">My Booked Study Sessions</h2>
            {isLoading ? (
                <div>
                    <span>Loading your booked sessions...</span>
                    <HashLoader color='yellow' />
                </div>
            ) : (
                bookedSessions.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bookedSessions.map((session) => (
                        <div key={session._id} className="border p-4 rounded shadow">
                            <h3 className="text-lg font-bold">{session.title}</h3>
                            <p><strong>Tutor:</strong> {session.tutorName}</p>
                            <p><strong>Date:</strong> {new Date(session.classStartDate).toLocaleDateString()}</p>
                            <div className='flex space-x-2'>
                                <button
                                    onClick={() => navigate(`/study-session/${session._id}`)}
                                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    View Details
                                </button>
                                <Link
                                    to={"/view-materials/" + session._id}
                                    className="mt-2 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                                >
                                    <span>View Materials</span>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div> : <div>Nothing found...</div>
            )}
        </div>
    );
};

export default ViewBookedSessions;

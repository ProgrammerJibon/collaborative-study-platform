import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import StudySessionCard from './StudySessionCard';
import { HashLoader } from 'react-spinners';

const StudySessionsSection = () => {
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSessions = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('https://tutor-hub-beta.vercel.app/ongoing-sessions');
            const data = await response.json();
            if (response.ok) {
                setSessions(data.slice(0, 6)); // Display only the first 6 sessions
            } else {
                toast.error(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error fetching study sessions:', error);
            toast.error('Failed to fetch study sessions. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    return (
        <div className="container mx-auto p-4 my-16">
            <h2 className="text-2xl font-bold mb-4 text-center">Study Sessions</h2>
            {isLoading ? (
                <div>
                    <p>Loading sessions...</p>
                    <HashLoader color='yellow'/>
                </div>
            ) : (
                sessions.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sessions.map((session) => {                        

                        return (
                            <StudySessionCard key={session._id} session={session} />
                        );
                    })}
                </div> : <div className='text-center text-sm'>No sessions registration is ongoing</div>
            )}
        </div>
    );
};

export default StudySessionsSection;

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import HashLoader from 'react-spinners/HashLoader';
import StudySessionCard from '../components/StudySessionCard';
import { useNavigate } from 'react-router-dom';

const AllSessions = () => {
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [lastId, setLastId] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    const navigate = useNavigate();
    // useEffect(() => {
    //     if (!user) {
    //         navigate("/login?next=" + encodeURIComponent(location.pathname));
    //     }
    // }, [user, navigate]);

    const loaderRef = useRef();

    const fetchSessions = async () => {
        if (isLoading || !hasMore) return;

        if(lastId == null){
            setSessions([]);
        }

        setIsLoading(true);
        try {
            const response = await fetch(
                `https://tutor-hub-beta.vercel.app/all-sessions?search=${searchQuery}&status=${filterStatus}&lastId=${lastId || ''}`
            );
            const data = await response.json();

            if (response.ok) {
                if (data.length > 0) {
                    setSessions((prev) => [...prev, ...data]);
                    setLastId(data[data.length - 1]._id);
                } else {
                    setHasMore(false); 
                }
            } else {
                toast.error(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error fetching sessions:', error);
            toast.error('Failed to fetch sessions. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setSessions([]);
        setLastId(null);
        setHasMore(true);
        setIsLoading(false);
        fetchSessions();
    }, [searchQuery, filterStatus]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    fetchSessions();
                }
            },
            { threshold: 1.0 }
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => observer.disconnect();
    }, [loaderRef, hasMore, isLoading]);

    return (
        <div className="w-10/12 mx-auto p-4 pb-32">
            <h2 className="text-2xl font-bold mb-4">All Study Sessions</h2>

            <div className="flex space-x-4 mb-4">
                <input
                    type="text"
                    placeholder="Search by title, tutor name, or email"
                    value={searchQuery}
                    onChange={(e) => {
                        setLastId(null);
                        setSearchQuery(e.target.value);
                    }}
                    className="p-2 w-full border rounded"
                />
                <select
                    value={filterStatus}
                    onChange={(e) => {
                        setLastId(null);
                        setFilterStatus(e.target.value);
                    }}
                    className="p-2 border rounded"
                >
                    <option value="">All Sessions</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="outdated">Outdated</option>
                </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sessions.map((session) => (
                    <StudySessionCard session={session} key={session._id} />
                ))}
            </div>

            {hasMore && (
                <div className="flex justify-center mt-4" ref={loaderRef}>
                    <HashLoader color="yellow" />
                </div>
            )}

            {!hasMore && <p className="text-center mt-4">No more sessions to load.</p>}
        </div>
    );
};

export default AllSessions;

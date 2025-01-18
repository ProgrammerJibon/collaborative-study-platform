import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import HashLoader from 'react-spinners/HashLoader';
import { Link, useNavigate } from 'react-router-dom';

const ManageAllStudySessions = ({ user }) => {
    const [studySessions, setStudySessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [actionType, setActionType] = useState(''); // 'Approve' or 'Update'
    const [formData, setFormData] = useState({ regFee: '', status: '' });

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(5);

    const navigate = useNavigate();
    const path = encodeURIComponent(location.pathname);
    useEffect(() => {
        if (!user) {
            navigate("/login?next=" + path);
        }
    }, [user]);
    




    const fetchStudySessions = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(
                `http://localhost:5000/manage-study-sessions?search=${searchQuery}&status=${filterStatus}&page=${currentPage}&limit=${limit}`
            );
            const data = await response.json();
            if (response.ok) {
                setStudySessions(data.studySessions);
                setTotalPages(data.totalPages);
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


    const handleAction = async (e) => {
        e.preventDefault();

        if (!selectedSession) return;

        if (formData.status === '') {
            toast.error('Please fill in all fields.');
            return;
        }

        setIsSubmitting(true);

        try {
            const url =
                actionType === 'Approve'
                    ? `http://localhost:5000/approve-session/${selectedSession._id}`
                    : `http://localhost:5000/update-session/${selectedSession._id}`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await response.json();
            if (response.ok) {
                toast.success(`${actionType} successful!`);
                fetchStudySessions();
                setSelectedSession(null);
            } else {
                toast.error(`${result.error}`);
            }
        } catch (error) {
            console.error(`Error during ${actionType}:`, error);
            toast.error(`Failed to ${actionType.toLowerCase()} session. Please try again.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (sessionId) => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`http://localhost:5000/delete-session/${sessionId}`, {
                method: 'DELETE',
            });

            const result = await response.json();
            if (response.ok) {
                toast.success('Session deleted successfully!');
                fetchStudySessions();
            } else {
                toast.error(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error('Error deleting session:', error);
            toast.error('Failed to delete session. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        fetchStudySessions();
    }, [searchQuery, filterStatus, currentPage]);


    if (!user) {
        return "Login required...";
    }else if(user?.role != "admin"){
        return "Admin required...";
    }



    return (
        <div className="w-10/12 mx-auto p-4 overflow-hidden pb-32">
            <h2 className="text-2xl font-bold mb-4">Manage All Study Sessions</h2>
            <div className="mb-4 flex space-x-4">
                <input
                    type="text"
                    placeholder="Search by title, tutor name, or email"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-2 border rounded"
                />
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="p-2 border rounded"
                >
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>
            {isLoading ? (
                <div>
                    <span>Loading...</span>
                    <HashLoader color="#4A90E2" size={50} />
                </div>
            ) : (
                <>
                    {studySessions.length > 0 ? <div className='max-xl:overflow-x-scroll  shadow-lg shadow-gray-800'>
                        <table className="table-auto max-xl:w-max w-full  border-collapse border border-gray-300 ">
                            <thead>
                                <tr>
                                    <th className="border border-gray-300 p-2">Title</th>
                                    <th className="border border-gray-300 p-2">Tutor Name</th>
                                    <th className="border border-gray-300 p-2">Tutor Email</th>
                                    <th className="border border-gray-300 p-2">Feee</th>
                                    <th className="border border-gray-300 p-2">Dates</th>
                                    <th className="border border-gray-300 p-2">Status</th>
                                    <th className="border border-gray-300 p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studySessions.map((session) => (
                                    <tr key={session._id}>
                                        <td className="border border-gray-300 p-2">{session.title}</td>
                                        <td className="border border-gray-300 p-2">{session.tutorName}</td>
                                        <td className="border border-gray-300 p-2">{session.tutorEmail}</td>
                                        <td className="border border-gray-300 p-2">{session.regFee}</td>
                                        <td className="border border-gray-300 p-2">
                                            <div className='text-sm'>
                                                <div>
                                                    <span>Registration Schedule: </span>
                                                    <div className='font-semibold'>
                                                        <span></span>
                                                        <span>{new Date(session.regStartDate).toLocaleDateString()}</span>
                                                        <span> to </span>
                                                        <span>{new Date(session.regEndDate).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <span>Class Schedule: </span>
                                                    <div className='font-semibold'>
                                                        <span>{new Date(session.classStartDate).toLocaleDateString()}</span>
                                                        <span> to </span>
                                                        <span>{new Date(session.classEndDate).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <div>
                                                <span>{session.status}</span>
                                            </div>
                                            {session.rejectionReason && <div className="text-xs">
                                                <span>Rejection Reason: </span>
                                                <span>{session.rejectionReason}</span>
                                            </div>}
                                        </td>
                                        <td className="border border-gray-300 p-2 space-x-2  ">
                                            {session.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedSession(session);
                                                            setActionType('Approve');
                                                            setFormData({ regFee: session.regFee, status: 'approved' });
                                                        }}
                                                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            // handleReject(session._id)
                                                            setSelectedSession(session);
                                                            setActionType('Reject');
                                                            setFormData({ regFee: session.regFee, status: 'rejected' });
                                                        }}
                                                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            {session.status === 'approved' && (
                                                <div className='flex justify-stretch flex-col space-y-2  flex-wrap w-min'>


                                                    <button
                                                        onClick={() => {
                                                            setSelectedSession(session);
                                                            setActionType('Update');
                                                            setFormData({ regFee: session.regFee, status: session.status });
                                                        }}
                                                        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                                                    >
                                                        Update
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(session._id)}
                                                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                                    >
                                                        Delete
                                                    </button>
                                                    <Link
                                                        to={"/view-materials/" + session._id}
                                                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                                    >
                                                        Materials
                                                    </Link>
                                                </div>
                                            )}

                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div> : <div>No results for your query</div>}
                    <div className="flex justify-center mt-4 space-x-2">
                        <button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-gray-500 rounded disabled:opacity-50"
                        >
                            Previous
                        </button>
                        {Array.from({ length: totalPages }, (_, index) => (
                            <button
                                key={index + 1}
                                onClick={() => setCurrentPage(index + 1)}
                                disabled={currentPage === index + 1}
                                className={`px-4 py-2 rounded ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-500 hover:bg-gray-400'}`}
                            >
                                {index + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-gray-500  rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </>
            )}

            {selectedSession && (
                <form onSubmit={handleAction} className="fixed top-16 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center ]">
                    <div className="bg-inherit p-6 rounded shadow-lg w-96 backdrop-blur-sm">
                        <h3 className="text-lg font-bold mb-4">{actionType} Session</h3>
                        {formData.status == "approved" && <div className="mb-4">
                            <label className="block text-sm font-bold mb-2">Fee</label>
                            <input
                                type="number"
                                value={formData.regFee}
                                onChange={(e) => setFormData({ ...formData, regFee: e.target.value })}
                                className="w-full p-2 border rounded"
                                placeholder="Enter registration fee"
                            />
                        </div>}

                        {formData.status == "rejected" && <>
                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2">Rejection Reason</label>
                                <input
                                    type="text"
                                    value={formData.rejectionReason}
                                    onChange={(e) => setFormData({ ...formData, rejectionReason: e.target.value })}
                                    className="w-full p-2 border rounded"
                                    placeholder="Enter rejection reason"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2">Rejection Feedback</label>
                                <input
                                    type="text"
                                    value={formData.feedback}
                                    onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                                    className="w-full p-2 border rounded"
                                    placeholder="Enter your feedback"
                                    required
                                />
                            </div>
                        </>}

                        <div className="mb-4">
                            <label className="block text-sm font-bold mb-2">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full p-2 border rounded"
                            >
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                type='submit'
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Submit
                            </button>
                            <button
                                type='button'
                                onClick={() => setSelectedSession(null)}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ManageAllStudySessions;

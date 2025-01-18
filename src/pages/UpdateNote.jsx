import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import HashLoader from 'react-spinners/HashLoader';
import { Link, useNavigate, useParams } from 'react-router-dom';

const UpdateNote = ({ user }) => {
    const navigate = useNavigate();
    const path = encodeURIComponent(location.pathname);
    useEffect(() => {
        if (!user) {
            navigate("/login?next=" + path);
        }
    }, [user]);
    

    const { noteId } = useParams();
    const [noteData, setNoteData] = useState({
        _id: '',
        email: user?.email || '',
        title: '',
        description: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchNoteData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/get-note/${noteId}`);
                const data = await response.json();

                if (response.ok) {
                    setNoteData({
                        _id: data._id,
                        email: data.email,
                        title: data.title,
                        description: data.description,
                    });
                } else {
                    toast.error(`Error: ${data.error}`);
                }
            } catch (error) {
                console.error('Error fetching note data:', error);
                toast.error('Failed to fetch note data.');
            }
        };

        fetchNoteData();
    }, [noteId]);

    if (!user) {
        return "Login required...";
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNoteData({ ...noteData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch(`http://localhost:5000/update-note/${noteId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(noteData),
            });

            const result = await response.json();
            if (response.ok) {
                toast.success('Note updated successfully!');
                navigate('/view-my-notes');
            } else {
                toast.error(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error('Error updating note:', error);
            toast.error('Failed to update note. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-10/12 mx-auto py-16">
            <div className='flex justify-between items-center'>
                <h2 className="text-2xl font-bold mb-4">Update Note</h2>
                <Link
                    to={"/view-my-notes"}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    <span>View All Notes</span>
                </Link>
            </div>
            <form onSubmit={handleSubmit} className="py-8 rounded shadow-md">
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-2">Note ID</label>
                    <input
                        type="email"
                        name="email"
                        value={noteData._id}
                        readOnly
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-2">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={noteData.email}
                        readOnly
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-2">Title</label>
                    <input
                        type="text"
                        name="title"
                        value={noteData.title}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-2">Description</label>
                    <textarea
                        name="description"
                        value={noteData.description}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div className="flex justify-center mt-4 space-x-4">
                    {isSubmitting ? (
                        <HashLoader color="#f59e42" loading={isSubmitting} size={50} />
                    ) : (
                        <button
                            type="submit"
                            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                        >
                            Submit
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default UpdateNote;

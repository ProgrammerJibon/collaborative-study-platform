import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HashLoader } from 'react-spinners';
import { toast } from 'react-toastify';

const ViewMyNotes = ({ user }) => {
    const [notes, setNotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const navigate = useNavigate();
    const path = encodeURIComponent(location.pathname);
    useEffect(() => {
        if (!user) {
            navigate("/login?next=" + path);
        }else{
            fetchNotes();
        }
    }, [user, navigate]);
    if (!user) {
        return "Login required...";
    }


    const fetchNotes = async () => {
        if (!user) {
            toast.error('Please log in to view your notes.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/my-notes?userId=${user._id}`);
            const data = await response.json();
            if (response.ok) {
                setNotes(data);
            } else {
                toast.error(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error fetching notes:', error);
            toast.error('Failed to fetch notes. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = (noteId) => {
        navigate(`/update-note/${noteId}`);
    };

    const handleDelete = async (noteId) => {
        if (!user) {
            toast.error('Please log in to delete a note.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/delete-note/${noteId}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (response.ok) {
                toast.success('Note deleted successfully!');
                setNotes(notes.filter((note) => note._id !== noteId)); // Remove deleted note from state
            } else {
                toast.error(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error deleting note:', error);
            toast.error('Failed to delete note. Please try again.');
        }
    };


    return (
        <div className="w-10/12 mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">My Notes</h2>
            {isLoading ? (
                <div >
                    <p>Loading your notes...</p>
                    <HashLoader color='yellow' />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {notes.map((note) => (
                        <div key={note._id} className="border p-4 rounded shadow">
                            <h3 className="text-lg font-bold">{note.title}</h3>
                            <p><strong>Email:</strong> {note.email}</p>
                            <p><strong>Description:</strong> {note.description}</p>
                            <div className="flex justify-between items-center mt-4">
                                <button
                                    onClick={() => handleUpdate(note._id)}
                                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                                >
                                    Update
                                </button>
                                <button
                                    onClick={() => handleDelete(note._id)}
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ViewMyNotes;

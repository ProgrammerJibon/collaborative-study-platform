import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const ViewMaterials = ({ user }) => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [materials, setMaterials] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const path = encodeURIComponent(location.pathname);
    useEffect(() => {
        if (!user) {
            navigate("/login?next=" + path);
        }
    }, [user]);
    


    const fetchMaterials = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`https://tutor-hub-beta.vercel.app/view-materials/${sessionId}`);
            const data = await response.json();
            if (response.ok) {
                setMaterials(data);
            } else {
                toast.error(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error fetching materials:', error);
            toast.error('Failed to fetch materials. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (materialsId) => {
        try {
            const response = await fetch(`https://tutor-hub-beta.vercel.app/delete-material/${materialsId}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (response.ok) {
                toast.success('Material deleted successfully!');
                fetchMaterials(); // Refresh materials list after deletion
            } else {
                toast.error(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error deleting material:', error);
            toast.error('Failed to delete material. Please try again.');
        }
    };

    const handleUpdate = (materialsId) => {
        navigate(`/update-materials/${materialsId}`);
    };

    useEffect(() => {
        fetchMaterials();
    }, [sessionId]);

    if (!user) {
        return "Login required...";
    }

    return (
        <div className="w-10/12 mx-auto p-4">
            <div className='flex justify-between space-x-2 my-2'>
                <h2 className="text-2xl font-bold mb-4">View Materials</h2>
                {user?.role == "tutor" && <Link
                    to={`/upload-materials/${sessionId}`}
                    className='bg-green-700 text-white px-4 items-center flex rounded hover:bg-green-600'
                >
                    <span>Upload</span>
                </Link>}
            </div>

            {isLoading ? (
                <p>Loading materials...</p>
            ) : (materials?.length > 0 ? (

                <div className="flex flex-wrap space-x-4">
                    {materials.map((material) => (
                        <div key={material._id} className="border p-4 rounded shadow">
                            <h3 className="text-lg font-bold">{material.title}</h3>
                            {material.driveLink ? <p>Google Drive Link: <a href={material.driveLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Open</a></p> : "no drive link"}
                            {material.imageBase64 && (
                                <img src={material.imageBase64} alt={material.title} className="w-[256px] h-[256px] mt-2 rounded object-cover" />
                            )}
                            <div className="flex space-x-4 mt-4">
                                {user?.role == "tutor" && <button
                                    onClick={() => handleUpdate(material._id)}
                                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                                >
                                    Update
                                </button>}
                                {(user?.role == "tutor" || user?.role == "admin") && <button
                                    onClick={() => handleDelete(material._id)}
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                >
                                    Delete
                                </button>}
                                {user?.role == "student" && <Link
                                    to={material.imageBase64}
                                    download={material.title}
                                    className='w-[256px] text-center py-2 bg-yellow-600 rounded-sm'>
                                    <span>Download Image</span>
                                </Link>}
                            </div>
                        </div>
                    ))}
                </div>
            ) : "No materials yet...")}
        </div>
    );
};

export default ViewMaterials;

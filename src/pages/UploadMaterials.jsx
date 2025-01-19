import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const UploadMaterials = ({ user }) => {


    const navigate = useNavigate();
    const path = encodeURIComponent(location.pathname);
    useEffect(() => {
        if (!user) {
            navigate("/login?next=" + path);
        }
    }, [user]);
    

    const { sessionId } = useParams();
    const [formData, setFormData] = useState({
        title: '',
        studySessionId: sessionId,
        tutorEmail: user?.email || '',
        image: null,
        driveLink: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!user) {
        return "Login required...";
    }

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setFormData({ ...formData, [name]: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const resizeImageToBase64 = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const maxDimension = 256;

                    let width = img.width;
                    let height = img.height;

                    if (width > height && width > maxDimension) {
                        height = (height * maxDimension) / width;
                        width = maxDimension;
                    } else if (height > width && height > maxDimension) {
                        width = (width * maxDimension) / height;
                        height = maxDimension;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    ctx.drawImage(img, 0, 0, width, height);
                    const base64 = canvas.toDataURL('image/jpeg');
                    resolve(base64);
                };
                img.src = event.target.result;
            };
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let base64Image = null;

            if (formData.image) {
                base64Image = await resizeImageToBase64(formData.image);
            }

            const response = await fetch(`https://tutor-hub-beta.vercel.app/upload-materials/${sessionId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: formData.title,
                    studySessionId: formData.studySessionId,
                    tutorEmail: formData.tutorEmail,
                    driveLink: formData.driveLink,
                    imageBase64: base64Image,
                }),
            });

            const result = await response.json();
            if (response.ok) {
                toast.success('Material uploaded successfully!');
                navigate('/view-materials/' + sessionId);
            } else {
                toast.error(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error('Error uploading material:', error);
            toast.error('Failed to upload material. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mx-auto p-4 w-10/12">
            <div className='flex justify-between space-x-2 my-2'>
                <h2 className="text-2xl font-bold mb-4">Upload Materials</h2>
                <Link
                    to={`/view-materials/${sessionId}`}
                    className='bg-green-700 text-white px-4 items-center flex rounded hover:bg-green-600'
                >
                    <span>View Materials</span>
                </Link>
            </div>
            <form onSubmit={handleSubmit} className="py-6 my-6 rounded shadow-md">
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-2">Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-2">Study Session ID</label>
                    <input
                        type="text"
                        name="studySessionId"
                        value={formData.studySessionId}
                        readOnly
                        className="w-full p-2 border rounded "
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-2">Tutor Email</label>
                    <input
                        type="email"
                        name="tutorEmail"
                        value={formData.tutorEmail}
                        readOnly
                        className="w-full p-2 border rounded "
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-2">Image Upload</label>
                    <input
                        type="file"
                        name="image"
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        accept="image/*"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-2">Google Drive Link (Optional)</label>
                    <input
                        type="url"
                        name="driveLink"
                        value={formData.driveLink}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div className='flex space-x-2 justify-between my-2'>

                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Uploading...' : 'Upload'}
                    </button>

                </div>
            </form>
        </div>
    );
};

export default UploadMaterials;

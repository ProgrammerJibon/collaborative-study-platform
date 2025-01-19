import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const UpdateMaterial = ({ user }) => {
    const navigate = useNavigate();
    const path = encodeURIComponent(location.pathname);
    useEffect(() => {
        if (!user) {
            navigate("/login?next=" + path);
        }
    }, [user]);
    

    const { materialId } = useParams();

    const [formData, setFormData] = useState({
        title: '',
        studySessionId: '',
        tutorEmail: user?.email || '',
        image: null,
        driveLink: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);




    useEffect(() => {
        const fetchMaterial = async () => {
            try {
                const response = await fetch(`https://tutor-hub-beta.vercel.app/get-material/${materialId}`);
                const data = await response.json();

                if (response.ok) {
                    console.log(data);

                    setFormData({
                        title: data.title,
                        studySessionId: data.studySessionId,
                        tutorEmail: data.tutorEmail,
                        driveLink: data.driveLink,
                        image: null,
                        imageBase64: data.imageBase64
                    });
                } else {
                    toast.error(`Error: ${data.error}`);
                }
            } catch (error) {
                console.error('Error fetching material data:', error);
                toast.error('Failed to fetch material data.');
            }
        };

        fetchMaterial();
    }, [materialId]);

    const handleChange = async (e) => {
        const { name, value, files } = e.target;

        if (files) {
            const selectedFile = files[0];

            setFormData((prevFormData) => ({
                ...prevFormData,
                [name]: selectedFile,
            }));

            let imageBase64 = await resizeImageToBase64(selectedFile);

            setFormData((prevFormData) => ({
                ...prevFormData,
                imageBase64,
            }));
        } else {
            setFormData((prevFormData) => ({
                ...prevFormData,
                [name]: value,
            }));
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



            const response = await fetch(`https://tutor-hub-beta.vercel.app/update-material/${materialId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: formData.title,
                    studySessionId: formData.studySessionId,
                    tutorEmail: formData.tutorEmail,
                    driveLink: formData.driveLink,
                    imageBase64: formData.imageBase64,
                }),
            });

            const result = await response.json();
            if (response.ok) {
                toast.success('Material updated successfully!');
                navigate(`/view-materials/${formData.studySessionId}`);
            } else {
                toast.error(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error('Error updating material:', error);
            toast.error('Failed to update material. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return "Login required...";
    }

    return (
        <div className="mx-auto p-4 w-10/12">
            <div className="flex justify-between space-x-2 my-2">
                <h2 className="text-2xl font-bold mb-4">Update Material</h2>
                <Link
                    to={`/view-materials/${formData.studySessionId}`}
                    className="bg-green-700 text-white px-4 items-center flex rounded hover:bg-green-600"
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
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-2">Tutor Email</label>
                    <input
                        type="email"
                        name="tutorEmail"
                        value={formData.tutorEmail}
                        readOnly
                        className="w-full p-2 border rounded"
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
                <div className="mb-4 ">
                    <img src={formData.imageBase64} className='rounded-lg w-[256px] h-[256px] object-cover' />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-2">Google Drive Link</label>
                    <input
                        type="url"
                        name="driveLink"
                        value={formData.driveLink}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div className="flex justify-center mt-4 space-x-4">
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Updating...' : 'Update'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UpdateMaterial;

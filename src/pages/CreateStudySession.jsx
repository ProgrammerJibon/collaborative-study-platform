import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HashLoader } from 'react-spinners';
import { toast } from 'react-toastify';

const CreateStudySession = ({ user }) => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    var now = new Date();

    var day = ("0" + now.getDate()).slice(-2);
    var month = ("0" + (now.getMonth() + 1)).slice(-2);

    var today = now.getFullYear() + "-" + (month) + "-" + (day);

    const formDataDefValues = {
        title: '',
        userId: user?._id,
        tutorName: user?.name,
        tutorEmail: user?.email,
        description: '',
        regStartDate: today,
        regEndDate: today,
        classStartDate: today,
        classEndDate: today,
        duration: '',
        regFee: 0,
        status: 'pending',
        additionalInfo: '',
    };
    const [formData, setFormData] = useState(formDataDefValues);
    const path = encodeURIComponent(location.pathname);
    useEffect(() => {
        if (!user) {
            navigate("/login?next=" + path);
        }
    }, [user]);
    if (!user) {
        return "Login required...";
    }



    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('https://tutor-hub-beta.vercel.app/study-sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();
            if (response.ok) {
                console.log('Study Session Created:', result);
                toast.success('Study session created successfully!');
                setFormData(formDataDefValues);
            } else {
                toast.error(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error('Error creating study session:', error);
            toast.error('Failed to create study session. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className="w-10/12 mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Create Study Session</h2>
            <form onSubmit={handleSubmit} className="p-6 rounded shadow-md ">
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-2">Session Title</label>
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
                    <label className="block text-sm font-bold mb-2">Tutor Name</label>
                    <input
                        type="text"
                        name="tutorName"
                        value={formData.tutorName}
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
                    <label className="block text-sm font-bold mb-2">Session Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-2">Registration Start Date</label>
                    <input
                        type="date"
                        name="regStartDate"
                        value={formData.regStartDate}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-2">Registration End Date</label>
                    <input
                        type="date"
                        name="regEndDate"
                        value={formData.regEndDate}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-2">Class Start Date</label>
                    <input
                        type="date"
                        name="classStartDate"
                        value={formData.classStartDate}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-2">Class End Date</label>
                    <input
                        type="date"
                        name="classEndDate"
                        value={formData.classEndDate}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-2">Session Duration (hours)</label>
                    <input
                        type="number"
                        min={0}
                        max={12}
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-2">Registration Fee</label>
                    <input
                        type="number"
                        name="regFee"
                        value={formData.regFee}
                        readOnly
                        className="w-full p-2 border rounded "
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-2">Additional Information</label>
                    <textarea
                        name="additionalInfo"
                        value={formData.additionalInfo}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    />
                </div>
                {isSubmitting ?
                    <HashLoader color='red' />
                    : <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Submit
                    </button>}
            </form>
        </div>
    );
};

export default CreateStudySession;

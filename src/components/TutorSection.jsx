import React, { useEffect, useState } from 'react';
import { HashLoader } from 'react-spinners';
import { toast } from 'react-toastify';

const TutorSection = () => {
    const [tutors, setTutors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTutors = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('https://tutor-hub-beta.vercel.app/tutors');
            const data = await response.json();
            if (response.ok) {
                setTutors(data);
            } else {
                toast.error(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error fetching tutors:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTutors();
    }, []);

    return (
        <div className="container mx-auto p-4  my-16">
            <h2 className="text-2xl font-bold mb-4 text-center">Meet Our Tutors</h2>
            {isLoading ? (
                <div>
                    <p>Loading tutors...</p>
                    <HashLoader color='yellow' />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tutors.map((tutor) => {
                        console.log(tutor);
                        
                        return (
                            <div key={tutor._id} className="border p-4 space-y-2 rounded shadow  items-center w-64">
                                <img
                                    src={tutor.avatar || 'https://via.placeholder.com/150'} // Default placeholder image
                                    alt={tutor.name}
                                    className="w-full h-32 rounded-sm object-cover "
                                />
                                <div className='w-full'>
                                    <h3 className="text-lg font-bold w-full truncate">{tutor.name}</h3>
                                    <p className="text-sm text-gray-500 w-full truncate">{tutor.email}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
};

export default TutorSection;

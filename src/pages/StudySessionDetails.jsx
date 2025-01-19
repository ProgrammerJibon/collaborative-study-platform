import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Rating } from 'react-simple-star-rating';
import { HashLoader } from 'react-spinners';
import { toast } from 'react-toastify';

const StudySessionDetails = ({ user }) => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [sessionDetails, setSessionDetails] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isBooked, setIsBooked] = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false);
    const [reviewInput, setReviewInput] = useState({ comment: '', rating: 5 });
    const [isBooking, setIsBooking] = useState(false);


    const fetchSessionDetails = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`https://tutor-hub-beta.vercel.app/study-session/${sessionId}?studentEmail=${user?.email}`);
            const data = await response.json();
            if (response.ok) {
                setSessionDetails(data.session);
                setReviews(data.reviews);
                setIsBooked(data.isBooked);
                setHasReviewed(data.hasReviewed);
            } else {
                toast.error(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error fetching session details:', error);
            toast.error('Failed to fetch session details. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };



    const handleBookNow = async () => {
        setIsBooking(true);
        if (!user || !("_id" in user)) {
            navigate("/login?next=" + encodeURIComponent(location.pathname));
            return;
        }



        try {
            const response = await fetch('https://tutor-hub-beta.vercel.app/book-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId,
                    studentEmail: user.email,
                }),
            });

            const result = await response.json();
            setIsBooking(false);
            if (response.ok) {
                if ("paymentUrl" in result) {
                    setIsBooking(true);
                    window.location.href = result["paymentUrl"];

                } else {
                    toast.success('Session booked successfully!');
                    setIsBooked(true);
                }

            } else {
                toast.error(`Error: ${result.error}`);
            }
        } catch (error) {
            setIsBooking(false);
            console.error('Error booking session:', error);
            toast.error('Failed to book session. Please try again.');
        }
    };

    const handlePostReview = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch('https://tutor-hub-beta.vercel.app/post-review', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId,
                    studentEmail: user.email,
                    studentName: user.name,
                    ...reviewInput,
                }),
            });

            const result = await response.json();
            if (response.ok) {
                toast.success('Review posted successfully!');
                setReviews((prev) => [...prev, result.review]);
                setHasReviewed(true);
            } else {
                toast.error(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error('Error posting review:', error);
            toast.error('Failed to post review. Please try again.');
        }
    };

    useEffect(() => {
        fetchSessionDetails();
    }, [sessionId, user]);

    if (isLoading) {
        return <div className='mx-auto w-10/12 my-8'>
            <span>Loading session details...</span>
            <HashLoader color="yellow" />
        </div>;
    }

    if (!sessionDetails) {
        return <p>Session details not found.</p>;
    }

    const isOngoing =
        new Date(sessionDetails.regStartDate) <= new Date() &&
        new Date(sessionDetails.regEndDate) >= new Date();

    const disableBookNow =
        !isOngoing || user?.role === 'admin' || user?.role === 'tutor' || isBooked;

    const averageRating =
        reviews.length > 0
            ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
            : 'No ratings yet';

    return (
        <div className="w-10/12 mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">{sessionDetails.title}</h2>
            <p><strong>Tutor Name:</strong> {sessionDetails.tutorName}</p>
            <p><strong>Average Rating:</strong> {averageRating}</p>
            <p><strong>Description:</strong> {sessionDetails.description}</p>
            <p><strong>Registration Start Date:</strong> {new Date(sessionDetails.regStartDate).toLocaleDateString()}</p>
            <p><strong>Registration End Date:</strong> {new Date(sessionDetails.regEndDate).toLocaleDateString()}</p>
            <p><strong>Class Start Date:</strong> {new Date(sessionDetails.classStartDate).toLocaleDateString()}</p>
            <p><strong>Class End Date:</strong> {new Date(sessionDetails.classEndDate).toLocaleDateString()}</p>
            <p><strong>Duration:</strong> {sessionDetails.duration} hours</p>
            <p><strong>Registration Fee:</strong> {sessionDetails.regFee === 0 ? 'Free' : `$${sessionDetails.regFee}`}</p>
            <div className="mt-4">
                {isBooked ? (
                    <span className="text-green-500 font-bold">You've Booked This Session</span>
                ) : (
                    !isBooking ? <button
                        onClick={handleBookNow}
                        disabled={disableBookNow}
                        className={`px-4 py-2 rounded ${disableBookNow
                            ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                    >
                        {!disableBookNow ? 'Book Now' : 'Registration Closed or Unavailable'}
                    </button> : <HashLoader color='yellow' />
                )}
            </div>
            <div className="mt-6 mb-32">
                <h3 className="text-lg font-bold mb-2">Reviews</h3>
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div key={review._id} className="border-b dark:border-gray-800 border-gray-200 py-2">
                            <p><strong>{review.studentName}:</strong> {review.comment}</p>
                            <p>Rating: {review.rating} out of 5</p>
                            <div>
                                <Rating
                                    initialValue={review.rating}
                                    size={16}
                                    readonly
                                />
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No reviews yet.</p>
                )}
                {!hasReviewed && isBooked && (
                    <div className="mt-8 ">
                        <h3 className="text-lg font-bold mb-2">Leave a Review</h3>
                        <textarea
                            value={reviewInput.comment}
                            onChange={(e) => setReviewInput({ ...reviewInput, comment: e.target.value })}
                            placeholder="Write your review..."
                            className="w-full p-2 border rounded mb-2"
                        />
                        <div>
                            <Rating
                                className=' mb-4'
                                initialValue={reviewInput.rating}
                                onClick={stars => setReviewInput({ ...reviewInput, rating: parseInt(stars, 10) })}
                            />
                        </div>
                        <button
                            onClick={handlePostReview}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                            Post Review
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudySessionDetails;

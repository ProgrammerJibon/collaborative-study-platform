import { Link } from "react-router-dom"

export default ({ session, user }) => {
    const isOngoing =
        new Date(session.regStartDate) <= new Date() &&
        new Date(session.regEndDate) >= new Date();

        // console.log(user);
        
    return (
        <div key={session._id} className="border p-4 rounded shadow">
            <h3 className="text-xl font-bold">{session.title}</h3>
            <p className="text-sm text-gray-500 ">Tutor name: {session.tutorName}</p>
            <p className="text-sm text-gray-500">Tutor e-mail: {session.tutorEmail}</p>
            <p className="mt-2 text-sm truncate">Details: {session.description}</p>
            <p className="mt-2 text-sm truncate">Registration Schedule: {new Date(session.regStartDate).toLocaleDateString()} - {new Date(session.regEndDate).toLocaleDateString()}</p>
            <p className="mt-2 text-sm truncate">Class Schedule: {new Date(session.classStartDate).toLocaleDateString()} - {new Date(session.classEndDate).toLocaleDateString()}</p>
            <p className="mt-2">
                <strong>Registration Fee: </strong>
                {session.regFee ? `$${session.regFee}` : 'Free'}
            </p>
            <p className="mt-2">
                <strong>Class Duration: </strong>
                {session.duration} hours
            </p>
            <div className="flex justify-between items-center my-2">
                <span
                    className={`px-2 py-2 rounded ${isOngoing ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}
                >
                    {isOngoing ? 'Ongoing' : 'Closed'}
                </span>
                <Link
                    to={user?`/study-session/${session._id}`:`/login?next=`+encodeURIComponent(`/study-session/${session._id}`)}
                    className="text-blue-500 px-4 py-2 dark:bg-white rounded-md"
                >
                    Read More
                </Link>
            </div>
        </div>
    )
}
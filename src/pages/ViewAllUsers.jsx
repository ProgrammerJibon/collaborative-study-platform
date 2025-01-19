import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HashLoader } from 'react-spinners';
import { toast } from 'react-toastify';

const ViewAllUsers = ({ user }) => {
    const navigate = useNavigate();
    const path = encodeURIComponent(location.pathname);
    useEffect(() => {
        if (!user) {
            navigate("/login?next=" + path);
        }
    }, [user]);
    

    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const fetchUsers = async (query = '') => {
        setIsLoading(true);
        try {
            const response = await fetch(`https://tutor-hub-beta.vercel.app/users?search=${query}`);
            const data = await response.json();
            if (response.ok) {
                setUsers(data.filter(item => item._id !== user._id));
            } else {
                toast.error(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to fetch users. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        fetchUsers(e.target.value);
    };

    const handleRoleUpdate = async (userId, newRole) => {
        try {
            const response = await fetch(`https://tutor-hub-beta.vercel.app/update-user-role/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role: newRole }),
            });

            const result = await response.json();
            if (response.ok) {
                toast.success('User role updated successfully!');
                fetchUsers(searchQuery); // Refresh user list
            } else {
                toast.error(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error('Error updating user role:', error);
            toast.error('Failed to update user role. Please try again.');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    if (!user) {
        return "Login required...";
    }

    return (
        <div className="w-10/12 mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">View All Users</h2>
            <div className="mb-4">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder="Search by name or email"
                    className="w-full p-2 border rounded"
                />
            </div>
            {isLoading ? (
                <div>
                    <p>Loading users...</p>
                    <HashLoader color="yellow" />
                </div>
            ) : (
                users?.length > 0 ? <table className="table-auto w-full border-collapse border border-gray-300">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 p-2">Name</th>
                            <th className="border border-gray-300 p-2">Email</th>
                            <th className="border border-gray-300 p-2">Role</th>
                            <th className="border border-gray-300 p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id}>
                                <td className="border border-gray-300 p-2">{user.name}</td>
                                <td className="border border-gray-300 p-2">{user.email}</td>
                                <td className="border border-gray-300 p-2">{user.role}</td>
                                <td className="border border-gray-300 p-2">
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleUpdate(user._id, e.target.value)}
                                        className="p-2 border rounded"
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="tutor">Tutor</option>
                                        <option value="student">Student</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table> : <div>No results for your query</div>

            )}
        </div>
    );
};

export default ViewAllUsers;

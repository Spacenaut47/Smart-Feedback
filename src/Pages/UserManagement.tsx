import React, { useEffect, useState } from 'react';
import API from '../api/api';
import { FaUser, FaEnvelope, FaComments } from 'react-icons/fa';

interface User {
  id: number;
  fullName: string;
  email: string;
  feedbacks: Feedback[];
}

interface Feedback {
  id: number;
  heading: string;
  category: string;
  subcategory: string;
  message: string;
  submittedAt: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get('/admin/users-with-feedbacks');
        setUsers(res.data);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    fetchUsers();
  }, []);

  const selectedUser = users.find((user) => user.id === selectedUserId);

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User List */}
        <div className="bg-white p-4 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold mb-3">Users</h3>
          <ul className="divide-y divide-gray-200">
            {users.map((user) => (
              <li
                key={user.id}
                onClick={() => setSelectedUserId(user.id)}
                className={`p-3 cursor-pointer hover:bg-gray-100 rounded-lg transition ${selectedUserId === user.id ? 'bg-gray-200' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <FaUser className="text-blue-500" />
                  <div>
                    <p className="font-medium">{user.fullName}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <FaEnvelope className="text-xs" /> {user.email}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <FaComments className="text-xs" /> {user.feedbacks.length} feedbacks
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Feedbacks by selected user */}
        <div className="bg-white p-4 rounded-xl shadow-md">
          {selectedUser ? (
            <>
              <h3 className="text-xl font-semibold mb-3">Feedbacks from {selectedUser.fullName}</h3>
              <ul className="space-y-4">
                {selectedUser.feedbacks.map((fb) => (
                  <li
                    key={fb.id}
                    className="border p-3 rounded-lg bg-gray-50 hover:bg-gray-100"
                  >
                    <p className="font-semibold">{fb.heading}</p>
                    <p className="text-sm text-gray-600">
                      {fb.category} / {fb.subcategory} — {new Date(fb.submittedAt).toLocaleString()}
                    </p>
                    <p className="text-sm mt-2 text-gray-700">{fb.message}</p>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-gray-500">Select a user to view their feedbacks</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;

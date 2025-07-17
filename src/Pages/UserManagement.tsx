import React, { useEffect, useState } from "react";
import API from "../api/api";
import {
  FaUser,
  FaEnvelope,
  FaComments,
  FaChevronDown,
  FaChevronUp,
  FaFileExport,
  FaSearch,
  FaUsers,
  FaArrowLeft,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

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

const USERS_PER_PAGE = 6;

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get("/admin/users-with-feedbacks");
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  const handleExport = (user: User) => {
    const content = `
User: ${user.fullName}
Email: ${user.email}
Total Feedbacks: ${user.feedbacks.length}

Feedbacks:
${user.feedbacks
  .map(
    (fb) => `
Heading: ${fb.heading}
Category: ${fb.category} / ${fb.subcategory}
Date: ${new Date(fb.submittedAt).toLocaleString()}
Message: ${fb.message}
---
`
  )
  .join("")}
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${user.fullName}_feedbacks.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getExpandedUser = () =>
    users.find((user) => user.id === expandedUserId);

  const goToDashboard = () => navigate("/admin");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-transparent to-transparent opacity-40" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />

      <div className="relative z-10 px-4 py-12 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div>
            <button
              onClick={goToDashboard}
              className="inline-flex items-center gap-2 bg-white text-blue-700 border border-blue-200 px-4 py-2 rounded-xl shadow hover:bg-blue-50 transition"
            >
              <FaArrowLeft /> Back to Admin Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 bg-white text-red-600 border border-red-200 px-4 py-2 rounded-xl shadow hover:bg-red-50 transition ml-4"
            >
              Logout
            </button>

            <h2 className="text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-800 bg-clip-text text-transparent mt-4">
              User Management
            </h2>
            <p className="text-slate-600 text-lg">
              Manage users and their feedback submissions
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FaUsers className="text-blue-600 text-xl" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">
                    {filteredUsers.length}
                  </p>
                  <p className="text-slate-600 text-sm">Total Users</p>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-xl">
                  <FaComments className="text-green-600 text-xl" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">
                    {users.reduce((sum, u) => sum + u.feedbacks.length, 0)}
                  </p>
                  <p className="text-slate-600 text-sm">Total Feedbacks</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FaSearch className="text-slate-400 text-lg" />
          </div>
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-2xl bg-white/80 backdrop-blur-sm shadow-md focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg"
          />
        </div>

        {/* Export button */}
        {expandedUserId && getExpandedUser() && (
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => handleExport(getExpandedUser()!)}
              className="group relative px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-green-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative flex items-center gap-2">
                <FaFileExport className="text-lg" />
                Export {getExpandedUser()?.fullName}'s Feedbacks
              </span>
            </button>
          </div>
        )}

        {/* User cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {paginatedUsers.map((user) => (
            <div
              key={user.id}
              className={`group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 transition-all duration-300 ${
                expandedUserId === user.id
                  ? "border-blue-400"
                  : "border-slate-200 hover:border-blue-300"
              }`}
            >
              <div
                className="cursor-pointer p-6"
                onClick={() =>
                  setExpandedUserId(expandedUserId === user.id ? null : user.id)
                }
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-4 rounded-2xl ${
                        expandedUserId === user.id
                          ? "bg-blue-500 text-white"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      <FaUser className="text-xl" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-slate-800 mb-2">
                        {user.fullName}
                      </h3>
                      <p className="flex items-center gap-2 text-slate-600 text-sm mb-1">
                        <FaEnvelope className="text-xs" /> {user.email}
                      </p>
                      <p className="flex items-center gap-2 text-sm text-slate-600">
                        <FaComments className="text-xs" />
                        {user.feedbacks.length} feedback
                        {user.feedbacks.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="p-2 bg-slate-100 text-slate-500 rounded-lg">
                    {expandedUserId === user.id ? (
                      <FaChevronUp />
                    ) : (
                      <FaChevronDown />
                    )}
                  </div>
                </div>
              </div>

              {expandedUserId === user.id && (
                <div className="border-t border-slate-200 bg-slate-50 p-6">
                  <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <FaComments className="text-blue-500" />
                    Feedback History
                  </h4>
                  {user.feedbacks.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                      {user.feedbacks.map((fb) => (
                        <div
                          key={fb.id}
                          className="bg-white border border-slate-300 rounded-xl p-4 shadow hover:shadow-md transition"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-semibold text-slate-800">
                              {fb.heading}
                            </h5>
                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                              {new Date(fb.submittedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-sm text-slate-600 mb-2">
                            <strong className="text-slate-700">
                              {fb.category}
                            </strong>{" "}
                            / {fb.subcategory}
                          </div>
                          <p className="text-slate-700 bg-slate-50 p-3 rounded-md text-sm leading-relaxed">
                            {fb.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-slate-500 py-6">
                      <FaComments className="mx-auto mb-2 text-2xl text-slate-300" />
                      No feedbacks submitted by this user.
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-xl text-sm font-medium ${
                  currentPage === page
                    ? "bg-blue-600 text-white shadow"
                    : "bg-white border border-slate-300 text-slate-700 hover:bg-blue-50"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;

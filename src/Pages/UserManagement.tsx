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
  isAdmin: boolean;
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

  const handleRoleUpdate = async (userId: number, makeAdmin: boolean) => {
    try {
      await API.post(`/admin/update-role/${userId}?makeAdmin=${makeAdmin}`);
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === userId ? { ...u, isAdmin: makeAdmin } : u
        )
      );
    } catch (error) {
      console.error("Failed to update user role:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
    {/* Background gradient overlays */}
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-transparent to-transparent opacity-40" />
    <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
    <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />

    <div className="relative z-10 max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div>
          <div className="flex gap-4">
            <button
              onClick={goToDashboard}
              className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative flex items-center gap-2">
                <FaArrowLeft />
                Back to Dashboard
              </span>
            </button>

            <button
              onClick={handleLogout}
              className="group relative px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative flex items-center gap-2">
                Logout
              </span>
            </button>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-800 bg-clip-text text-transparent mt-6 mb-1">
            User Management
          </h1>
          <p className="text-slate-600 text-lg">
            Manage users and their feedback submissions
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/60 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-white/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
                <FaUsers className="text-xl" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">
                  {filteredUsers.length}
                </div>
                <div className="text-sm text-slate-600">Total Users</div>
              </div>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-white/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 text-green-700 rounded-xl">
                <FaComments className="text-xl" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">
                  {users.reduce((sum, u) => sum + u.feedbacks.length, 0)}
                </div>
                <div className="text-sm text-slate-600">Total Feedbacks</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <FaSearch className="text-slate-400 text-lg" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search users by name or email..."
          className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-slate-200 bg-white/90 backdrop-blur-md shadow-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition text-lg"
        />
      </div>

      {/* Export Button */}
      {expandedUserId && getExpandedUser() && (
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => handleExport(getExpandedUser()!)}
            className="group relative px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-green-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative flex items-center gap-2">
              <FaFileExport className="text-lg" />
              Export {getExpandedUser()?.fullName}'s Feedbacks
            </span>
          </button>
        </div>
      )}

      {/* User Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {paginatedUsers.map((user) => (
          <div
            key={user.id}
            className={`group bg-white/80 backdrop-blur-sm border ${
              expandedUserId === user.id
                ? "border-blue-400"
                : "border-slate-200 hover:border-blue-300"
            } rounded-2xl shadow-lg transition duration-300`}
          >
            <div
              className="p-6 cursor-pointer"
              onClick={() =>
                setExpandedUserId(expandedUserId === user.id ? null : user.id)
              }
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <div
                    className={`p-4 rounded-2xl ${
                      expandedUserId === user.id
                        ? "bg-blue-600 text-white"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    <FaUser className="text-xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-slate-800 mb-2">
                      {user.fullName}
                    </h3>
                    <p className="text-sm text-slate-600 flex items-center gap-1 mb-1">
                      <FaEnvelope className="text-xs" /> {user.email}
                    </p>
                    <p className="text-sm text-slate-600 flex items-center gap-1">
                      <FaComments className="text-xs" />
                      {user.feedbacks.length} feedback
                      {user.feedbacks.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
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
                          <strong className="text-slate-700">{fb.category}</strong> / {fb.subcategory}
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

                <button
                  onClick={() => handleRoleUpdate(user.id, !user.isAdmin)}
                  className={`mt-4 px-4 py-2 text-sm font-semibold rounded-xl transition ${
                    user.isAdmin
                      ? "bg-red-100 text-red-600 hover:bg-red-200"
                      : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                  }`}
                >
                  {user.isAdmin ? "Demote from Admin" : "Promote to Admin"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                currentPage === page
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                  : "bg-white/80 text-blue-600 hover:bg-blue-50"
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

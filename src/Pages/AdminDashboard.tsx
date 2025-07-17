import { useEffect, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

type Feedback = {
  id: number;
  heading: string;
  category: string;
  subcategory: string;
  message: string;
  submittedAt: string;
  status: string;
  fullName: string;
  email: string;
  imageUrl?: string;
};

const categories = ["Department", "Services", "Events", "Others"] as const;
const subcategoriesMap: Record<string, string[]> = {
  Department: ["Development", "Administration", "HR"],
  Services: [
    "IT Support Services",
    "Workplace Tools & Software",
    "Transportation",
  ],
  Events: ["Hackathons", "Tech Talks", "Employee Recognition Events"],
  Others: ["Other"],
};

const statuses = ["New", "In Progress", "Resolved"];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<Feedback[]>([]);
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [status, setStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const itemsPerPage = 6;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const isAdmin = localStorage.getItem("isAdmin");

    if (!token || isAdmin !== "true") {
      navigate("/login");
      return;
    }

    const fetchFeedbacks = async () => {
      try {
        const res = await API.get("/admin/all-feedbacks");
        setFeedbacks(res.data);
        setFilteredFeedbacks(res.data);
      } catch (err) {
        console.error("Error fetching feedbacks", err);
      }
    };

    fetchFeedbacks();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    navigate("/login");
  };

  useEffect(() => {
    let filtered = [...feedbacks];
    if (category) filtered = filtered.filter((f) => f.category === category);
    if (subcategory)
      filtered = filtered.filter((f) => f.subcategory === subcategory);
    if (status) filtered = filtered.filter((f) => f.status === status);
    setFilteredFeedbacks(filtered);
    setCurrentPage(1);
  }, [category, subcategory, status, feedbacks]);

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      await API.put(`/admin/update-feedback-status/${id}`, {
        status: newStatus,
      });
      setFeedbacks((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: newStatus } : f))
      );
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this feedback?")) return;
    try {
      await API.delete(`/admin/delete-feedback/${id}`);
      setFeedbacks((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error("Failed to delete feedback", err);
    }
  };

  const toggleCardExpansion = (id: number) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved":
        return "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200 shadow-emerald-100";
      case "In Progress":
        return "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-200 shadow-amber-100";
      default:
        return "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200 shadow-blue-100";
    }
  };

  const paginatedFeedbacks = filteredFeedbacks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-transparent to-transparent opacity-40"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>

      <div className="relative z-10 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-800 bg-clip-text text-transparent mb-2">
                Admin Dashboard
              </h2>
              
              <p className="text-slate-600 text-lg">
                Manage and track all feedback submissions
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/users")}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
                Manage Users
              </span>
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
            <div className="group">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category
              </label>
              <select
                className="w-full p-4 border-2 border-slate-200 rounded-xl bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSubcategory("");
                }}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Subcategory
              </label>
              <select
                className="w-full p-4 border-2 border-slate-200 rounded-xl bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 disabled:opacity-50"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                disabled={!category}
              >
                <option value="">All Subcategories</option>
                {category &&
                  subcategoriesMap[category]?.map((sub) => (
                    <option key={sub}>{sub}</option>
                  ))}
              </select>
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <select
                className="w-full p-4 border-2 border-slate-200 rounded-xl bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                {statuses.map((stat) => (
                  <option key={stat}>{stat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Feedback Cards */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedFeedbacks.length > 0 ? (
              paginatedFeedbacks.map((fb) => (
                <div
                  key={fb.id}
                  className="group bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-lg hover:shadow-2xl p-5 flex flex-col relative transform hover:-translate-y-2 transition-all duration-500 hover:border-blue-300 cursor-pointer"
                  onClick={() => toggleCardExpansion(fb.id)}
                >
                  {/* Status Badge */}
                  <div
                    className={`absolute top-4 right-4 px-3 py-1 text-xs font-semibold border rounded-full shadow-lg ${getStatusColor(
                      fb.status
                    )}`}
                  >
                    {fb.status}
                  </div>

                  <h3 className="text-xl font-bold text-slate-800 mb-2 pr-16 group-hover:text-blue-700 transition-colors duration-300">
                    {fb.heading}
                  </h3>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-sm text-slate-600 font-medium">
                      <span className="text-slate-800 font-semibold">
                        {fb.category}
                      </span>{" "}
                      / {fb.subcategory}
                    </p>
                  </div>

                  <p className="text-slate-700 text-sm mb-4 line-clamp-3 leading-relaxed">
                    {fb.message}
                  </p>

                  {fb.imageUrl && expandedCards.has(fb.id) && (
                    <div className="relative mb-4 overflow-hidden rounded-xl animate-in slide-in-from-top-5 duration-300">
                      <img
                        src={fb.imageUrl}
                        alt="feedback"
                        className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                    </div>
                  )}

                  {fb.imageUrl && !expandedCards.has(fb.id) && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      <div className="flex items-center gap-2 text-blue-700">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-sm font-medium">
                          Click to view attached image
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-50 rounded-xl p-3 mb-3">
                    <div className="text-sm text-slate-600 mb-1">
                      <span className="text-slate-500">Submitted by:</span>{" "}
                      <span className="font-semibold text-slate-800">
                        {fb.fullName}
                      </span>
                    </div>
                    <div className="text-sm text-slate-500">{fb.email}</div>
                  </div>

                  <div className="text-xs text-slate-400 mb-4 flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {new Date(fb.submittedAt).toLocaleString()}
                  </div>

                  <div className="flex justify-between items-center mt-auto gap-4">
                    <select
                      className="text-sm border-2 border-slate-200 px-4 py-2 rounded-lg bg-white hover:bg-slate-50 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 font-medium"
                      value={fb.status}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleStatusUpdate(fb.id, e.target.value);
                      }}
                    >
                      {statuses.map((stat) => (
                        <option key={stat}>{stat}</option>
                      ))}
                    </select>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(fb.id);
                      }}
                      className="group/btn text-red-500 hover:text-red-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-all duration-300 flex items-center gap-1"
                    >
                      <svg
                        className="w-4 h-4 group-hover/btn:scale-110 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="text-slate-500 text-lg font-medium">
                  No feedbacks found
                </p>
                <p className="text-slate-400 text-sm mt-2">
                  Try adjusting your filters to see more results
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-16 gap-2">
              {Array.from({ length: totalPages }, (_, idx) => (
                <button
                  key={idx + 1}
                  className={`px-6 py-3 text-sm rounded-xl border-2 font-semibold transition-all duration-300 ${
                    currentPage === idx + 1
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-lg transform scale-105"
                      : "bg-white/80 backdrop-blur-sm text-blue-600 border-blue-200 hover:border-blue-400 hover:bg-blue-50 hover:scale-105"
                  }`}
                  onClick={() => setCurrentPage(idx + 1)}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

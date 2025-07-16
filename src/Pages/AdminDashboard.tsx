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
  Services: ["IT Support Services", "Workplace Tools & Software", "Transportation"],
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

  useEffect(() => {
    let filtered = [...feedbacks];
    if (category) filtered = filtered.filter(f => f.category === category);
    if (subcategory) filtered = filtered.filter(f => f.subcategory === subcategory);
    if (status) filtered = filtered.filter(f => f.status === status);
    setFilteredFeedbacks(filtered);
  }, [category, subcategory, status, feedbacks]);

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      await API.put(`/admin/update-feedback-status/${id}`, { status: newStatus });
      setFeedbacks(prev =>
        prev.map(f => (f.id === id ? { ...f, status: newStatus } : f))
      );
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Admin Dashboard</h2>
        <button
          onClick={() => navigate("/admin/users")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Manage Users
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <select
          className="p-2 border rounded-md"
          value={category}
          onChange={e => {
            setCategory(e.target.value);
            setSubcategory(""); // reset subcategory
          }}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat}>{cat}</option>
          ))}
        </select>

        <select
          className="p-2 border rounded-md"
          value={subcategory}
          onChange={e => setSubcategory(e.target.value)}
          disabled={!category}
        >
          <option value="">All Subcategories</option>
          {category &&
            subcategoriesMap[category]?.map(sub => (
              <option key={sub}>{sub}</option>
            ))}
        </select>

        <select
          className="p-2 border rounded-md"
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          {statuses.map(stat => (
            <option key={stat}>{stat}</option>
          ))}
        </select>
      </div>

      {/* Feedback list */}
      <div className="space-y-4">
        {filteredFeedbacks.length > 0 ? (
          filteredFeedbacks.map((fb, index) => (
            <div key={index} className="bg-white shadow rounded p-4 border">
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold text-xl">{fb.heading}</div>
                <select
                  className="border p-1 rounded"
                  value={fb.status}
                  onChange={e => handleStatusUpdate(fb.id, e.target.value)}
                >
                  {statuses.map(stat => (
                    <option key={stat}>{stat}</option>
                  ))}
                </select>
              </div>
              <div className="text-gray-600 mb-1">{fb.category} / {fb.subcategory}</div>
              <div className="text-sm mb-2">{fb.message}</div>
              {fb.imageUrl && (
                <img src={fb.imageUrl} alt="feedback" className="max-w-xs rounded mb-2" />
              )}
              <div className="text-sm text-gray-500">By: {fb.fullName} ({fb.email})</div>
              <div className="text-xs text-gray-400">
                Submitted at: {new Date(fb.submittedAt).toLocaleString()}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No feedbacks found.</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

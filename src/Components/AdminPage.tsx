import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

interface Feedback {
  id: number;
  heading: string;
  category: string;
  subcategory: string;
  message: string;
  imageUrl?: string;
  submittedAt: string;
  status: string;
  user: {
    fullName: string;
    email: string;
    gender: string;
  };
}

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("All");

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (isAdmin !== "true") {
      navigate("/login");
    } else {
      fetchFeedbacks();
    }
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const res = await API.get("/admin/all-feedbacks");
      setFeedbacks(res.data);
    } catch (err) {
      console.error("Failed to fetch feedbacks:", err);
    }
  };

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      await API.patch(`/admin/feedback-status/${id}`, { status: newStatus });
      setFeedbacks((prev) =>
        prev.map((fb) => (fb.id === id ? { ...fb, status: newStatus } : fb))
      );
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  const filtered = feedbacks.filter((fb) =>
    statusFilter === "All" ? true : fb.status === statusFilter
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-4">Admin Dashboard</h2>

      {/* Filter */}
      <div className="mb-4">
        <label className="mr-2 font-semibold">Filter by Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>

      {/* Feedback Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.map((fb) => (
          <div
            key={fb.id}
            className="bg-white shadow-md rounded p-4 border-l-4 border-blue-500"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-semibold">{fb.heading}</h3>
              <select
                value={fb.status}
                onChange={(e) => updateStatus(fb.id, e.target.value)}
                className="p-1 border rounded text-sm"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            <p className="text-gray-600 text-sm">
              <strong>Category:</strong> {fb.category} / {fb.subcategory}
            </p>
            <p className="text-gray-700 mt-2">{fb.message}</p>

            {fb.imageUrl && (
              <img
                src={fb.imageUrl}
                alt="Feedback"
                className="mt-3 max-w-xs rounded"
              />
            )}

            <div className="mt-3 text-sm text-gray-500">
              <p>
                <strong>Submitted:</strong>{" "}
                {new Date(fb.submittedAt).toLocaleString()}
              </p>
              <p>
                <strong>User:</strong> {fb.user.fullName} ({fb.user.email})
              </p>
              <p>
                <strong>Gender:</strong> {fb.user.gender}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPage;

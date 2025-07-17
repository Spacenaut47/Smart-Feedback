import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Profile from "./Images/dummy.png";
import API from "../api/api";

interface FeedbackFormData {
  heading: string;
  category: string;
  subcategory: string;
  feedback: string;
  image: File | null;
}

interface SubmittedFeedback {
  heading: string;
  category: string;
  subcategory: string;
  submittedAt: string;
  message: string;
  imageUrl?: string;
}

const categories = ["Department", "Services", "Events", "Others"] as const;
const subcategoriesMap: Record<string, string[]> = {
  Department: ["Development", "Administration", "HR"],
  Services: ["IT Support Services", "Workplace Tools & Software", "Transportation"],
  Events: ["Hackathons", "Tech Talks", "Employee Recognition Events"],
  Others: ["Other"],
};

const UserPage: React.FC = () => {
  const [feedbackForm, setFeedbackForm] = useState<FeedbackFormData>({
    heading: "",
    category: "",
    subcategory: "",
    feedback: "",
    image: null,
  });
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("Submitted");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [openCategoryDropdown, setOpenCategoryDropdown] = useState<string | null>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");
  const [submittedFeedbacks, setSubmittedFeedbacks] = useState<SubmittedFeedback[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const profileRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const name = localStorage.getItem("userName");
    const token = localStorage.getItem("token");
    if (!token) navigate("/login", { replace: true });
    if (name) setUserName(name);

    const fetchFeedbacks = async () => {
      try {
        const res = await API.get("/feedback/my-feedbacks", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubmittedFeedbacks(res.data || []);
      } catch (err) {
        console.error("Failed to fetch feedbacks:", err);
      }
    };

    fetchFeedbacks();
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setShowProfileDropdown(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setOpenCategoryDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [navigate]);

  const handleFeedbackChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFeedbackForm((prev) => ({ ...prev, [name]: value }));
    if (name === "category") {
      setFeedbackForm((prev) => ({ ...prev, subcategory: "" }));
    }
    setFeedbackError(null);
    setFeedbackSuccess(false);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { heading, category, subcategory, feedback, image } = feedbackForm;
    if (!heading || !category || !subcategory || !feedback) {
      setFeedbackError("Please fill in all fields.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      let imageUrl = "";
      if (image) {
        const formData = new FormData();
        formData.append("image", image);
        const uploadRes = await API.post("/feedback/upload-image", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        imageUrl = uploadRes.data.imageUrl;
      }

      const res = await API.post(
        "/feedback/submit",
        {
          heading,
          category,
          subcategory,
          message: feedback,
          imageUrl,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 200 || res.status === 201) {
        setFeedbackSuccess(true);
        setFeedbackForm({ heading: "", category: "", subcategory: "", feedback: "", image: null });
        setTimeout(() => setFeedbackSuccess(false), 5000);
        const updated = await API.get("/feedback/my-feedbacks", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubmittedFeedbacks(updated.data || []);
      }
    } catch (err: any) {
      setFeedbackSuccess(false);
      setFeedbackError(err?.response?.data?.message || "Submission failed.");
    }
  };

  const filteredFeedbacks =
    selectedCategory === "Submitted"
      ? submittedFeedbacks
      : selectedSubcategory !== ""
      ? submittedFeedbacks.filter(
          (fb) => fb.category === selectedCategory && fb.subcategory === selectedSubcategory
        )
      : [];

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("isAdmin");
  navigate("/login");
};


  return (
    <div className="min-h-screen bg-gradient-to-r from-slate-900 to-slate-700 text-white">
      {/* Navbar */}
      <div className="flex justify-end p-4">
        <div className="relative" ref={profileRef}>
          <img
            src={Profile}
            alt="Profile"
            className="w-10 h-10 rounded-full cursor-pointer border-2 border-white"
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          />
          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded-md shadow-lg z-50">
              <div className="px-4 py-2 hover:bg-gray-200 cursor-pointer" onClick={handleLogout}>
                Logout
              </div>
            </div>
          )}
        </div>
      </div>

      <h2 className="text-2xl font-bold text-center mb-4">Welcome {userName}</h2>

      {/* Category Tabs */}
      <div ref={dropdownRef} className="flex flex-wrap justify-center gap-2 px-4 mb-6">
        <button
          className={`px-4 py-2 rounded-full font-medium transition duration-300 ${
            selectedCategory === "Submitted"
              ? "bg-white text-black"
              : "bg-slate-600 hover:bg-slate-500"
          }`}
          onClick={() => {
            setSelectedCategory("Submitted");
            setSelectedSubcategory("");
            setOpenCategoryDropdown(null);
          }}
        >
          Submitted Feedback
        </button>
        {categories.map((cat) => (
          <div key={cat} className="relative">
            <button
              className={`px-4 py-2 rounded-full font-medium transition duration-300 ${
                selectedCategory === cat ? "bg-white text-black" : "bg-slate-600 hover:bg-slate-500"
              }`}
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedSubcategory("");
                setOpenCategoryDropdown(openCategoryDropdown === cat ? null : cat);
              }}
            >
              {cat}
            </button>
            {openCategoryDropdown === cat && (
              <div className="absolute top-full left-0 bg-white text-black rounded shadow-md mt-1 z-20">
                {subcategoriesMap[cat].map((sub) => (
                  <div
                    key={sub}
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-200 ${
                      selectedSubcategory === sub ? "bg-gray-100 font-semibold" : ""
                    }`}
                    onClick={() => {
                      setSelectedSubcategory(sub);
                      setOpenCategoryDropdown(null);
                    }}
                  >
                    {sub}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 px-4 pb-10">
        {/* Feedback Display */}
        <div>
          <h3 className="text-xl font-semibold mb-4">
            {selectedCategory === "Submitted"
              ? "Submitted Feedback"
              : selectedSubcategory
              ? `${selectedCategory}: ${selectedSubcategory}`
              : `Select a subcategory`}
          </h3>

          <div className="space-y-4">
            {filteredFeedbacks.length > 0 ? (
              filteredFeedbacks.map((fb, index) => (
                <div
                  key={index}
                  className={`rounded-lg p-4 bg-white bg-opacity-10 hover:bg-opacity-20 transition cursor-pointer ${
                    expandedIndex === index ? "ring-2 ring-white" : ""
                  }`}
                  onClick={() => toggleExpand(index)}
                >
                  <div className="text-lg font-semibold">{fb.heading}</div>
                  <div className="text-sm text-gray-300 flex justify-between">
                    <span>
                      {fb.category} / {fb.subcategory}
                    </span>
                    <span>{new Date(fb.submittedAt).toLocaleString()}</span>
                  </div>
                  {expandedIndex === index && (
                    <div className="mt-2 text-sm text-gray-200">
                      {fb.message}
                      {fb.imageUrl && (
                        <img
                          src={fb.imageUrl}
                          alt="Feedback"
                          className="mt-2 rounded-md max-h-60 object-contain border"
                        />
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-400">No feedback found.</p>
            )}
          </div>
        </div>

        {/* Feedback Form */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Write Your Feedback</h3>
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <input
              type="text"
              name="heading"
              value={feedbackForm.heading}
              onChange={handleFeedbackChange}
              placeholder="Feedback heading"
              className="w-full p-2 rounded bg-slate-800 border border-slate-600 text-white"
            />
            <select
              name="category"
              value={feedbackForm.category}
              onChange={handleFeedbackChange}
              className="w-full p-2 rounded bg-slate-800 border border-slate-600 text-white"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <select
              name="subcategory"
              value={feedbackForm.subcategory}
              onChange={handleFeedbackChange}
              className="w-full p-2 rounded bg-slate-800 border border-slate-600 text-white"
              disabled={!feedbackForm.category}
            >
              <option value="">Select Subcategory</option>
              {feedbackForm.category &&
                subcategoriesMap[feedbackForm.category]?.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
            </select>
            <textarea
              name="feedback"
              value={feedbackForm.feedback}
              onChange={handleFeedbackChange}
              placeholder="Write your feedback here..."
              className="w-full p-2 rounded bg-slate-800 border border-slate-600 text-white"
              rows={4}
            ></textarea>
            <div className="text-sm">Upload Image (optional)</div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFeedbackForm((prev) => ({
                  ...prev,
                  image: e.target.files ? e.target.files[0] : null,
                }))
              }
              className="w-full text-white"
            />
            <button
              type="submit"
              className="w-full py-2 rounded bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 transition"
            >
              Submit Feedback
            </button>
            {feedbackError && <p className="text-red-400">{feedbackError}</p>}
            {feedbackSuccess && <p className="text-green-400">Feedback submitted successfully!</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
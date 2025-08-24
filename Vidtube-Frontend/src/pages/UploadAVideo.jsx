import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import api from "../api.js";

function UploadAVideo() {
  const navigate = useNavigate();

  // Global UI state
  const [authChecking, setAuthChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [currentUsername, setCurrentUsername] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  const note = (type, text) => setMsg({ type, text });
  const clearNoteSoon = () => {
    setTimeout(() => setMsg({ type: "", text: "" }), 2500);
  };

  // For text fields (title, description)
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // For file inputs (thumbnail & video)
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      if (name === "thumbnail") {
        setThumbnail(files[0]);
      } else if (name === "videoFile") {
        setVideoFile(files[0]);
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const res = await axios.get(
          "https://vidtube-backend-2.onrender.com/api/v1/users/current-user",
          {
            withCredentials: true,
          }
        );
        const user = res?.data?.data;
        if (!user?.username) {
          navigate("/login");
          return;
        }
        setCurrentUsername(user.username);
      } catch (err) {
        navigate("/login");
      } finally {
        setAuthChecking(false);
      }
    };
    init();
  }, [navigate]);

  const UploadVideo = async (e) => {
    e.preventDefault();
    setLoading(true);
    note("", "");

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);

    if (videoFile) data.append("videoFile", videoFile);
    if (thumbnail) data.append("thumbnail", thumbnail);

    try {
      await axios.post(
        "https://vidtube-backend-2.onrender.com/api/v1/videos/upload-video",
        data,
        { withCredentials: true }
      );
      note("success", "Video uploaded successfully");
      setFormData({ title: "", description: "" });
      setThumbnail(null);
      setVideoFile(null);
    } catch (err) {
      note("error", err?.response?.data?.message || "Failed to upload video");
    } finally {
      setLoading(false);
      clearNoteSoon();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      {/* Navbar */}
      <nav className="bg-gray-800 px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-center shadow gap-4">
        <h1 className="text-lg sm:text-xl font-bold text-white">Video Manager</h1>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-sm">Hi, {currentUsername || "User"} </span>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-indigo-500 transition text-sm sm:text-base"
          >
            Dashboard
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex justify-center items-center p-4 sm:p-6">
        <div className="bg-gray-800 shadow-lg rounded-xl p-4 sm:p-6 w-full max-w-sm sm:max-w-lg border border-gray-700">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white text-center">
            Upload Video
          </h2>

          <form onSubmit={UploadVideo} className="space-y-4 sm:space-y-6">
            {/* Text inputs */}
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border border-gray-700 bg-gray-900 text-white p-3 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none placeholder-gray-400 text-sm sm:text-base"
            />

            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border border-gray-700 bg-gray-900 text-white p-3 rounded-lg h-20 sm:h-24 resize-none focus:ring-2 focus:ring-indigo-600 focus:outline-none placeholder-gray-400 text-sm sm:text-base"
            />

            {/* File inputs */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Thumbnail
              </label>
              <input
                type="file"
                name="thumbnail"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full border border-gray-700 bg-gray-900 text-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none text-sm"
              />
              {thumbnail && (
                <img
                  src={URL.createObjectURL(thumbnail)}
                  alt="Thumbnail Preview"
                  className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg border border-gray-700 mt-2"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Video File
              </label>
              <input
                type="file"
                name="videoFile"
                accept="video/*"
                onChange={handleFileChange}
                className="w-full border border-gray-700 bg-gray-900 text-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none text-sm"
              />
              {videoFile && (
                <video
                  controls
                  src={URL.createObjectURL(videoFile)}
                  className="w-full rounded-lg border border-gray-700 mt-2"
                />
              )}
            </div>

            {/* Upload button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-indigo-500 transition disabled:opacity-50 text-sm sm:text-base"
            >
              {loading ? "Uploading..." : "Upload Video"}
            </button>
          </form>

          {/* Show notification */}
          {msg.text && (
            <div
              className={`mt-4 p-3 rounded-lg border text-sm ${
                msg.type === "success"
                  ? "bg-green-900/30 border-green-800 text-green-200"
                  : msg.type === "error"
                  ? "bg-red-900/40 border-red-800 text-red-200"
                  : "bg-yellow-900/30 border-yellow-800 text-yellow-200"
              }`}
            >
              {msg.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UploadAVideo;

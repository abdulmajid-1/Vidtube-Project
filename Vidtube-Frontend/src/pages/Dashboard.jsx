import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import api from "../api.js";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // State for video player functionality
  const [playingVideo, setPlayingVideo] = useState(null);

  // States for video management modes
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  const [editingVideo, setEditingVideo] = useState(null);
  const [deletingVideo, setDeletingVideo] = useState(null);

  const [editForm, setEditForm] = useState({ title: "", description: "" });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();

  /**
   * Check if user is authenticated
   * Redirects to login if not authenticated
   */
  const checkAuth = async () => {
    try {
      const res = await axios.get(
        "https://vidtube-backend-2.onrender.com/api/v1/users/current-user",
        { withCredentials: true }
      );
      if (!res.data.success) {
        navigate("/login");
      }
    } catch (err) {
      navigate("/login");
    } finally {
      setCheckingAuth(false);
    }
  };

  /**
   * Fetch dashboard statistics
   * Gets total videos, subscribers, views, and likes
   */
  const fetchStats = async () => {
    try {
      const res = await axios.get(
        "https://vidtube-backend-2.onrender.com/api/v1/dashboard/stats",
        { withCredentials: true }
      );
      setStats(res.data.data);
    } catch (err) {
      console.error("Failed to load stats:", err.response?.data || err);
    }
  };

  /**
   * Fetch user's videos with pagination
   * @param {number} pageNum - Page number to fetch
   */
  const fetchVideos = async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `https://vidtube-backend-2.onrender.com/api/v1/dashboard/videos?page=${pageNum}`,
        { withCredentials: true }
      );
      setVideos(res.data.data.videos);
      setPage(res.data.data.currentPage);
      setTotalPages(res.data.data.totalPages);
    } catch (err) {
      console.error("Failed to load videos:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!checkingAuth) {
      fetchStats();
      fetchVideos();
    }
  }, [checkingAuth]);

  /**
   * Open edit form for a video
   * @param {Object} video - Video object to edit
   */
  const openEditForm = (video) => {
    setEditingVideo(video);
    setEditForm({
      title: video.title,
      description: video.description || "",
    });
    setThumbnailFile(null);
  };

  /**
   * Handle video update submission
   * @param {Event} e - Form submission event
   */
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editingVideo) return;

    try {
      setUpdating(true);
      const data = new FormData();
      data.append("title", editForm.title);
      data.append("description", editForm.description);
      if (thumbnailFile) data.append("thumbnail", thumbnailFile);

      await axios.patch(
        `https://vidtube-backend-2.onrender.com/api/v1/videos/updateVideo/${editingVideo._id}`,
        data,
        { withCredentials: true }
      );
      await fetchVideos(page);

      // Reset form state
      setEditingVideo(null);
      setIsUpdateMode(false);
    } catch (err) {
      console.error("Failed to update video:", err.response?.data || err);
    } finally {
      setUpdating(false);
    }
  };

  /**
   * Open delete confirmation for a video
   * @param {Object} video - Video object to delete
   */
  const openDeleteConfirm = (video) => {
    setDeletingVideo(video);
  };

  /**
   * Handle video deletion
   */
  const handleDeleteSubmit = async () => {
    if (!deletingVideo) return;

    try {
      setDeleting(true);
      await axios.delete(
        `https://vidtube-backend-2.onrender.com/api/v1/videos/delete/${deletingVideo._id}`,
        { withCredentials: true }
      );
      await fetchVideos(page);

      // Reset delete state
      setDeletingVideo(null);
      setIsDeleteMode(false);
    } catch (err) {
      console.error("Failed to delete video:", err.response?.data || err);
    } finally {
      setDeleting(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center text-white">
        Checking authentication...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      {/* Header Navigation */}
      <header className="bg-gray-800 px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
        <div className="flex flex-wrap gap-2 sm:gap-4">
          <button
            onClick={() => navigate("/HomePage")}
            className="px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition text-sm sm:text-base"
          >
            Home
          </button>
          <button
            onClick={() => navigate("/MyProfile")}
            className="px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition text-sm sm:text-base"
          >
            My Profile
          </button>
          <button
            onClick={() => navigate("/Tweet")}
            className="px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition text-sm sm:text-base"
          >
            Tweet
          </button>
          <button
            onClick={() => navigate("/Playlists")}
            className="px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition text-sm sm:text-base"
          >
            Playlists
          </button>
         
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-gray-800 shadow rounded-lg p-3 sm:p-4 text-center">
              <h2 className="text-lg sm:text-xl font-bold text-indigo-400">
                {stats.totalVideos}
              </h2>
              <p className="text-gray-400 text-sm">Videos</p>
            </div>
            <div className="bg-gray-800 shadow rounded-lg p-3 sm:p-4 text-center">
              <h2 className="text-lg sm:text-xl font-bold text-green-400">
                {stats.totalSubscribers}
              </h2>
              <p className="text-gray-400 text-sm">Subscribers</p>
            </div>
            <div className="bg-gray-800 shadow rounded-lg p-3 sm:p-4 text-center">
              <h2 className="text-lg sm:text-xl font-bold text-blue-400">
                {stats.totalViews}
              </h2>
              <p className="text-gray-400 text-sm">Views</p>
            </div>
            <div className="bg-gray-800 shadow rounded-lg p-3 sm:p-4 text-center">
              <h2 className="text-lg sm:text-xl font-bold text-pink-400">
                {stats.totalLikes}
              </h2>
              <p className="text-gray-400 text-sm">Likes</p>
            </div>
          </div>
        )}

        {/* Video Management Section */}
        <div className="bg-gray-800 shadow rounded-lg p-4 sm:p-6 relative">
          <nav className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h2 className="text-lg font-semibold">Your Videos</h2>
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <button
                onClick={() => navigate("/UploadAVideo")}
                className="px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition text-sm"
              >
                Upload Video
              </button>
              <button
                onClick={() => {
                  setIsUpdateMode(true);
                  setIsDeleteMode(false);
                }}
                className="px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition text-sm"
              >
                Update Video
              </button>
              <button
                onClick={() => {
                  setIsDeleteMode(true);
                  setIsUpdateMode(false);
                }}
                className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
              >
                Delete Video
              </button>
            </div>
          </nav>

          {/* Mode Instructions */}
          {isUpdateMode && !editingVideo && (
            <p className="text-yellow-400 mb-4 text-sm">
              Select the video you want to edit
            </p>
          )}
          {isDeleteMode && !deletingVideo && (
            <p className="text-yellow-400 mb-4 text-sm">
              Select the video you want to delete
            </p>
          )}

          {/* Video Grid */}
          {loading ? (
            <p className="text-gray-400">Loading videos...</p>
          ) : videos.length === 0 ? (
            <p className="text-gray-400">No videos found.</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {videos.map((video) => (
                <li
                  key={video._id}
                  className="border border-gray-700 rounded-lg shadow-sm bg-gray-900 hover:bg-gray-800 transition cursor-pointer"
                  onClick={() =>
                    isUpdateMode
                      ? openEditForm(video)
                      : isDeleteMode
                      ? openDeleteConfirm(video)
                      : setPlayingVideo(video)
                  }
                >
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-32 sm:h-40 object-cover rounded-t-md"
                  />
                  <div className="p-3">
                    <h3 className="text-sm sm:text-md font-semibold text-white">
                      {video.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-400">
                      {video.owner?.username} •{" "}
                      {new Date(video.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => fetchVideos(page - 1)}
              disabled={page <= 1}
              className="px-3 sm:px-4 py-2 bg-gray-700 text-gray-300 rounded disabled:opacity-50 hover:bg-gray-600 text-sm"
            >
              Prev
            </button>
            <p className="text-gray-400 text-sm">
              Page {page} of {totalPages}
            </p>
            <button
              onClick={() => fetchVideos(page + 1)}
              disabled={page >= totalPages}
              className="px-3 sm:px-4 py-2 bg-gray-700 text-gray-300 rounded disabled:opacity-50 hover:bg-gray-600 text-sm"
            >
              Next
            </button>
          </div>
        </div>
      </main>

      {/* Edit Video Modal */}
      {editingVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
          <div className="bg-gray-900 p-4 sm:p-6 rounded-xl w-full max-w-md sm:max-w-lg shadow-2xl border border-gray-700">
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-white">
              Edit Video
            </h2>
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
                className="w-full border border-gray-700 bg-gray-800 text-white p-3 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none text-sm"
                required
              />
              <textarea
                name="description"
                placeholder="Description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                className="w-full border border-gray-700 bg-gray-800 text-white p-3 rounded-lg h-24 resize-none focus:ring-2 focus:ring-indigo-600 focus:outline-none text-sm"
              />
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  New Thumbnail (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnailFile(e.target.files[0])}
                  className="w-full border border-gray-700 bg-gray-800 text-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition disabled:opacity-50 text-sm"
                >
                  {updating ? "Updating..." : "Update"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingVideo(null)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-medium transition text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
          <div className="bg-gray-900 p-4 sm:p-6 rounded-xl w-full max-w-md shadow-2xl border border-gray-700">
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-white">
              Delete Video
            </h2>
            <p className="text-gray-300 mb-6 text-sm">
              Are you sure you want to delete "{deletingVideo.title}"? This action
              cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteSubmit}
                disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition disabled:opacity-50 text-sm"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => setDeletingVideo(null)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-medium transition text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {playingVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50 p-4">
          <div className="w-full max-w-4xl">
            <div className="relative">
              <button
                onClick={() => setPlayingVideo(null)}
                className="absolute top-4 right-4 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg z-10"
              >
                ✕
              </button>
              <video
                controls
                className="w-full h-auto max-h-[80vh] rounded-lg"
                autoPlay
              >
                <source src={playingVideo.videoFile} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                {playingVideo.title}
              </h3>
              <p className="text-gray-400 text-sm">
                {playingVideo.owner?.username} •{" "}
                {new Date(playingVideo.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

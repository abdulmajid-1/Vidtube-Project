import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../api.js";

export default function HomePage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editCommentId, setEditCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState(null);

  // Loading states for comment and video actions
  const [commentLoading, setCommentLoading] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);

  const navigate = useNavigate();

  /**
   * Fetch videos with pagination support
   * @param {number} pageNumber - Page number to fetch
   */
  const fetchVideos = async (pageNumber = 1) => {
    try {
      const res = await axios.get(
        ` https://vidtube-backend-2.onrender.com/api/v1/videos/getAll?page=${pageNumber}`
      );
      setVideos(res.data.data.videos || []);
      setTotalPages(res.data.data.totalPages || 1);
      setPage(pageNumber);
    } catch (err) {
      console.error("Error fetching videos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos(1);
  }, []);

  /**
   * Check user authentication status and get current user details
   */
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await axios.get(
          " https://vidtube-backend-2.onrender.com/api/v1/users/current-user",
          {
            withCredentials: true,
          }
        );
        if (res.data?.success) {
          setIsLoggedIn(true);
          setCurrentUser(res.data.data);
        } else {
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
      } catch {
        setIsLoggedIn(false);
        setCurrentUser(null);
      } finally {
        setAuthLoading(false);
      }
    };
    checkLogin();
  }, []);

  /**
   * Handle user logout
   * Clears authentication state and redirects to home page
   */
  const handleLogout = async () => {
    try {
      await axios.post(
        " https://vidtube-backend-2.onrender.com/api/v1/users/logout",
        {},
        { withCredentials: true }
      );
      setIsLoggedIn(false);
      setCurrentUser(null);
      navigate("/HomePage");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  /**
   * Fetch comments for a specific video
   * @param {string} videoId - ID of the video to fetch comments for
   */
  const fetchComments = async (videoId) => {
    try {
      const res = await axios.get(
        ` https://vidtube-backend-2.onrender.com/api/v1/comments/getVideoComments/${videoId}`,
        { withCredentials: true }
      );
      setComments(res.data.data.comments || []);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  /**
   * Add a new comment to a video
   */
  const addComment = async () => {
    if (!newComment.trim()) return;
    setCommentLoading(true);
    try {
      await axios.post(
        `https://vidtube-backend-2.onrender.com/api/v1/comments/addVideoComment/${selectedVideoId}`,
        { content: newComment },
        { withCredentials: true }
      );
      setNewComment("");
      fetchComments(selectedVideoId);
    } catch (err) {
      console.error("Error adding comment:", err);
    } finally {
      setCommentLoading(false);
    }
  };

  /**
   * Start editing a comment
   * @param {string} id - Comment ID
   * @param {string} content - Current comment content
   */
  const startEditing = (id, content) => {
    setEditCommentId(id);
    setEditContent(content);
  };

  /**
   * Save updated comment
   */
  const updateComment = async () => {
    if (!editContent.trim()) return;
    setCommentLoading(true);
    try {
      await axios.patch(
        `https://vidtube-backend-2.onrender.com/api/v1/comments/updateComment/${editCommentId}`,
        { content: editContent },
        { withCredentials: true }
      );
      setEditCommentId(null);
      setEditContent("");
      fetchComments(selectedVideoId);
    } catch (err) {
      console.error("Error updating comment:", err);
    } finally {
      setCommentLoading(false);
    }
  };

  /**
   * Delete a comment
   * @param {string} id - Comment ID to delete
   */
  const deleteComment = async (id) => {
    setCommentLoading(true);
    try {
      await axios.delete(
        `https://vidtube-backend-2.onrender.com/api/v1/comments/deleteComment/${id}`,
        {
          withCredentials: true,
        }
      );
      fetchComments(selectedVideoId);
    } catch (err) {
      console.error("Error deleting comment:", err);
    } finally {
      setCommentLoading(false);
    }
  };

  /**
   * Toggle like/unlike for a video
   * @param {string} videoId - Video ID to like/unlike
   */
  const toggleVideoLike = async (videoId) => {
    if (isLoggedIn) {
      setVideoLoading(true);
      try {
        await axios.post(
          `https://vidtube-backend-2.onrender.com/api/v1/likes/toggle/v/${videoId}`,
          {},
          { withCredentials: true }
        );
        fetchVideos(page);
      } catch (err) {
        console.error("Error liking video:", err);
      } finally {
        setVideoLoading(false);
      }
    }
  };

  /**
   * Toggle like/unlike for a comment
   * @param {string} commentId - Comment ID to like/unlike
   */
  const toggleCommentLike = async (commentId) => {
    if (isLoggedIn) {
      setCommentLoading(true);
      try {
        await axios.post(
          `https://vidtube-backend-2.onrender.com/api/v1/likes/toggle/c/${commentId}`,
          {},
          { withCredentials: true }
        );
        fetchComments(selectedVideoId);
      } catch (err) {
        console.error("Error liking comment:", err);
      } finally {
        setCommentLoading(false);
      }
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-gray-200">
      {/* Navigation Bar */}
      <nav className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-6 py-4 bg-gray-800 shadow-md gap-4">
        <h1
          onClick={() => {
            setSelectedVideo(null);
            navigate("/HomePage");
          }}
          className="text-3xl sm:text-4xl font-Brush Script MT leading-none tracking-tight text-white cursor-pointer"
        >
          VidTube
        </h1>

        {authLoading ? null : isLoggedIn ? (
          <div className="flex flex-wrap gap-2 sm:gap-4 justify-center">
            <button
              onClick={() => navigate("/Dashboard")}
              className="px-3 sm:px-4 py-2 bg-amber-400 text-white rounded-lg hover:bg-amber-600 transition text-sm sm:text-base"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate("/MyProfile")}
              className="px-3 sm:px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-600 transition text-sm sm:text-base"
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
              onClick={handleLogout}
              className="px-3 sm:px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-600 transition text-sm sm:text-base"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 sm:gap-4 justify-center">
            <button
              onClick={() => navigate("/TweetNoLogin")}
              className="px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition text-sm sm:text-base"
            >
              Tweet
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-3 sm:px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition text-sm sm:text-base"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-3 sm:px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-500 transition text-sm sm:text-base"
            >
              Register
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="text-center py-6 sm:py-10 px-4">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-arial text-white mb-4">
          Stream, Share & Connect
        </h2>
        <p className="text-base sm:text-lg text-gray-400">
          Discover amazing videos shared by our community
        </p>
      </div>

      {/* Video Gallery Section */}
      <div className="bg-gray-800 shadow rounded-lg p-4 sm:p-6 mx-4 sm:mx-6">
        <h2 className="text-lg font-semibold mb-4 text-white">Your Videos</h2>
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
                  setSelectedVideo(
                    selectedVideo === video._id ? null : video._id
                  )
                }
              >
                {selectedVideo === video._id ? (
                  <div className="p-3 sm:p-4">
                    <video
                      controls
                      playsInline // Important for iOS Safari compatibility
                      muted
                      className="w-full h-48 sm:h-64 rounded-md mb-3"
                    >
                      <source src={video.videoFile} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>

                    <h3 className="text-base sm:text-lg font-bold mb-2 text-white">
                      {video.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-400">
                      {video.owner?.username} •{" "}
                      {new Date(video.createdAt).toLocaleDateString()}
                    </p>

                    {/* Like button - only visible for logged in users */}
                    {isLoggedIn && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleVideoLike(video._id);
                        }}
                        disabled={videoLoading}
                        className="mt-2 px-2 sm:px-3 py-1 bg-pink-600 hover:bg-pink-700 text-white text-xs sm:text-sm rounded disabled:opacity-50"
                      >
                        ❤️ {video.totalLikes}
                      </button>
                    )}

                    <p className="text-gray-300 mt-2 text-xs sm:text-sm">
                      {video.totalComments}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVideoId(video._id);
                          fetchComments(video._id);
                          setShowCommentsModal(true);
                        }}
                        className="ml-2 px-2 sm:px-3 py-1 bg-indigo-600 text-white text-xs sm:text-sm font-medium rounded-lg shadow hover:bg-indigo-500 active:scale-95 transition duration-200"
                      >
                        💬 Comments
                      </button>
                    </p>
                  </div>
                ) : (
                  <div>
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

                      {/* Like button - only visible for logged in users */}
                      {isLoggedIn && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleVideoLike(video._id);
                          }}
                          disabled={videoLoading}
                          className="mt-2 px-2 sm:px-3 py-1 bg-pink-600 hover:bg-pink-700 text-white text-xs sm:text-sm rounded disabled:opacity-50"
                        >
                          ❤️ {video.totalLikes}
                        </button>
                      )}

                      <p className="text-gray-300 mt-2 text-xs sm:text-sm">
                        {video.totalComments}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedVideoId(video._id);
                            fetchComments(video._id);
                            setShowCommentsModal(true);
                          }}
                          className="mt-2 sm:mt-0 sm:ml-2 px-2 sm:px-3 py-1 bg-indigo-600 text-white text-xs sm:text-sm font-medium rounded-lg shadow hover:bg-indigo-500 active:scale-95 transition duration-200"
                        >
                          💬 Comments
                        </button>
                      </p>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Comments Modal */}
        {showCommentsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-900 p-4 sm:p-7 rounded-2xl w-full max-w-md sm:max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-700">
              <h2 className="text-lg sm:text-xl font-extrabold mb-4 sm:mb-5 text-indigo-400 tracking-wide text-center">
                Comments
              </h2>

              {/* Comments List */}
              {comments.length > 0 ? (
                comments.map((c) => (
                  <div
                    key={c._id}
                    className="mb-4 flex items-start gap-3 bg-gray-800 rounded-xl p-3 shadow hover:shadow-lg transition-all border border-gray-700"
                  >
                    {/* User Avatar */}
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden">
                      {c.owner?.avatar ? (
                        <img
                          src={c.owner.avatar}
                          alt={c.owner.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm sm:text-lg">
                          {c.owner?.username?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {editCommentId === c._id ? (
                        <div className="flex flex-col gap-2">
                          <input
                            type="text"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full border border-indigo-600 bg-gray-900 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={updateComment}
                              disabled={commentLoading}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded shadow disabled:opacity-50 text-xs sm:text-sm"
                            >
                              {commentLoading ? "Saving..." : "Save"}
                            </button>
                            <button
                              onClick={() => setEditCommentId(null)}
                              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs sm:text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-indigo-300 text-sm">
                              {c.owner?.username || "Unknown"}
                            </span>
                            <span className="text-xs text-gray-400">
                              {c.createdAt
                                ? new Date(c.createdAt).toLocaleString()
                                : ""}
                            </span>
                          </div>
                          <p className="text-gray-200 mb-2 text-sm">
                            {c.content}
                          </p>

                          {/* Comment Actions - only for comment owner */}
                          {isLoggedIn &&
                            currentUser &&
                            c.owner?._id === currentUser._id && (
                              <div className="flex gap-2 mt-1">
                                <button
                                  onClick={() => startEditing(c._id, c.content)}
                                  className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold px-2 py-1 rounded hover:bg-indigo-900 transition"
                                >
                                  Update
                                </button>
                                <button
                                  onClick={() => deleteComment(c._id)}
                                  disabled={commentLoading}
                                  className="text-red-400 hover:text-red-300 text-xs font-semibold px-2 py-1 rounded hover:bg-red-900 transition disabled:opacity-50"
                                >
                                  {commentLoading ? "Deleting..." : "Delete"}
                                </button>
                              </div>
                            )}
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center">No comments yet.</p>
              )}

              {/* Add Comment Form */}
              {isLoggedIn ? (
                <div className="mt-6">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full border border-indigo-600 bg-gray-800 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-600 mb-2 text-sm"
                  />
                  <button
                    onClick={addComment}
                    disabled={commentLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded font-bold shadow-lg transition disabled:opacity-50 text-sm"
                  >
                    {commentLoading ? "Adding..." : "Add Comment"}
                  </button>
                </div>
              ) : (
                <p className="text-gray-400 text-center mt-4 text-sm">
                  Please login to add comments.
                </p>
              )}

              {/* Close Modal Button */}
              <button
                onClick={() => setShowCommentsModal(false)}
                className="block w-full bg-gray-800 hover:bg-gray-700 text-white py-2 mt-5 rounded font-semibold transition text-sm"
              >
                Close
              </button>
            </div>
          </div>
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
    </div>
  );
}

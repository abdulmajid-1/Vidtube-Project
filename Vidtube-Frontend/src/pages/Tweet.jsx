import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../api.js";

function Tweet() {
  const [loading, setLoading] = useState(true);
  const [tweets, setTweets] = useState([]);
  const [authChecking, setAuthChecking] = useState(true);
  const [newTweet, setNewTweet] = useState("");
  const [editTweetId, setEditTweetId] = useState(null);
  const [editTweetContent, setEditTweetContent] = useState("");
  const [note, setNote] = useState(null); // Notification message and type
  const [currentUser, setCurrentUser] = useState(null); // Store logged-in user

  const navigate = useNavigate();

  /**
   * Display a styled notification message
   * @param {string} message - Notification message
   * @param {string} type - Type of notification (success, error, info)
   */
  const showNote = (message, type = "info") => {
    setNote({ message, type });
    setTimeout(() => setNote(null), 3000);
  };

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
      } else {
        setCurrentUser(res.data.data); // Store user data
      }
    } catch (err) {
      console.log("error checking auth", err);
      navigate("/login");
    } finally {
      setAuthChecking(false);
    }
  };

  /**
   * Fetch all tweets from the API
   */
  const getAllTweets = async () => {
    try {
      const res = await axios.get(
        "https://vidtube-backend-2.onrender.com/api/v1/tweets/getAllTweets",
        { withCredentials: true }
      );
      setTweets(res.data.data.tweets || []);
    } catch (error) {
      console.error("Error fetching tweets:", error);
      showNote("Error fetching tweets", "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Add a new tweet
   */
  const addTweet = async () => {
    if (!newTweet.trim()) return;
    try {
      await axios.post(
        "https://vidtube-backend-2.onrender.com/api/v1/tweets/addTweet",
        {
          content: newTweet,
        },
        { withCredentials: true }
      );

      setNewTweet("");
      getAllTweets();
      showNote("Tweet added successfully!", "success");
    } catch (error) {
      console.error("Error adding tweet:", error);
      showNote("Error adding tweet", "error");
    }
  };

  /**
   * Delete a tweet
   * @param {string} id - Tweet ID to delete
   */
  const deleteTweet = async (id) => {
    try {
      await axios.delete(
        `https://vidtube-backend-2.onrender.com/api/v1/tweets/deleteTweet/${id}`,
        { withCredentials: true }
      );
      setTweets(tweets.filter((tweet) => tweet._id !== id));
      showNote("Tweet deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting tweet:", error);
      showNote("Error deleting tweet", "error");
    }
  };

  /**
   * Update an existing tweet
   */
  const updateTweet = async () => {
    if (!editTweetContent.trim()) return;
    try {
      await axios.patch(
        `https://vidtube-backend-2.onrender.com/api/v1/tweets/updateTweet/${editTweetId}`,
        {
          content: editTweetContent,
        },
        {
          withCredentials: true,
        }
      );

      setEditTweetId(null);
      setEditTweetContent("");
      getAllTweets();
      showNote("Tweet updated successfully!", "success");
    } catch (error) {
      console.error("Error updating tweet:", error);
      showNote("Error updating tweet", "error");
    }
  };

  useEffect(() => {
    checkAuth();
    getAllTweets();
  }, []);

  if (loading || authChecking) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-gray-400">
        Loading tweets...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      {/* Navigation Bar */}
      <nav className="bg-gray-800 px-6 py-4 flex justify-between items-center shadow">
        <h1 className="text-4xl font-Brush Script MT leading-none tracking-tight text-white">
          Tweets
        </h1>
        <div className="space-x-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate("/HomePage")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition"
          >
            Home
          </button>
        </div>
      </nav>

      {/* Notification Display */}
      {note && (
        <div
          className={`fixed top-5 right-5 px-5 py-3 rounded-xl shadow-lg z-50 transform transition-all duration-500 ${
            note.type === "success"
              ? "bg-green-600 text-white"
              : note.type === "error"
              ? "bg-red-600 text-white"
              : "bg-gray-700 text-white"
          }`}
        >
          {note.message}
        </div>
      )}

      {/* Tweet Creation Form */}
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <div className="bg-gray-800 border border-gray-700 p-4 rounded-xl flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newTweet}
            onChange={(e) => setNewTweet(e.target.value)}
            placeholder="What's happening?"
            className="flex-1 bg-gray-700 border border-gray-600 p-2 rounded-lg outline-none text-white"
          />
          <button
            onClick={addTweet}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition"
          >
            Tweet
          </button>
        </div>
      </div>

      {/* Tweets Feed */}
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        {tweets.length === 0 ? (
          <p className="text-center text-gray-400">No tweets found.</p>
        ) : (
          tweets.map((tweet) => (
            <div
              key={tweet._id}
              className="p-4 border border-gray-700 rounded-xl bg-gray-800 hover:shadow-lg transition"
            >
              {/* Tweet Author Information */}
              <div className="flex items-center mb-3">
                <img
                  src={tweet.owner.avatar}
                  alt={tweet.owner.username}
                  className="w-12 h-12 rounded-full mr-3 border border-gray-600"
                />
                <div>
                  <p className="font-semibold text-white">
                    {tweet.owner.fullName}
                  </p>
                  <p className="text-gray-400 text-sm">
                    @{tweet.owner.username}
                  </p>
                </div>
              </div>

              {/* Tweet Content */}
              {editTweetId === tweet._id ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editTweetContent}
                    onChange={(e) => setEditTweetContent(e.target.value)}
                    className="flex-1 bg-gray-700 border border-gray-600 p-2 rounded-lg text-white"
                  />
                  <button
                    onClick={updateTweet}
                    className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-lg transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditTweetId(null)}
                    className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <p className="text-gray-200 mb-3">{tweet.content}</p>
              )}

              {/* Tweet Media (if any) */}
              {tweet.image && (
                <img
                  src={tweet.image}
                  alt="Tweet media"
                  className="rounded-lg max-h-72 w-full object-cover mb-3"
                />
              )}

              {/* Tweet Actions and Metadata */}
              <div className="flex justify-between items-center">
                <p className="text-gray-400 text-xs">
                  {new Date(tweet.createdAt).toLocaleString()}
                </p>
                {/* Action buttons - only for current user's tweets */}
                {currentUser && tweet.owner._id === currentUser._id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditTweetId(tweet._id);
                        setEditTweetContent(tweet.content);
                      }}
                      className="text-indigo-400 hover:text-indigo-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTweet(tweet._id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Tweet;

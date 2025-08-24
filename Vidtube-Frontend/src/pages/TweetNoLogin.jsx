import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../api.js";

function TweetNoLogin() {
  const [loading, setLoading] = useState(true);
  const [tweets, setTweets] = useState([]);

  const navigate = useNavigate();

  // Fetch all tweets
  const getAllTweets = async () => {
    try {
      const res = await axios.get(
        "https://vidtube-backend-2.onrender.com/api/v1/tweets/getAllTweets",
        { withCredentials: true }
      );

      setTweets(res.data.data.tweets || []);
    } catch (error) {
      console.error("Error fetching tweets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllTweets();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-gray-400">
        <p className="text-lg animate-pulse">Loading tweets...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      {/* Navbar */}
      <nav className="bg-gray-800 px-6 py-4 flex justify-between items-center shadow">
        <h1 className="text-4xl font-Brush Script MT leading-none tracking-tight text-white cursor-pointer">
          Tweets
        </h1>
        <div className="space-x-4">
          <button
            onClick={() => navigate("/HomePage")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition"
          >
            Home
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-600 transition"
          >
            Login
          </button>
        </div>
      </nav>

      {/* Tweets Section */}
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        {tweets.length === 0 ? (
          <p className="text-center text-gray-400">No tweets found.</p>
        ) : (
          tweets.map((tweet) => (
            <div
              key={tweet._id}
              className="p-4 border border-gray-700 rounded-xl bg-gray-800 hover:shadow-lg transition"
            >
              {/* Owner */}
              <div className="flex items-center mb-3">
                <img
                  src={tweet?.owner?.avatar || "/default-avatar.png"}
                  alt={tweet?.owner?.username || "user"}
                  className="w-12 h-12 rounded-full mr-3 border border-gray-600 object-cover"
                />
                <div>
                  <p className="font-semibold text-white">
                    {tweet?.owner?.fullName || "Unknown User"}
                  </p>
                  <p className="text-gray-400 text-sm">
                    @{tweet?.owner?.username || "unknown"}
                  </p>
                </div>
              </div>

              {/* Tweet content */}
              <p className="text-gray-200 mb-3 whitespace-pre-line">
                {tweet.content}
              </p>

              {/* Image if available */}
              {tweet.image && (
                <img
                  src={tweet.image}
                  alt="Tweet media"
                  className="rounded-lg max-h-72 w-full object-cover mb-3"
                />
              )}

              {/* Time */}
              <p className="text-gray-400 text-xs">
                {new Date(tweet.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TweetNoLogin;

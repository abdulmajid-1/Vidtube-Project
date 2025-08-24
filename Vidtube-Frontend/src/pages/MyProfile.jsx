// MyProfile.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import api from "../api.js";

export default function MyProfile() {
  const navigate = useNavigate();

  // Global UI state
  const [authChecking, setAuthChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  // User + channel state
  const [currentUsername, setCurrentUsername] = useState("");
  const [channel, setChannel] = useState(null); // {fullname, username, email, avatar, coverImage, subscribersCount, channelsSubscribedToCount}
  const [watchHistory, setWatchHistory] = useState([]);

  // Forms
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const [accountData, setAccountData] = useState({
    fullname: "",
    email: "",
  });

  // Files
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  // ---------------- Helpers ----------------
  const note = (type, text) => setMsg({ type, text }); // type: "success" | "error" | "info"

  const clearNoteSoon = () => {
    setTimeout(() => setMsg({ type: "", text: "" }), 2500);
  };

  const MoveToDashboard = () => {
    navigate("/dashboard");
  };
  // ---------------- Auth + bootstrap ----------------
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

        // Load channel profile
        await fetchChannelProfile(user.username);

        // Load watch history
        // await fetchWatchHistory();
      } catch (err) {
        navigate("/login");
      } finally {
        setAuthChecking(false);
      }
    };
    init();
  }, [navigate]);

  // ---------------- API calls ----------------
  const fetchChannelProfile = async (username) => {
    try {
      const res = await axios.get(
        `https://vidtube-backend-2.onrender.com/api/v1/users/c/${username}`,
        {
          withCredentials: true,
        }
      );
      const data = res?.data?.data;
      setChannel(data);

      // Prefill account form only if empty
      setAccountData((prev) => ({
        fullname: prev.fullname || data?.fullname || "",
        email: prev.email || data?.email || "",
      }));
    } catch (err) {
      note("error", "Failed to load channel profile");
      clearNoteSoon();
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "https://vidtube-backend-2.onrender.com/api/v1/users/logout",
        {},
        { withCredentials: true }
      );
      navigate("/HomePage");
    } catch (err) {
      note("error", "Logout failed");
      clearNoteSoon();
    }
  };

  // ---------------- Handlers: Password ----------------
  const submitChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    note("", "");
    try {
      await axios.post(
        "https://vidtube-backend-2.onrender.com/api/v1/users/change-password",
        {
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      note("success", "Password changed successfully");
      setPasswordData({ oldPassword: "", newPassword: "" });
    } catch (err) {
      note(
        "error",
        err?.response?.data?.message || "Failed to change password"
      );
    } finally {
      setLoading(false);
      clearNoteSoon();
    }
  };

  // ---------------- Handlers: Account ----------------
  const submitUpdateAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    note("", "");
    try {
      await axios.patch(
        "https://vidtube-backend-2.onrender.com/api/v1/users/update-account",
        {
          fullname: accountData.fullname,
          email: accountData.email,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      note("success", "Account updated");
      // refresh the channel card
      if (currentUsername) await fetchChannelProfile(currentUsername);
    } catch (err) {
      note("error", err?.response?.data?.message || "Failed to update account");
    } finally {
      setLoading(false);
      clearNoteSoon();
    }
  };

  // ---------------- Handlers: Avatar ----------------
  const submitAvatar = async (e) => {
    e.preventDefault();
    if (!avatarFile) {
      note("info", "Please choose an avatar image first");
      clearNoteSoon();
      return;
    }
    setLoading(true);
    note("", "");
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      await axios.patch(
        "https://vidtube-backend-2.onrender.com/api/v1/users/avatar",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      note("success", "Avatar updated");
      setAvatarFile(null);
      if (currentUsername) await fetchChannelProfile(currentUsername);
    } catch (err) {
      note("error", err?.response?.data?.message || "Failed to update avatar");
    } finally {
      setLoading(false);
      clearNoteSoon();
    }
  };

  // ---------------- Handlers: Cover ----------------
  const submitCover = async (e) => {
    e.preventDefault();
    if (!coverFile) {
      note("info", "Please choose a cover image first");
      clearNoteSoon();
      return;
    }
    setLoading(true);
    note("", "");
    try {
      const formData = new FormData();
      formData.append("coverImage", coverFile);

      await axios.patch(
        "https://vidtube-backend-2.onrender.com/api/v1/users/cover-image",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      note("success", "Cover image updated");
      setCoverFile(null);
      if (currentUsername) await fetchChannelProfile(currentUsername);
    } catch (err) {
      note("error", err?.response?.data?.message || "Failed to update cover");
    } finally {
      setLoading(false);
      clearNoteSoon();
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-4xl font-Brush Script MT leading-none tracking-tight text-white">
            My Profile
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={MoveToDashboard}
              className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-700 transition"
            >
              Dashboard
            </button>
            {/* </div> */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Status bar */}
      {msg.text && (
        <div
          className={`max-w-7xl mx-auto px-6 mt-4 ${
            msg.type === "error"
              ? "text-red-200"
              : msg.type === "success"
              ? "text-green-200"
              : "text-yellow-200"
          }`}
        >
          <div
            className={`rounded-lg px-4 py-3 ${
              msg.type === "error"
                ? "bg-red-900/40 border border-red-800"
                : msg.type === "success"
                ? "bg-green-900/30 border border-green-800"
                : "bg-yellow-900/30 border border-yellow-800"
            }`}
          >
            {msg.text}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-10">
        {/* Channel banner card */}
        <section className="rounded-2xl overflow-hidden border border-gray-800 bg-gray-900">
          <div className="relative h-56 md:h-72 bg-gray-800">
            {channel?.coverImage ? (
              <img
                src={channel.coverImage}
                alt="Channel cover"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-r from-gray-800 to-gray-700" />
            )}

            <div className="absolute -bottom-12 left-6 flex items-end gap-4">
              <div className="h-24 w-24 rounded-full border-4 border-gray-900 bg-gray-700 overflow-hidden">
                {channel?.avatar ? (
                  <img
                    src={channel.avatar}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-600" />
                )}
              </div>
              <div className="pb-3">
                <h2 className="text-2xl font-bold">
                  {channel?.fullname || "Your Name"}
                </h2>
                <p className="text-sm text-gray-400">{channel?.email || ""}</p>
                <p className="text-sm text-gray-400">
                  Subscribers: {channel?.subscribersCount ?? 0} • Subscribed to:{" "}
                  {channel?.channelsSubscribedToCount ?? 0}
                </p>
              </div>
            </div>
          </div>
          <div className="h-14" />
        </section>

        {/* Forms grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account info */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Account Information</h3>
            <form onSubmit={submitUpdateAccount} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Full name</label>
                <input
                  type="text"
                  value={accountData.fullname}
                  onChange={(e) =>
                    setAccountData((s) => ({ ...s, fullname: e.target.value }))
                  }
                  className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Email</label>
                <input
                  type="email"
                  value={accountData.email}
                  onChange={(e) =>
                    setAccountData((s) => ({ ...s, email: e.target.value }))
                  }
                  className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Enter email"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 transition px-4 py-2"
              >
                {loading ? "Updating…" : "Update Info"}
              </button>
            </form>
          </div>

          {/* Change password */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Change Password</h3>
            <form onSubmit={submitChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Old password</label>
                <input
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) =>
                    setPasswordData((s) => ({
                      ...s,
                      oldPassword: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="Enter old password"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">New password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData((s) => ({
                      ...s,
                      newPassword: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="Enter new password"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-green-600 hover:bg-green-700 transition px-4 py-2"
              >
                {loading ? "Changing…" : "Change Password"}
              </button>
            </form>
          </div>

          {/* Avatar + cover */}
          <div className="space-y-8">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Update Avatar</h3>
              <form onSubmit={submitAvatar} className="space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm file:mr-4 file:rounded file:border-0 file:bg-gray-700 file:px-3 file:py-2 file:text-gray-100 hover:file:bg-gray-600"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-purple-600 hover:bg-purple-700 transition px-4 py-2"
                >
                  {loading ? "Uploading…" : "Update Avatar"}
                </button>
              </form>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Update Cover</h3>
              <form onSubmit={submitCover} className="space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm file:mr-4 file:rounded file:border-0 file:bg-gray-700 file:px-3 file:py-2 file:text-gray-100 hover:file:bg-gray-600"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-yellow-600 hover:bg-yellow-700 transition px-4 py-2"
                >
                  {loading ? "Uploading…" : "Update Cover"}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

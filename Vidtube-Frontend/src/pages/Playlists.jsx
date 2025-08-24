import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import api from "../api.js";

function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const [selected, setSelected] = useState(null); // selected playlist detail
  const [detailLoading, setDetailLoading] = useState(false);

  // Update form
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", description: "" });

  // Video selection modal state
  const [selectVideoOpen, setSelectVideoOpen] = useState(false);
  const [allVideos, setAllVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [videosPage, setVideosPage] = useState(1);
  const [videosTotalPages, setVideosTotalPages] = useState(1);
  const [selectedVideoIds, setSelectedVideoIds] = useState(new Set());

  const navigate = useNavigate();

  const fetchPlaylists = async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `https://vidtube-backend-2.onrender.com/api/v1/playlists/userPlaylist?page=${pageNum}&limit=9`,
        { withCredentials: true }
      );
      setPlaylists(res.data?.data?.playlists || []);
      setPage(res.data?.data?.currentPage || 1);
      setTotalPages(res.data?.data?.totalPages || 1);
    } catch (err) {
      console.error("Failed to load playlists:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (playlistId) => {
    try {
      setDetailLoading(true);
      const res = await axios.get(
        `https://vidtube-backend-2.onrender.com/api/v1/playlists/getPlaylistById/${playlistId}`,
        { withCredentials: true }
      );
      setSelected(res.data?.data || null);
      setEditForm({
        name: res.data?.data?.name || "",
        description: res.data?.data?.description || "",
      });
    } catch (err) {
      console.error("Failed to fetch playlist:", err.response?.data || err);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists(1);
  }, []);

  const createPlaylist = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newDescription.trim()) return;
    try {
      await axios.post(
        `https://vidtube-backend-2.onrender.com/api/v1/playlists/createPlaylist`,
        { name: newName, description: newDescription },
        { withCredentials: true }
      );
      setCreating(false);
      setNewName("");
      setNewDescription("");
      fetchPlaylists(page);
    } catch (err) {
      console.error("Create playlist failed:", err.response?.data || err);
    }
  };

  const updatePlaylist = async (e) => {
    e.preventDefault();
    if (!selected?._id) return;
    if (!editForm.name.trim() && !editForm.description.trim()) return;
    try {
      await axios.patch(
        `https://vidtube-backend-2.onrender.com/api/v1/playlists/updatePlaylist/${selected._id}`,
        editForm,
        { withCredentials: true }
      );
      await fetchDetail(selected._id);
      await fetchPlaylists(page);
      setEditOpen(false);
    } catch (err) {
      console.error("Update playlist failed:", err.response?.data || err);
    }
  };

  const deletePlaylist = async (playlistId) => {
    try {
      await axios.delete(
        `https://vidtube-backend-2.onrender.com/api/v1/playlists/deletePlaylist/${playlistId}`,
        {
          withCredentials: true,
        }
      );
      if (selected?._id === playlistId) setSelected(null);
      fetchPlaylists(page);
    } catch (err) {
      console.error("Delete playlist failed:", err.response?.data || err);
    }
  };

  const fetchAllVideos = async (pageNum = 1) => {
    try {
      setVideosLoading(true);
      const res = await axios.get(
        `https://vidtube-backend-2.onrender.com/api/v1/videos/getAll?page=${pageNum}`,
        { withCredentials: true }
      );
      setAllVideos(res.data?.data?.videos || []);
      setVideosPage(res.data?.data?.currentPage || 1);
      setVideosTotalPages(res.data?.data?.totalPages || 1);
    } catch (err) {
      console.error("Failed to load videos:", err.response?.data || err);
    } finally {
      setVideosLoading(false);
    }
  };

  const openSelectVideos = () => {
    if (!selected?._id) return;
    setSelectedVideoIds(new Set());
    setSelectVideoOpen(true);
    fetchAllVideos(1);
  };

  const toggleVideoPick = (id) => {
    setSelectedVideoIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addPickedVideos = async () => {
    if (!selected?._id || selectedVideoIds.size === 0) return;
    try {
      const requests = Array.from(selectedVideoIds).map((vid) =>
        axios.post(
          `https://vidtube-backend-2.onrender.com/api/v1/playlists/addVideoInPlaylist`,
          { playlistId: selected._id, videoId: vid },
          { withCredentials: true }
        )
      );
      await Promise.all(requests);
      setSelectVideoOpen(false);
      setSelectedVideoIds(new Set());
      fetchDetail(selected._id);
    } catch (err) {
      console.error("Add selected videos failed:", err.response?.data || err);
    }
  };

  const removeVideo = async (vid) => {
    if (!selected?._id || !vid) return;
    try {
      await axios.delete(
        `https://vidtube-backend-2.onrender.com/api/v1/playlists/removeVideoFromPlaylist`,
        {
          data: { playlistId: selected._id, videoId: vid },
          withCredentials: true,
        }
      );
      fetchDetail(selected._id);
    } catch (err) {
      console.error("Remove video failed:", err.response?.data || err);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-gray-200">
      {/* Top bar */}
      <nav className="bg-gray-800 px-6 py-4 flex justify-between items-center shadow">
        <h1 className="text-4xl font-Brush Script MT leading-none tracking-tight text-white">
          Playlists
        </h1>
        <div className="space-x-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition"
          >
            Dashboard
          </button>
          <button
            onClick={() => setCreating(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition"
          >
            New Playlist
          </button>
        </div>
      </nav>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 shadow rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Your Playlists</h2>
            {loading ? (
              <p className="text-gray-400">Loading...</p>
            ) : playlists.length === 0 ? (
              <p className="text-gray-400">No playlists yet.</p>
            ) : (
              <ul className="space-y-3">
                {playlists.map((pl) => (
                  <li
                    key={pl._id}
                    className={`p-3 rounded-lg cursor-pointer ${
                      selected?._id === pl._id
                        ? "bg-gray-700"
                        : "bg-gray-900 hover:bg-gray-800"
                    }`}
                    onClick={() => fetchDetail(pl._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">{pl.name}</p>
                        <p className="text-sm text-gray-400 line-clamp-1">
                          {pl.description}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePlaylist(pl._id);
                        }}
                        className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => fetchPlaylists(page - 1)}
                disabled={page <= 1}
                className="px-3 py-1.5 bg-gray-700 text-gray-300 rounded disabled:opacity-50"
              >
                Prev
              </button>
              <p className="text-gray-400">
                Page {page} of {totalPages}
              </p>
              <button
                onClick={() => fetchPlaylists(page + 1)}
                disabled={page >= totalPages}
                className="px-3 py-1.5 bg-gray-700 text-gray-300 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Detail */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 shadow rounded-lg p-5 min-h-[300px]">
            {!selected ? (
              <p className="text-gray-400">
                Select a playlist to view details.
              </p>
            ) : detailLoading ? (
              <p className="text-gray-400">Loading playlist…</p>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {selected.name}
                    </h2>
                    <p className="text-gray-300 mt-1">{selected.description}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      By {selected.owner?.username}
                    </p>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => setEditOpen(true)}
                      className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={openSelectVideos}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded"
                    >
                      Add Video
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mt-6 mb-3">Videos</h3>
                {selected.videos?.length ? (
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selected.videos.map((v) => (
                      <li key={v._id} className="bg-gray-900 rounded-lg p-3">
                        <p className="font-semibold text-white line-clamp-1">
                          {v.title}
                        </p>
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {v.description}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <a
                            href={v.videoFile}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 text-sm"
                          >
                            Open
                          </a>
                          <button
                            onClick={() => removeVideo(v._id)}
                            className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded"
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400">No videos in this playlist.</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {creating && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-5 rounded-xl w-[420px]">
            <h2 className="text-xl font-bold mb-3 text-white">
              Create Playlist
            </h2>
            <form onSubmit={createPlaylist} className="space-y-3">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Name"
                className="w-full bg-gray-900 text-white rounded px-3 py-2 border border-gray-700"
              />
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Description"
                className="w-full bg-gray-900 text-white rounded px-3 py-2 border border-gray-700"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreating(false)}
                  className="px-3 py-2 bg-gray-700 text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editOpen && selected && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-5 rounded-xl w-[420px]">
            <h2 className="text-xl font-bold mb-3 text-white">Edit Playlist</h2>
            <form onSubmit={updatePlaylist} className="space-y-3">
              <input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                placeholder="Name"
                className="w-full bg-gray-900 text-white rounded px-3 py-2 border border-gray-700"
              />
              <textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                placeholder="Description"
                className="w-full bg-gray-900 text-white rounded px-3 py-2 border border-gray-700"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="px-3 py-2 bg-gray-700 text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Select Videos Modal */}
      {selectVideoOpen && selected && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-5 rounded-xl w-[720px] max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-white">
                Add Videos to "{selected.name}"
              </h2>
              <button
                onClick={() => setSelectVideoOpen(false)}
                className="px-3 py-1.5 bg-gray-700 text-white rounded"
              >
                Close
              </button>
            </div>

            {videosLoading ? (
              <p className="text-gray-400">Loading videos…</p>
            ) : allVideos.length === 0 ? (
              <p className="text-gray-400">No videos found.</p>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {allVideos.map((v) => {
                  const picked = selectedVideoIds.has(v._id);
                  return (
                    <li
                      key={v._id}
                      className={`border ${
                        picked ? "border-indigo-500" : "border-gray-700"
                      } rounded-lg p-3 bg-gray-900`}
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={v.thumbnail}
                          alt={v.title}
                          className="w-24 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-white line-clamp-1">
                            {v.title}
                          </p>
                          <p className="text-sm text-gray-400 line-clamp-2">
                            {v.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            By {v.owner?.username}
                          </p>
                          <div className="mt-2">
                            <button
                              onClick={() => toggleVideoPick(v._id)}
                              className={`px-3 py-1.5 text-sm rounded ${
                                picked
                                  ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                                  : "bg-gray-700 hover:bg-gray-600 text-white"
                              }`}
                            >
                              {picked ? "Selected" : "Select"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Pagination for videos */}
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => fetchAllVideos(videosPage - 1)}
                disabled={videosPage <= 1}
                className="px-3 py-1.5 bg-gray-700 text-gray-300 rounded disabled:opacity-50"
              >
                Prev
              </button>
              <p className="text-gray-400">
                Page {videosPage} of {videosTotalPages}
              </p>
              <button
                onClick={() => fetchAllVideos(videosPage + 1)}
                disabled={videosPage >= videosTotalPages}
                className="px-3 py-1.5 bg-gray-700 text-gray-300 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setSelectVideoOpen(false)}
                className="px-3 py-2 bg-gray-700 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={addPickedVideos}
                disabled={selectedVideoIds.size === 0}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded disabled:opacity-50"
              >
                Add Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Playlists;

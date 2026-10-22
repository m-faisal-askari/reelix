import React, { useEffect, useState } from "react";
import { XIcon, CalendarIcon, DollarSignIcon, FilmIcon, Loader2Icon } from "lucide-react";
import { useAppContext } from "../../context/AppContext.jsx";
import toast from "react-hot-toast";

const toDateTimeLocalValue = (dateInput) => {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const EditShowModal = ({ isOpen, onClose, show, onSuccess }) => {
  const { axios, getToken, fetchShows } = useAppContext();
  const currency = import.meta.env.VITE_CURRENCY || "$";

  const [dateTimeInput, setDateTimeInput] = useState("");
  const [showPrice, setShowPrice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      setDateTimeInput(toDateTimeLocalValue(show.showDateTime));
      setShowPrice(show.showPrice !== undefined ? String(show.showPrice) : "");
    }
  }, [show]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen || !show) return null;

  const movie = show.movie || {};
  const occupiedCount = Object.keys(show.occupiedSeats || {}).length;

  const getPosterUrl = (path) => {
    if (!path) return "";
    return path.startsWith("http")
      ? path
      : `https://image.tmdb.org/t/p/w500${path}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!dateTimeInput) {
      return toast.error("Please specify a valid show date and time");
    }

    if (showPrice === "" || Number(showPrice) < 0) {
      return toast.error("Please enter a valid ticket price");
    }

    setLoading(true);
    try {
      const token = await getToken();
      const { data } = await axios.put(
        `/api/admin/show/${show._id}`,
        {
          showDateTime: dateTimeInput,
          showPrice: Number(showPrice),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        toast.success(data.message || "Show updated successfully!");
        if (onSuccess) onSuccess(data.show);
        if (fetchShows) fetchShows();
        onClose();
      } else {
        toast.error(data.message || "Failed to update show");
      }
    } catch (error) {
      console.error("Update show error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to update show");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-[#140b20] border border-primary/30 rounded-2xl p-6 shadow-2xl text-white max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-primary/20">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FilmIcon className="w-5 h-5 text-primary" />
            Edit Show
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer disabled:opacity-50"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Movie Info Card */}
        <div className="flex items-center gap-4 mt-5 p-3.5 bg-primary/10 border border-primary/20 rounded-xl">
          {movie.poster_path ? (
            <img
              src={getPosterUrl(movie.poster_path)}
              alt={movie.title || "Movie poster"}
              className="w-14 h-20 object-cover rounded-lg shrink-0 shadow-md border border-primary/30"
            />
          ) : (
            <div className="w-14 h-20 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <FilmIcon className="w-6 h-6 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate text-white">
              {movie.title || "Movie Show"}
            </h3>
            {movie.runtime && (
              <p className="text-xs text-gray-400 mt-0.5">
                Runtime: {movie.runtime} mins
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-primary">
                {occupiedCount} seat{occupiedCount !== 1 ? "s" : ""} booked
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5 flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-primary" />
              Show Date & Time
            </label>
            <input
              type="datetime-local"
              value={dateTimeInput}
              onChange={(e) => setDateTimeInput(e.target.value)}
              required
              className="w-full bg-[#1e1330] border border-primary/30 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary transition [color-scheme:dark]"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Select the new scheduled date and time for this show.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5 flex items-center gap-1.5">
              <DollarSignIcon className="w-4 h-4 text-primary" />
              Ticket Price ({currency})
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={showPrice}
              onChange={(e) => setShowPrice(e.target.value)}
              placeholder="e.g. 12"
              required
              className="w-full bg-[#1e1330] border border-primary/30 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-primary/20 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 text-sm font-medium rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-primary hover:bg-primary/90 text-white transition cursor-pointer disabled:opacity-50 shadow-lg shadow-primary/20"
            >
              {loading ? (
                <>
                  <Loader2Icon className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditShowModal;

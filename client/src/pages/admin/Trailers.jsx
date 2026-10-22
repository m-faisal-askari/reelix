import React, { useState } from "react";
import Title from "../../components/admin/Title";
import BlurCircle from "../../components/BlurCircle";
import { useAppContext } from "../../context/AppContext";
import ReactPlayer from "react-player";
import {
  FilmIcon,
  PlusIcon,
  Trash2Icon,
  PlayCircleIcon,
  ExternalLinkIcon,
  RotateCcwIcon,
  SparklesIcon,
  XIcon,
  PencilIcon,
  CheckIcon,
} from "lucide-react";
import toast from "react-hot-toast";

const extractYouTubeId = (url) => {
  if (!url) return null;
  const regExp =
    /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[1].length === 11 ? match[1] : null;
};

const getYouTubeThumbnail = (url) => {
  const id = extractYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
};

const AdminTrailers = () => {
  const { trailers, addTrailer, updateTrailer, removeTrailer, resetTrailers } =
    useAppContext();

  // Form State
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("Action / Sci-Fi");
  const [autoThumbnail, setAutoThumbnail] = useState(true);

  // Preview Modal
  const [previewTrailer, setPreviewTrailer] = useState(null);

  // Edit Modal State
  const [editingTrailer, setEditingTrailer] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editVideoUrl, setEditVideoUrl] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editCategory, setEditCategory] = useState("");

  const handleVideoUrlChange = (url) => {
    setVideoUrl(url);
    if (autoThumbnail) {
      const thumb = getYouTubeThumbnail(url);
      if (thumb) {
        setImageUrl(thumb);
      }
    }
  };

  const handleAddTrailer = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      return toast.error("Please enter a trailer title");
    }

    if (!videoUrl.trim()) {
      return toast.error("Please enter a valid video or YouTube URL");
    }

    let finalImage = imageUrl.trim();
    if (!finalImage) {
      finalImage = getYouTubeThumbnail(videoUrl) || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800";
    }

    const newTrailer = {
      id: `tr-${Date.now()}`,
      title: title.trim(),
      videoUrl: videoUrl.trim(),
      image: finalImage,
      category: category.trim() || "Trailer",
    };

    addTrailer(newTrailer);
    toast.success(`Trailer "${newTrailer.title}" added successfully!`);

    // Reset Form
    setTitle("");
    setVideoUrl("");
    setImageUrl("");
    setCategory("Action / Sci-Fi");
  };

  const handleDeleteTrailer = (id, trailerTitle) => {
    if (window.confirm(`Are you sure you want to delete the trailer "${trailerTitle}"?`)) {
      removeTrailer(id);
      toast.success("Trailer removed");
    }
  };

  const handleResetDefaults = () => {
    if (
      window.confirm(
        "Reset all trailers back to the default initial trailers? Custom trailers will be cleared."
      )
    ) {
      resetTrailers();
      toast.success("Trailers reset to defaults");
    }
  };

  const openEditModal = (trailer) => {
    setEditingTrailer(trailer);
    setEditTitle(trailer.title || "");
    setEditVideoUrl(trailer.videoUrl || "");
    setEditImageUrl(trailer.image || "");
    setEditCategory(trailer.category || "Trailer");
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingTrailer) return;

    if (!editTitle.trim() || !editVideoUrl.trim()) {
      return toast.error("Title and video URL are required");
    }

    updateTrailer(editingTrailer.id, {
      title: editTitle.trim(),
      videoUrl: editVideoUrl.trim(),
      image: editImageUrl.trim() || getYouTubeThumbnail(editVideoUrl) || editingTrailer.image,
      category: editCategory.trim(),
    });

    toast.success("Trailer updated successfully");
    setEditingTrailer(null);
  };

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Title text1="Manage" text2="Latest Trailers" />
          <p className="text-xs text-gray-400 mt-1">
            Add, update, or remove featured trailers displayed on the home page.
          </p>
        </div>
        <button
          type="button"
          onClick={handleResetDefaults}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-primary/10 border border-primary/20 text-gray-300 hover:text-white hover:bg-primary/20 transition cursor-pointer"
        >
          <RotateCcwIcon className="w-3.5 h-3.5" />
          Reset to Defaults
        </button>
      </div>

      {/* Add New Trailer Form */}
      <div className="relative mt-8 p-6 bg-primary/5 border border-primary/25 rounded-2xl max-w-4xl shadow-xl">
        <BlurCircle top="-40px" left="20px" />
        <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
          <FilmIcon className="w-5 h-5 text-primary" />
          Add New Trailer
        </h2>

        <form onSubmit={handleAddTrailer} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                Trailer Title <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Avatar: Fire and Ash - Official Trailer"
                required
                className="w-full bg-[#150d24] border border-primary/30 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-primary text-sm"
              />
            </div>

            {/* Category / Genre */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                Genre / Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Action / Adventure, Sci-Fi, Now Showing"
                className="w-full bg-[#150d24] border border-primary/30 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-primary text-sm"
              />
            </div>
          </div>

          {/* Video URL */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
              YouTube / Video URL <span className="text-primary">*</span>
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => handleVideoUrlChange(e.target.value)}
              placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://youtu.be/..."
              required
              className="w-full bg-[#150d24] border border-primary/30 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-primary text-sm"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Supports full YouTube links or short links (youtu.be). Thumbnails will be auto-generated.
            </p>
          </div>

          {/* Thumbnail URL & Toggle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
                Thumbnail Image URL
              </label>
              <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoThumbnail}
                  onChange={(e) => {
                    setAutoThumbnail(e.target.checked);
                    if (e.target.checked && videoUrl) {
                      const thumb = getYouTubeThumbnail(videoUrl);
                      if (thumb) setImageUrl(thumb);
                    }
                  }}
                  className="rounded border-primary/30 text-primary accent-primary"
                />
                Auto-generate from YouTube
              </label>
            </div>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Custom image URL or leave as auto"
              className="w-full bg-[#150d24] border border-primary/30 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-primary text-sm"
            />
          </div>

          {/* Thumbnail Preview if available */}
          {imageUrl && (
            <div className="flex items-center gap-4 p-3 bg-primary/10 border border-primary/20 rounded-xl">
              <img
                src={imageUrl}
                alt="Thumbnail preview"
                className="w-28 h-16 object-cover rounded-lg border border-primary/30 shrink-0"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <div className="flex-1 min-w-0 text-xs">
                <p className="font-medium text-white truncate">
                  {title || "Trailer Preview"}
                </p>
                <p className="text-gray-400 truncate mt-0.5">{videoUrl}</p>
                <span className="inline-block mt-1 text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full border border-primary/30">
                  Thumbnail Detected
                </span>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl transition cursor-pointer shadow-lg shadow-primary/20 text-sm"
            >
              <PlusIcon className="w-4 h-4" />
              Add Trailer
            </button>
          </div>
        </form>
      </div>

      {/* Existing Trailers Section */}
      <div className="mt-12 max-w-5xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-white">
            Active Trailers ({trailers?.length || 0})
          </h2>
          <p className="text-xs text-gray-400">
            The first trailer is featured primarily on the homepage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {(trailers || []).map((trailer, index) => (
            <div
              key={trailer.id || index}
              className="relative p-3.5 bg-primary/10 border border-primary/20 hover:border-primary/40 rounded-xl flex items-center gap-3.5 transition group"
            >
              {/* Thumbnail with play overlay */}
              <div
                onClick={() => setPreviewTrailer(trailer)}
                className="relative w-36 aspect-video rounded-lg overflow-hidden shrink-0 cursor-pointer bg-black/50 border border-primary/30 group-hover:scale-102 transition"
                title="Click to preview video"
              >
                <img
                  src={trailer.image}
                  alt={trailer.title}
                  className="w-full h-full object-cover brightness-85"
                />
                <PlayCircleIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-white/90 group-hover:text-primary transition" />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {index === 0 && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-primary text-white px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                      <SparklesIcon className="w-2.5 h-2.5" /> Featured
                    </span>
                  )}
                  {trailer.category && (
                    <span className="text-[10px] text-gray-300 bg-primary/20 border border-primary/30 px-2 py-0.5 rounded-md truncate max-w-32">
                      {trailer.category}
                    </span>
                  )}
                </div>

                <h3
                  className="font-medium text-sm text-white truncate mt-1.5"
                  title={trailer.title}
                >
                  {trailer.title || "Untitled Trailer"}
                </h3>

                <p
                  className="text-xs text-gray-400 truncate mt-0.5"
                  title={trailer.videoUrl}
                >
                  {trailer.videoUrl}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => setPreviewTrailer(trailer)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-primary/20 hover:bg-primary/30 text-white border border-primary/30 transition cursor-pointer"
                  >
                    <PlayCircleIcon className="w-3.5 h-3.5 text-primary" />
                    Play
                  </button>
                  <button
                    onClick={() => openEditModal(trailer)}
                    className="p-1.5 rounded-lg hover:bg-primary/30 text-gray-300 hover:text-white transition cursor-pointer"
                    title="Edit Trailer"
                  >
                    <PencilIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTrailer(trailer.id, trailer.title)}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition cursor-pointer"
                    title="Delete Trailer"
                  >
                    <Trash2Icon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Preview Modal */}
      {previewTrailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-[#140b20] border border-primary/30 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-primary/20">
              <h3 className="font-semibold text-base text-white truncate max-w-md">
                {previewTrailer.title}
              </h3>
              <button
                onClick={() => setPreviewTrailer(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video bg-black">
              <ReactPlayer
                src={previewTrailer.videoUrl}
                controls={true}
                playing={true}
                width="100%"
                height="100%"
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Trailer Modal */}
      {editingTrailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-lg bg-[#140b20] border border-primary/30 rounded-2xl p-6 shadow-2xl text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-primary/20">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <PencilIcon className="w-4 h-4 text-primary" />
                Edit Trailer
              </h2>
              <button
                onClick={() => setEditingTrailer(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full bg-[#1e1330] border border-primary/30 rounded-xl px-3.5 py-2 text-white outline-none focus:border-primary text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                  Video URL
                </label>
                <input
                  type="url"
                  value={editVideoUrl}
                  onChange={(e) => {
                    setEditVideoUrl(e.target.value);
                    const thumb = getYouTubeThumbnail(e.target.value);
                    if (thumb) setEditImageUrl(thumb);
                  }}
                  required
                  className="w-full bg-[#1e1330] border border-primary/30 rounded-xl px-3.5 py-2 text-white outline-none focus:border-primary text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                  Genre / Category
                </label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full bg-[#1e1330] border border-primary/30 rounded-xl px-3.5 py-2 text-white outline-none focus:border-primary text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
                  Thumbnail Image URL
                </label>
                <input
                  type="url"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  className="w-full bg-[#1e1330] border border-primary/30 rounded-xl px-3.5 py-2 text-white outline-none focus:border-primary text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-primary/20 mt-4">
                <button
                  type="button"
                  onClick={() => setEditingTrailer(null)}
                  className="px-4 py-2 text-xs font-medium rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-primary hover:bg-primary/90 text-white transition cursor-pointer shadow-md shadow-primary/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminTrailers;

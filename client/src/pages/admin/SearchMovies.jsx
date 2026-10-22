import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  SearchIcon,
  PlusIcon,
  StarIcon,
  FilmIcon,
  TvIcon,
  ArrowLeftIcon,
  CheckIcon,
  Trash2Icon,
  CalendarIcon,
  ClockIcon,
  DollarSignIcon,
  Loader2Icon,
  XIcon,
  SparklesIcon,
} from "lucide-react";
import Title from "../../components/admin/Title";
import BlurCircle from "../../components/BlurCircle";
import { useAppContext } from "../../context/AppContext.jsx";
import toast from "react-hot-toast";

const SearchMovies = () => {
  const navigate = useNavigate();
  const { axios, getToken, fetchShows } = useAppContext();
  const currency = import.meta.env.VITE_CURRENCY || "$";

  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState("multi"); // "multi", "movie", "tv"
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Quick Schedule Modal state
  const [schedulingMovie, setSchedulingMovie] = useState(null);
  const [dateTimeSelection, setDateTimeSelection] = useState({});
  const [dateTimeInput, setDateTimeInput] = useState("");
  const [showPrice, setShowPrice] = useState("");
  const [submittingShow, setSubmittingShow] = useState(false);

  const getPosterUrl = (path) => {
    if (!path) return "";
    return path.startsWith("http")
      ? path
      : `https://image.tmdb.org/t/p/w500${path}`;
  };

  // Live search as the user types every character (debounced)
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSearchResults([]);
      setHasSearched(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    const debounceTimer = setTimeout(async () => {
      try {
        const token = await getToken();
        const { data } = await axios.get("/api/show/search", {
          params: {
            query: trimmed,
            type: filterType,
          },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (data.success) {
          setSearchResults(data.results || []);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Live search error:", error);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(debounceTimer);
  }, [query, filterType]);

  const handleManualSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) {
      return toast.error("Please enter a title to search");
    }
  };

  const handleTypeChange = (type) => {
    setFilterType(type);
  };

  const handleSelectForAddShows = (movie) => {
    const movieData = {
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      vote_count: 100,
      overview: movie.overview,
      media_type: movie.media_type,
    };

    // Store in localStorage custom movies list so it persists in Now Playing
    try {
      const existing = JSON.parse(
        localStorage.getItem("reelix_custom_movies") || "[]"
      );
      const filtered = existing.filter((m) => String(m.id) !== String(movie.id));
      localStorage.setItem(
        "reelix_custom_movies",
        JSON.stringify([movieData, ...filtered])
      );
    } catch (e) {
      console.error("Failed to save custom movie:", e);
    }

    toast.success(`"${movie.title}" added to Now Playing list!`);

    // Navigate back to AddShows page with this movie pre-selected
    navigate("/admin/add-shows", {
      state: {
        selectedMovieData: movieData,
      },
    });
  };

  const openScheduleModal = (movie) => {
    setSchedulingMovie(movie);
    setDateTimeSelection({});
    setDateTimeInput("");
    setShowPrice("");
  };

  const handleDateTimeAdd = () => {
    if (!dateTimeInput) return;
    const [date, time] = dateTimeInput.split("T");
    if (!date || !time) return;

    setDateTimeSelection((prev) => {
      const times = prev[date] || [];
      if (!times.includes(time)) {
        return { ...prev, [date]: [...times, time] };
      }
      return prev;
    });
    setDateTimeInput("");
  };

  const handleRemoveTime = (date, time) => {
    setDateTimeSelection((prev) => {
      const filteredTimes = prev[date].filter((t) => t !== time);
      if (filteredTimes.length === 0) {
        const { [date]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [date]: filteredTimes,
      };
    });
  };

  const handleSubmitSchedule = async (e) => {
    e.preventDefault();
    if (!schedulingMovie) return;

    if (!showPrice || Number(showPrice) <= 0) {
      return toast.error("Please enter a valid show price");
    }

    const currentSelection = { ...dateTimeSelection };
    if (dateTimeInput) {
      const [date, time] = dateTimeInput.split("T");
      if (date && time) {
        const times = currentSelection[date] || [];
        if (!times.includes(time)) {
          currentSelection[date] = [...times, time];
        }
      }
    }

    const showsInput = Object.entries(currentSelection).map(([date, time]) => ({
      date,
      time,
    }));

    if (showsInput.length === 0) {
      return toast.error("Please add at least one show date and time");
    }

    setSubmittingShow(true);
    try {
      const token = await getToken();
      const { data } = await axios.post(
        "/api/show/add",
        {
          movieId: schedulingMovie.id,
          showsInput,
          showPrice: Number(showPrice),
          mediaType: schedulingMovie.media_type,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        toast.success(`Show added for "${schedulingMovie.title}"!`);

        // Also add to custom movies in localStorage
        try {
          const existing = JSON.parse(
            localStorage.getItem("reelix_custom_movies") || "[]"
          );
          const filtered = existing.filter(
            (m) => String(m.id) !== String(schedulingMovie.id)
          );
          localStorage.setItem(
            "reelix_custom_movies",
            JSON.stringify([schedulingMovie, ...filtered])
          );
        } catch (err) {
          console.error(err);
        }

        setSchedulingMovie(null);
        if (fetchShows) fetchShows();
      } else {
        toast.error(data.message || "Failed to add show");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || error.message || "Failed to add show"
      );
    } finally {
      setSubmittingShow(false);
    }
  };

  const quickSearches = [
    "Interstellar",
    "Inception",
    "The Dark Knight",
    "Avatar",
    "Breaking Bad",
    "Stranger Things",
    "Oppenheimer",
    "Gladiator",
  ];

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Title text1="Search" text2="TMDB Movies & Series" />
          <p className="text-xs text-gray-400 mt-1">
            Search any movie or series across TMDB to schedule shows in your theater.
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/add-shows")}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-primary/10 border border-primary/20 text-gray-300 hover:text-white hover:bg-primary/20 transition cursor-pointer"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          Back to Add Shows
        </button>
      </div>

      {/* Search Bar & Filter */}
      <div className="relative mt-6 max-w-4xl">
        <BlurCircle top="-40px" left="50px" />

        <form onSubmit={handleManualSearch} className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to search live (e.g. Inception, Batman, Breaking Bad)..."
              autoFocus
              className="w-full pl-11 pr-10 py-3 bg-[#150d24] border border-primary/30 rounded-xl text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary transition text-sm shadow-inner"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <XIcon className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl transition cursor-pointer disabled:opacity-50 shadow-lg shadow-primary/20 shrink-0 text-sm"
          >
            {loading ? (
              <Loader2Icon className="w-4 h-4 animate-spin" />
            ) : (
              <SearchIcon className="w-4 h-4" />
            )}
            Search
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mt-3 text-xs">
          <span className="text-gray-400 mr-1">Type:</span>
          <button
            type="button"
            onClick={() => handleTypeChange("multi")}
            className={`px-3 py-1 rounded-full border transition cursor-pointer ${
              filterType === "multi"
                ? "bg-primary text-white border-primary"
                : "bg-primary/10 text-gray-400 border-primary/20 hover:text-white"
            }`}
          >
            All Media
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("movie")}
            className={`flex items-center gap-1 px-3 py-1 rounded-full border transition cursor-pointer ${
              filterType === "movie"
                ? "bg-primary text-white border-primary"
                : "bg-primary/10 text-gray-400 border-primary/20 hover:text-white"
            }`}
          >
            <FilmIcon className="w-3 h-3" />
            Movies Only
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("tv")}
            className={`flex items-center gap-1 px-3 py-1 rounded-full border transition cursor-pointer ${
              filterType === "tv"
                ? "bg-primary text-white border-primary"
                : "bg-primary/10 text-gray-400 border-primary/20 hover:text-white"
            }`}
          >
            <TvIcon className="w-3 h-3" />
            TV Series
          </button>

          {loading && (
            <span className="text-xs text-primary flex items-center gap-1 ml-2 animate-pulse">
              <Loader2Icon className="w-3 h-3 animate-spin" />
              Updating live...
            </span>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        {!hasSearched && (
          <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Popular Searches (Click to Search)
            </p>
            <div className="flex flex-wrap gap-2">
              {quickSearches.map((title, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setQuery(title)}
                  className="px-3 py-1.5 text-xs rounded-lg bg-primary/15 hover:bg-primary/30 border border-primary/25 text-gray-200 transition cursor-pointer"
                >
                  {title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results Header */}
      {hasSearched && (
        <div className="flex items-center justify-between mt-8 max-w-6xl">
          <p className="text-base font-medium">
            Search Results ({searchResults.length})
          </p>
          <p className="text-xs text-gray-400">
            Click &ldquo;Add to Now Playing & Schedule&rdquo; to send the movie to Add Shows.
          </p>
        </div>
      )}

      {/* Results Grid */}
      <div className="relative mt-4 max-w-6xl">
        <BlurCircle top="120px" left="20px" />

        {loading && searchResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
            <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm">Searching TMDB catalog as you type...</p>
          </div>
        ) : hasSearched && searchResults.length === 0 ? (
          <div className="text-center py-16 bg-primary/5 border border-dashed border-primary/20 rounded-xl">
            <p className="text-gray-300 font-medium">No movies or series found</p>
            <p className="text-xs text-gray-500 mt-1">
              Try searching with a different title or keyword.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {searchResults.map((item) => (
              <div
                key={item.id}
                className="rounded-xl overflow-hidden flex flex-col bg-primary/10 border border-primary/20 hover:border-primary/50 transition duration-200 group"
              >
                {/* Poster */}
                <div className="relative aspect-[2/3] w-full bg-primary/20 overflow-hidden">
                  {item.poster_path ? (
                    <img
                      src={getPosterUrl(item.poster_path)}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 p-2 text-center">
                      <FilmIcon className="w-8 h-8 mb-1 opacity-50" />
                      <span className="text-[11px]">No Poster Available</span>
                    </div>
                  )}

                  {/* Rating Badge */}
                  <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1 text-[11px] font-medium text-white border border-white/10">
                    <StarIcon className="w-3 h-3 text-primary fill-primary" />
                    <span>{item.vote_average?.toFixed(1) || "0.0"}</span>
                  </div>

                  {/* Media Type Badge */}
                  <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] uppercase font-bold text-gray-300 border border-white/10 flex items-center gap-1">
                    {item.media_type === "tv" ? (
                      <>
                        <TvIcon className="w-2.5 h-2.5 text-primary" /> TV
                      </>
                    ) : (
                      <>
                        <FilmIcon className="w-2.5 h-2.5 text-primary" /> Movie
                      </>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3
                      className="font-semibold text-sm text-white line-clamp-1 group-hover:text-primary transition"
                      title={item.title}
                    >
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {item.release_date ? item.release_date.slice(0, 4) : "N/A"}
                    </p>
                    {item.overview && (
                      <p className="text-[11px] text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {item.overview}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-3 pt-2.5 border-t border-primary/15 flex flex-col gap-1.5">
                    <button
                      onClick={() => handleSelectForAddShows(item)}
                      className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-sm shadow-primary/20"
                    >
                      <PlusIcon className="w-3.5 h-3.5" />
                      Add to Now Playing
                    </button>
                    <button
                      onClick={() => openScheduleModal(item)}
                      className="w-full flex items-center justify-center gap-1 px-2.5 py-1 bg-primary/15 hover:bg-primary/30 border border-primary/25 text-gray-300 hover:text-white rounded-lg text-[11px] transition cursor-pointer"
                    >
                      Schedule Direct Show
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Schedule Modal */}
      {schedulingMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-lg bg-[#140b20] border border-primary/30 rounded-2xl p-6 shadow-2xl text-white max-h-[90vh] overflow-y-auto no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-primary/20">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                Schedule Shows
              </h2>
              <button
                onClick={() => setSchedulingMovie(null)}
                disabled={submittingShow}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Movie Info */}
            <div className="flex items-center gap-3.5 mt-4 p-3 bg-primary/10 border border-primary/20 rounded-xl">
              {schedulingMovie.poster_path ? (
                <img
                  src={getPosterUrl(schedulingMovie.poster_path)}
                  alt={schedulingMovie.title}
                  className="w-12 h-16 object-cover rounded-lg shrink-0 shadow-md border border-primary/30"
                />
              ) : (
                <div className="w-12 h-16 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <FilmIcon className="w-5 h-5 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate text-white">
                  {schedulingMovie.title}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {schedulingMovie.media_type === "tv" ? "TV Series" : "Movie"} •{" "}
                  {schedulingMovie.release_date?.slice(0, 4) || "Unknown Year"}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitSchedule} className="mt-4 space-y-4">
              {/* Show Price */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1 flex items-center gap-1.5">
                  <DollarSignIcon className="w-3.5 h-3.5 text-primary" />
                  Show Price ({currency})
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={showPrice}
                  onChange={(e) => setShowPrice(e.target.value)}
                  placeholder="e.g. 15"
                  required
                  className="w-full bg-[#1e1330] border border-primary/30 rounded-xl px-3.5 py-2 text-white outline-none focus:border-primary text-sm"
                />
              </div>

              {/* Date & Time Picker */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1 flex items-center gap-1.5">
                  <ClockIcon className="w-3.5 h-3.5 text-primary" />
                  Show Date & Time
                </label>
                <div className="flex gap-2">
                  <input
                    type="datetime-local"
                    value={dateTimeInput}
                    onChange={(e) => setDateTimeInput(e.target.value)}
                    className="flex-1 bg-[#1e1330] border border-primary/30 rounded-xl px-3 py-2 text-white outline-none focus:border-primary text-sm [color-scheme:dark]"
                  />
                  <button
                    type="button"
                    onClick={handleDateTimeAdd}
                    className="px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/40 rounded-xl text-xs font-medium text-white transition cursor-pointer"
                  >
                    Add Time
                  </button>
                </div>
              </div>

              {/* Selected Date & Times list */}
              {Object.keys(dateTimeSelection).length > 0 && (
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl">
                  <p className="text-xs font-semibold text-gray-300 mb-2">
                    Selected Show Times:
                  </p>
                  <div className="space-y-2 max-h-36 overflow-y-auto no-scrollbar">
                    {Object.entries(dateTimeSelection).map(([date, times]) => (
                      <div key={date} className="text-xs">
                        <span className="font-medium text-primary">{date}:</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {times.map((time) => (
                            <span
                              key={time}
                              className="inline-flex items-center gap-1 bg-primary/20 border border-primary/30 px-2 py-0.5 rounded text-[11px]"
                            >
                              {time}
                              <button
                                type="button"
                                onClick={() => handleRemoveTime(date, time)}
                                className="text-red-400 hover:text-red-300 ml-1"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-primary/20 mt-4">
                <button
                  type="button"
                  onClick={() => setSchedulingMovie(null)}
                  disabled={submittingShow}
                  className="px-4 py-2 text-xs font-medium rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingShow}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-xl bg-primary hover:bg-primary/90 text-white transition cursor-pointer disabled:opacity-50 shadow-md shadow-primary/20"
                >
                  {submittingShow ? (
                    <>
                      <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Confirm & Add Shows"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default SearchMovies;

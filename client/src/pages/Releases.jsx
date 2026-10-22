import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import BlurCircle from "../components/BlurCircle";
import { useAppContext } from "../context/AppContext";
import {
  CalendarIcon,
  StarIcon,
  SearchIcon,
  XIcon,
  FilmIcon,
  SparklesIcon,
  TicketIcon,
  BookmarkIcon,
  CheckIcon,
  Loader2Icon,
  EyeIcon,
  BellIcon,
  Trash2Icon,
  ClockIcon,
} from "lucide-react";
import toast from "react-hot-toast";

const Releases = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { axios, shows } = useAppContext();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMovieForModal, setSelectedMovieForModal] = useState(null);

  // Active Tab: 'all' (All upcoming releases) or 'reminders' (My Watchlist & Reminders)
  const activeTab = searchParams.get("tab") === "reminders" ? "reminders" : "all";

  const handleTabChange = (tab) => {
    if (tab === "reminders") {
      setSearchParams({ tab: "reminders" });
    } else {
      setSearchParams({});
    }
  };

  // Reminders / Watchlist state stored in localStorage
  // Supports backwards compatibility with arrays of primitive IDs [123, 456] and full objects
  const [reminders, setReminders] = useState(() => {
    try {
      const saved = localStorage.getItem("reelix_movie_reminders");
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => {
          if (typeof item === "object" && item !== null) return item;
          return { id: item };
        });
      }
      return [];
    } catch {
      return [];
    }
  });

  const getPosterUrl = (path) => {
    if (!path) return "";
    return path.startsWith("http")
      ? path
      : `https://image.tmdb.org/t/p/w342${path}`;
  };

  const getBackdropUrl = (path) => {
    if (!path) return "";
    return path.startsWith("http")
      ? path
      : `https://image.tmdb.org/t/p/original${path}`;
  };

  const fetchUpcomingMovies = async (pageToFetch = 1, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const { data } = await axios.get(`/api/show/upcoming?page=${pageToFetch}`);

      if (data.success && data.movies) {
        if (append) {
          setMovies((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newOnes = data.movies.filter((m) => !existingIds.has(m.id));
            return [...prev, ...newOnes];
          });
        } else {
          setMovies(data.movies);
        }
        setPage(data.page || pageToFetch);
        setTotalPages(data.total_pages || 1);
      }
    } catch (error) {
      console.error("Fetch upcoming releases error:", error);
      toast.error("Failed to load upcoming releases from TMDB");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchUpcomingMovies(1, false);
  }, []);

  // Backfill metadata for any legacy reminders that only stored numeric IDs
  useEffect(() => {
    if (movies.length > 0 && reminders.some((r) => !r.title)) {
      setReminders((prev) => {
        let hasChanges = false;
        const enriched = prev.map((rem) => {
          if (rem.title) return rem;
          const match = movies.find((m) => String(m.id) === String(rem.id));
          if (match) {
            hasChanges = true;
            return {
              id: match.id,
              title: match.title,
              poster_path: match.poster_path,
              backdrop_path: match.backdrop_path,
              release_date: match.release_date,
              vote_average: match.vote_average,
              vote_count: match.vote_count,
              overview: match.overview,
              addedAt: rem.addedAt || new Date().toISOString(),
            };
          }
          return rem;
        });

        if (hasChanges) {
          try {
            localStorage.setItem("reelix_movie_reminders", JSON.stringify(enriched));
          } catch (err) {
            console.error(err);
          }
          return enriched;
        }
        return prev;
      });
    }
  }, [movies]);

  const handleLoadMore = () => {
    if (page < totalPages && !loadingMore) {
      fetchUpcomingMovies(page + 1, true);
    }
  };

  const isMovieReminded = (movieId) => {
    return reminders.some((r) => String(r.id) === String(movieId));
  };

  const toggleReminder = (movie) => {
    setReminders((prev) => {
      const exists = prev.some((item) => String(item.id) === String(movie.id));
      let updated;
      if (exists) {
        updated = prev.filter((item) => String(item.id) !== String(movie.id));
        toast(`Removed "${movie.title || "Movie"}" from your watchlist`);
      } else {
        const itemToSave = {
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path,
          release_date: movie.release_date,
          vote_average: movie.vote_average,
          vote_count: movie.vote_count,
          overview: movie.overview,
          addedAt: new Date().toISOString(),
        };
        updated = [itemToSave, ...prev];
        toast.success(`Reminder set for "${movie.title}"! Added to Watchlist.`);
      }
      try {
        localStorage.setItem("reelix_movie_reminders", JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save reminders to localStorage:", err);
      }
      return updated;
    });
  };

  const handleClearAllReminders = () => {
    if (window.confirm("Are you sure you want to clear all your release reminders?")) {
      setReminders([]);
      try {
        localStorage.removeItem("reelix_movie_reminders");
        toast.success("Watchlist reminders cleared");
      } catch (err) {
        console.error(err);
      }
    }
  };

  const formatReleaseDate = (dateStr) => {
    if (!dateStr) return "Coming Soon";
    try {
      const d = new Date(dateStr + "T00:00:00");
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Check if an upcoming movie already has active shows in our database
  const getExistingShowForMovie = (movieId) => {
    return (shows || []).find(
      (s) => String(s.movie?._id) === String(movieId) || String(s._id) === String(movieId)
    );
  };

  // Filter lists based on search query
  const filteredAllMovies = movies.filter((m) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      (m.title || "").toLowerCase().includes(query) ||
      (m.overview || "").toLowerCase().includes(query)
    );
  });

  const filteredReminders = reminders.filter((m) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      (m.title || "").toLowerCase().includes(query) ||
      (m.overview || "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="relative px-6 md:px-16 lg:px-40 xl:px-44 pt-32 md:pt-40 pb-24 min-h-screen">
      <BlurCircle top="120px" left="60px" />
      <BlurCircle bottom="100px" right="60px" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-primary/20">
        <div>
          {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-semibold mb-3">
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>Official TMDB Releases & Personal Watchlist</span>
          </div> */}
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Upcoming Movie Releases
          </h1>
          <p className="text-sm text-gray-400 mt-2 max-w-2xl leading-relaxed">
            Discover upcoming blockbuster films directly from TMDB, track release dates, and bookmark movies to receive reminders in your personal watchlist.
          </p>
        </div>

        {/* Live Filter Bar */}
        <div className="relative w-full md:w-72 shrink-0">
          <SearchIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === "reminders"
                ? "Search your reminders..."
                : "Search upcoming releases..."
            }
            className="w-full pl-10 pr-9 py-2.5 bg-[#150d24] border border-primary/30 rounded-xl text-white outline-none focus:border-primary text-sm shadow-inner transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <XIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleTabChange("all")}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition cursor-pointer flex items-center gap-2 ${
              activeTab === "all"
                ? "bg-primary text-white shadow-lg shadow-primary/30"
                : "bg-primary/10 hover:bg-primary/20 text-gray-300 border border-primary/20"
            }`}
          >
            <FilmIcon className="w-4 h-4" />
            <span>All Upcoming Releases</span>
            <span
              className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                activeTab === "all"
                  ? "bg-black/30 text-white"
                  : "bg-primary/20 text-primary-light"
              }`}
            >
              {movies.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("reminders")}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition cursor-pointer flex items-center gap-2 ${
              activeTab === "reminders"
                ? "bg-primary text-white shadow-lg shadow-primary/30"
                : "bg-primary/10 hover:bg-primary/20 text-gray-300 border border-primary/20"
            }`}
          >
            <BookmarkIcon className="w-4 h-4" />
            <span>My Watchlist & Reminders</span>
            <span
              className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                activeTab === "reminders"
                  ? "bg-black/30 text-white"
                  : "bg-primary/20 text-primary-light"
              }`}
            >
              {reminders.length}
            </span>
          </button>
        </div>

        {activeTab === "reminders" && reminders.length > 0 && (
          <button
            type="button"
            onClick={handleClearAllReminders}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-900/40 border border-red-500/20 transition cursor-pointer"
          >
            <Trash2Icon className="w-3.5 h-3.5" />
            Clear All Reminders
          </button>
        )}
      </div>

      {/* Main Content Area */}
      {activeTab === "all" ? (
        <>
          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center text-gray-400 gap-3">
              <Loader2Icon className="w-10 h-10 animate-spin text-primary" />
              <p className="text-sm">Fetching upcoming releases from TMDB...</p>
            </div>
          ) : filteredAllMovies.length === 0 ? (
            <div className="text-center py-24 bg-primary/5 border border-dashed border-primary/20 rounded-2xl mt-4">
              <FilmIcon className="w-12 h-12 text-primary/40 mx-auto mb-3" />
              <p className="text-lg font-semibold text-white">No releases found</p>
              <p className="text-sm text-gray-400 mt-1">
                No upcoming movies matched your search query.
              </p>
            </div>
          ) : (
            <>
              {/* Releases Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
                {filteredAllMovies.map((movie) => {
                  const isReminded = isMovieReminded(movie.id);
                  const existingShow = getExistingShowForMovie(movie.id);

                  return (
                    <div
                      key={movie.id}
                      className="rounded-2xl overflow-hidden flex flex-col justify-between bg-primary/10 border border-primary/20 hover:border-primary/50 transition-all duration-300 group hover:-translate-y-1 shadow-lg"
                    >
                      {/* Poster Thumbnail */}
                      <div className="relative aspect-2/3 w-full bg-black/40 overflow-hidden">
                        {movie.poster_path ? (
                          <img
                            src={getPosterUrl(movie.poster_path)}
                            alt={movie.title}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                            onClick={() => setSelectedMovieForModal(movie)}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 p-4 text-center">
                            <FilmIcon className="w-12 h-12 mb-2 opacity-50" />
                            <span className="text-xs">No Poster Available</span>
                          </div>
                        )}

                        {/* Release Date Pill */}
                        <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 text-xs font-semibold text-white border border-white/10 shadow-md">
                          <CalendarIcon className="w-3 h-3 text-primary shrink-0" />
                          <span>{formatReleaseDate(movie.release_date)}</span>
                        </div>

                        {/* Rating Badge */}
                        <div className="absolute top-2.5 right-2.5 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1 text-xs font-medium text-white border border-white/10 shadow-md">
                          <StarIcon className="w-3.5 h-3.5 text-primary fill-primary" />
                          <span>{movie.vote_average?.toFixed(1) || "0.0"}</span>
                        </div>

                        {/* Quick View Button on Hover */}
                        <button
                          type="button"
                          onClick={() => setSelectedMovieForModal(movie)}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs font-semibold text-white cursor-pointer"
                        >
                          <span className="px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 flex items-center gap-1.5">
                            <EyeIcon className="w-3.5 h-3.5 text-primary" />
                            Quick View
                          </span>
                        </button>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h3
                            className="font-bold text-base text-white truncate group-hover:text-primary transition"
                            title={movie.title}
                          >
                            {movie.title}
                          </h3>
                          <p className="text-xs text-primary font-medium mt-0.5">
                            In Theaters: {formatReleaseDate(movie.release_date)}
                          </p>

                          {movie.overview && (
                            <p className="text-xs text-gray-400 mt-2 line-clamp-3 leading-relaxed">
                              {movie.overview}
                            </p>
                          )}
                        </div>

                        {/* Action Footer */}
                        <div className="mt-4 pt-3 border-t border-primary/20 flex items-center justify-between gap-2">
                          {existingShow ? (
                            <button
                              type="button"
                              onClick={() => {
                                navigate(`/movies/${movie.id}`);
                                window.scrollTo(0, 0);
                              }}
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-md shadow-primary/20"
                            >
                              <TicketIcon className="w-3.5 h-3.5" />
                              Book Tickets
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedMovieForModal(movie)}
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-primary/20 hover:bg-primary/30 text-white border border-primary/30 rounded-xl text-xs font-medium transition cursor-pointer"
                            >
                              Details & Info
                            </button>
                          )}

                          {/* Reminder / Watchlist Toggle Button */}
                          <button
                            type="button"
                            onClick={() => toggleReminder(movie)}
                            className={`p-2 rounded-xl border transition cursor-pointer shrink-0 ${
                              isReminded
                                ? "bg-primary text-white border-primary shadow-sm shadow-primary/30"
                                : "bg-primary/10 border-primary/25 text-gray-300 hover:text-white hover:bg-primary/20"
                            }`}
                            title={
                              isReminded
                                ? "Reminder Active (Click to remove from Watchlist)"
                                : "Set Reminder (Save to Watchlist)"
                            }
                          >
                            {isReminded ? (
                              <CheckIcon className="w-4 h-4 text-white" strokeWidth={3} />
                            ) : (
                              <BookmarkIcon className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load More Button */}
              {page < totalPages && (
                <div className="mt-12 text-center">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-8 py-3 rounded-full bg-primary/20 hover:bg-primary/30 border border-primary/40 text-white font-medium text-sm transition cursor-pointer inline-flex items-center gap-2 shadow-lg shadow-primary/10 disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2Icon className="w-4 h-4 animate-spin text-primary" />
                        Loading next releases...
                      </>
                    ) : (
                      <>
                        <span>Load More Releases</span>
                        <span className="text-xs text-primary">
                          (Page {page} of {totalPages})
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        /* My Watchlist & Reminders Tab */
        <div>
          {reminders.length === 0 ? (
            <div className="text-center py-24 bg-primary/5 border border-dashed border-primary/25 rounded-3xl mt-4 px-6 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-4 text-primary">
                <BellIcon className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                No Reminders Set Yet
              </h2>
              <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto leading-relaxed">
                When you browse upcoming movies, click the bookmark icon (
                <BookmarkIcon className="w-3.5 h-3.5 inline text-primary mx-0.5" />
                ) on any movie to save it here. You'll have quick access to release dates and details!
              </p>
              <button
                type="button"
                onClick={() => handleTabChange("all")}
                className="mt-6 px-6 py-2.5 rounded-full bg-primary hover:bg-primary-dull text-white text-sm font-semibold transition cursor-pointer shadow-lg shadow-primary/20 inline-flex items-center gap-2"
              >
                <FilmIcon className="w-4 h-4" />
                Browse Upcoming Releases
              </button>
            </div>
          ) : filteredReminders.length === 0 ? (
            <div className="text-center py-20 bg-primary/5 border border-dashed border-primary/20 rounded-2xl mt-4">
              <SearchIcon className="w-10 h-10 text-primary/40 mx-auto mb-3" />
              <p className="text-lg font-semibold text-white">
                No matching reminders found
              </p>
              <p className="text-sm text-gray-400 mt-1">
                None of your saved reminders match "{searchQuery}".
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-gray-400">
                  Showing {filteredReminders.length} saved release reminder
                  {filteredReminders.length === 1 ? "" : "s"}:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredReminders.map((movie) => {
                  const existingShow = getExistingShowForMovie(movie.id);

                  return (
                    <div
                      key={movie.id}
                      className="rounded-2xl overflow-hidden flex flex-col justify-between bg-primary/10 border border-primary/25 hover:border-primary/50 transition-all duration-300 group hover:-translate-y-1 shadow-lg"
                    >
                      {/* Poster Thumbnail */}
                      <div className="relative aspect-2/3 w-full bg-black/40 overflow-hidden">
                        {movie.poster_path ? (
                          <img
                            src={getPosterUrl(movie.poster_path)}
                            alt={movie.title || "Movie poster"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                            onClick={() => setSelectedMovieForModal(movie)}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 p-4 text-center">
                            <FilmIcon className="w-12 h-12 mb-2 opacity-50" />
                            <span className="text-xs">No Poster Available</span>
                          </div>
                        )}

                        {/* Release Date Pill */}
                        <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 text-xs font-semibold text-white border border-white/10 shadow-md">
                          <CalendarIcon className="w-3 h-3 text-primary shrink-0" />
                          <span>{formatReleaseDate(movie.release_date)}</span>
                        </div>

                        {/* Rating Badge */}
                        <div className="absolute top-2.5 right-2.5 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1 text-xs font-medium text-white border border-white/10 shadow-md">
                          <StarIcon className="w-3.5 h-3.5 text-primary fill-primary" />
                          <span>{movie.vote_average?.toFixed(1) || "0.0"}</span>
                        </div>

                        {/* Quick View Button on Hover */}
                        <button
                          type="button"
                          onClick={() => setSelectedMovieForModal(movie)}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs font-semibold text-white cursor-pointer"
                        >
                          <span className="px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 flex items-center gap-1.5">
                            <EyeIcon className="w-3.5 h-3.5 text-primary" />
                            Quick View
                          </span>
                        </button>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3
                              className="font-bold text-base text-white truncate group-hover:text-primary transition flex-1"
                              title={movie.title}
                            >
                              {movie.title || `Movie #${movie.id}`}
                            </h3>
                          </div>
                          <p className="text-xs text-primary font-medium mt-0.5 flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            Release: {formatReleaseDate(movie.release_date)}
                          </p>

                          {movie.overview && (
                            <p className="text-xs text-gray-400 mt-2 line-clamp-3 leading-relaxed">
                              {movie.overview}
                            </p>
                          )}
                        </div>

                        {/* Action Footer */}
                        <div className="mt-4 pt-3 border-t border-primary/20 flex items-center justify-between gap-2">
                          {existingShow ? (
                            <button
                              type="button"
                              onClick={() => {
                                navigate(`/movies/${movie.id}`);
                                window.scrollTo(0, 0);
                              }}
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-md shadow-primary/20"
                            >
                              <TicketIcon className="w-3.5 h-3.5" />
                              Book Tickets
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedMovieForModal(movie)}
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-primary/20 hover:bg-primary/30 text-white border border-primary/30 rounded-xl text-xs font-medium transition cursor-pointer"
                            >
                              Details & Info
                            </button>
                          )}

                          {/* Remove Reminder Button */}
                          <button
                            type="button"
                            onClick={() => toggleReminder(movie)}
                            className="p-2 rounded-xl bg-red-950/30 hover:bg-red-900/40 border border-red-500/30 text-red-400 hover:text-red-300 transition cursor-pointer shrink-0"
                            title="Remove from your Watchlist"
                          >
                            <Trash2Icon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick View Modal */}
      {selectedMovieForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-2xl bg-[#140b20] border border-primary/30 rounded-2xl overflow-hidden shadow-2xl text-white max-h-[90vh] overflow-y-auto no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Backdrop Banner */}
            <div className="relative h-48 w-full bg-primary/20 overflow-hidden">
              {selectedMovieForModal.backdrop_path ? (
                <img
                  src={getBackdropUrl(selectedMovieForModal.backdrop_path)}
                  alt={selectedMovieForModal.title}
                  className="w-full h-full object-cover brightness-60"
                />
              ) : (
                <div className="w-full h-full bg-linear-to-r from-primary/30 to-purple-900/40" />
              )}
              <button
                type="button"
                onClick={() => setSelectedMovieForModal(null)}
                className="absolute top-3 right-3 text-white bg-black/60 hover:bg-black/90 p-1.5 rounded-full backdrop-blur-md transition cursor-pointer border border-white/20"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 relative">
              <div className="flex flex-col sm:flex-row gap-5 -mt-16 sm:-mt-20 mb-4 items-start">
                <img
                  src={getPosterUrl(selectedMovieForModal.poster_path)}
                  alt={selectedMovieForModal.title}
                  className="w-28 sm:w-36 aspect-2/3 object-cover rounded-xl border-2 border-primary/50 shadow-2xl shrink-0 bg-black/50"
                />
                <div className="min-w-0 sm:pt-14">
                  <h2 className="text-2xl font-bold text-white leading-tight">
                    {selectedMovieForModal.title}
                  </h2>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-300 flex-wrap">
                    <span className="flex items-center gap-1 text-primary font-medium">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {formatReleaseDate(selectedMovieForModal.release_date)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <StarIcon className="w-3.5 h-3.5 text-primary fill-primary" />
                      {selectedMovieForModal.vote_average?.toFixed(1) || "0.0"} (
                      {selectedMovieForModal.vote_count || 0} votes)
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              <div className="my-4 p-3 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <BellIcon className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-gray-200">
                    {isMovieReminded(selectedMovieForModal.id)
                      ? "Reminder is active: Saved in your personal Watchlist"
                      : "Set a reminder to save this release to your Watchlist"}
                  </span>
                </div>
                <span className="text-primary font-semibold hidden sm:inline">
                  {formatReleaseDate(selectedMovieForModal.release_date)}
                </span>
              </div>

              {/* Overview */}
              <div className="mt-4">
                <h4 className="text-xs uppercase font-semibold tracking-wider text-gray-400 mb-1.5">
                  Synopsis
                </h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {selectedMovieForModal.overview ||
                    "No synopsis available for this upcoming release yet."}
                </p>
              </div>

              {/* Modal Actions */}
              <div className="mt-6 pt-4 border-t border-primary/20 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => toggleReminder(selectedMovieForModal)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                    isMovieReminded(selectedMovieForModal.id)
                      ? "bg-primary text-white border border-primary"
                      : "bg-primary/20 hover:bg-primary/30 border border-primary/30 text-white"
                  }`}
                >
                  {isMovieReminded(selectedMovieForModal.id) ? (
                    <>
                      <CheckIcon className="w-3.5 h-3.5" />
                      <span>In Your Watchlist</span>
                    </>
                  ) : (
                    <>
                      <BookmarkIcon className="w-3.5 h-3.5" />
                      <span>Add to Watchlist</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMovieForModal(null)}
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Releases;

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactPlayer from "react-player";
import BlurCircle from "../components/BlurCircle";
import {
  Heart,
  PlayCircleIcon,
  StarIcon,
  CalendarIcon,
  SparklesIcon,
  ClockIcon,
  CameraIcon,
  EyeIcon,
  XIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
} from "lucide-react";
import timeFormat from "../lib/timeFormat";
import FavoriteCast from "../components/FavoriteCast";
import DateSelect from "../components/DateSelect";
import MovieCard from "../components/MovieCard";
import Loading from "../components/Loading";
import NotFound from "../components/NotFound";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const MovieDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerReady, setTrailerReady] = useState(false);

  const getPosterUrl = (path) => {
    if (!path) return "";
    return path.startsWith("http")
      ? path
      : `https://image.tmdb.org/t/p/w500${path}`;
  };

  const getBackdropUrl = (path) => {
    if (!path) return "";
    return path.startsWith("http")
      ? path
      : `https://image.tmdb.org/t/p/original${path}`;
  };

  const getGalleryThumbUrl = (path) => {
    if (!path) return "";
    return path.startsWith("http")
      ? path
      : `https://image.tmdb.org/t/p/w780${path}`;
  };

  const { shows, axios, getToken, user, fetchFavoriteMovies, favoriteMovies } =
    useAppContext();

  const getShow = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const { data } = await axios.get(`/api/show/${id}`);
      if (data && data.success) {
        setShow(data);
      } else {
        setIsError(true);
      }
    } catch (error) {
      console.error("Get show error:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavorite = async () => {
    try {
      if (!user) {
        return toast.error("Please login to proceed");
      }

      const { data } = await axios.post(
        "/api/user/update-favorite",
        { movieId: id },
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        },
      );

      if (data.success) {
        await fetchFavoriteMovies();
        toast.success(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleWatchTrailer = () => {
    if (!show?.movie) return;

    // Use the trailerUrl from the backend (fetched from TMDB videos API)
    const trailerUrl = show.movie.trailerUrl;
    if (trailerUrl) {
      setTrailerReady(false);
      setShowTrailer(true);
    } else {
      // Fallback: open YouTube search if no trailer URL is cached
      window.open(
        `https://www.youtube.com/results?search_query=${encodeURIComponent(
          show.movie.title + " official trailer"
        )}`,
        "_blank"
      );
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    setShowTrailer(false);
    getShow();
  }, [id]);

  // Lock body scroll when trailer overlay is open
  useEffect(() => {
    if (showTrailer) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showTrailer]);

  const projectImages =
    Array.isArray(show?.movie?.images) && show.movie.images.length > 0
      ? show.movie.images
      : [show?.movie?.backdrop_path, show?.movie?.poster_path].filter(Boolean);

  const handlePrevImage = (e) => {
    e?.stopPropagation();
    setSelectedImageIndex((prev) =>
      prev === 0 ? projectImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = (e) => {
    e?.stopPropagation();
    setSelectedImageIndex((prev) =>
      prev === projectImages.length - 1 ? 0 : prev + 1
    );
  };

  // Keyboard navigation for image overlay and trailer overlay
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (showTrailer) setShowTrailer(false);
        else if (selectedImageIndex !== null) setSelectedImageIndex(null);
      }
      if (selectedImageIndex !== null && !showTrailer) {
        if (e.key === "ArrowLeft") handlePrevImage();
        if (e.key === "ArrowRight") handleNextImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex, projectImages.length, showTrailer]);

  // "You may also like" — exclude the current movie
  const recommendedShows = (shows || []).filter(
    (s) => s.movie && String(s.movie._id) !== String(id)
  );

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !show || !show.movie) {
    return <NotFound />;
  }

  return (
    <div className="relative px-6 md:px-16 lg:px-40 pt-24 md:pt-32 pb-24">
      {/* 1. Backdrop Banner */}
      <div className="relative w-full h-64 sm:h-80 md:h-[420px] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-primary/20 bg-primary/10">
        {show.movie.backdrop_path ? (
          <img
            src={getBackdropUrl(show.movie.backdrop_path)}
            alt={show.movie.title}
            className="w-full h-full object-cover brightness-65 transition-transform duration-700 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/30 via-purple-950/40 to-black/80" />
        )}

        {/* Cinematic gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-transparent to-black/30" />

        {/* Badges on Top of Banner */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 flex-wrap z-10">
          <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-primary text-xs font-semibold flex items-center gap-1.5 shadow-md">
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>{show.movie.original_language?.toUpperCase() || "ENGLISH"}</span>
          </span>

          {show.movie.release_date && (
            <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md">
              <CalendarIcon className="w-3.5 h-3.5 text-primary" />
              <span>{show.movie.release_date.split("-")[0]}</span>
            </span>
          )}
        </div>

        {show.movie.vote_average ? (
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 px-3.5 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md z-10">
            <StarIcon className="w-4 h-4 text-primary fill-primary" />
            <span>{show.movie.vote_average.toFixed(1)} User Rating</span>
          </div>
        ) : null}

        {/* Tagline on Banner */}
        {show.movie.tagline && (
          <div className="absolute bottom-6 left-6 right-6 hidden md:block z-10">
            <p className="text-base italic text-gray-200 font-light drop-shadow-lg">
              "{show.movie.tagline}"
            </p>
          </div>
        )}
      </div>

      {/* 2. Movie Main Details: Overlapping Poster & Metadata */}
      <div className="relative flex flex-col md:flex-row gap-8 max-w-6xl mx-auto -mt-20 sm:-mt-28 md:-mt-36 z-20 px-4 md:px-0 mb-12">
        {/* Floating Poster */}
        <div className="relative shrink-0 max-md:mx-auto">
          <img
            src={getPosterUrl(show.movie.poster_path)}
            alt={show.movie.title}
            className="rounded-2xl h-88 sm:h-104 w-60 sm:w-72 object-cover border-2 border-primary/50 shadow-2xl bg-black/60"
          />
        </div>

        {/* Movie Info */}
        <div className="relative flex flex-col justify-end gap-3 flex-1">
          <BlurCircle top="-60px" left="-60px" />
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-primary font-bold">
              {show.movie.original_language?.toUpperCase() || "ENGLISH"}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-balance tracking-tight drop-shadow-md">
            {show.movie.title}
          </h1>

          <div className="flex items-center gap-3 text-gray-300 text-sm flex-wrap">
            <div className="flex items-center gap-1.5">
              <StarIcon className="w-4 h-4 text-primary fill-primary" />
              <span className="font-semibold text-white">
                {show.movie.vote_average ? show.movie.vote_average.toFixed(1) : "0.0"}
              </span>
              <span className="text-gray-400 text-xs">/ 10</span>
            </div>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ClockIcon className="w-3.5 h-3.5 text-primary" />
              {timeFormat(show.movie.runtime)}
            </span>
            <span>•</span>
            <span>
              {show.movie.genres ? show.movie.genres.map((g) => g.name).join(", ") : ""}
            </span>
          </div>

          <p className="text-gray-300 text-sm leading-relaxed max-w-2xl mt-1">
            {show.movie.overview}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-4 mt-4">
            <button
              type="button"
              onClick={handleWatchTrailer}
              className="flex items-center gap-2 px-6 py-3 text-sm bg-gray-800/90 hover:bg-gray-700/90 border border-white/10 text-white transition rounded-xl font-medium cursor-pointer active:scale-95 shadow-md"
            >
              <PlayCircleIcon className="w-5 h-5 text-primary" />
              Watch Trailer
            </button>

            <a
              href="#dateSelect"
              className="px-8 py-3 text-sm bg-primary hover:bg-primary-dull text-white transition rounded-xl font-semibold cursor-pointer active:scale-95 shadow-lg shadow-primary/25"
            >
              Buy Ticket
            </a>

            <button
              type="button"
              onClick={handleFavorite}
              className="bg-gray-800/90 border border-white/10 p-3 rounded-xl transition cursor-pointer active:scale-95 hover:bg-gray-700 shadow-md"
              title="Add to Favorites"
            >
              <Heart
                className={`w-5 h-5 ${
                  favoriteMovies.find((movie) => movie._id === id)
                    ? "fill-primary text-primary"
                    : "text-gray-300"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Cast Section */}
      <FavoriteCast show={show} />

      {/* 4. Production Stills & Project Gallery Section */}
      {projectImages.length > 0 && (
        <div className="mt-12 md:mt-20">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-primary/20">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/15 border border-primary/30 text-primary">
                <CameraIcon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
                  Production Stills & Project Gallery
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Click any photo to open and inspect in full resolution
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold">
              {projectImages.length} {projectImages.length === 1 ? "Photo" : "Photos"}
            </span>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {projectImages.map((imgPath, index) => (
              <div
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className="group relative aspect-video rounded-xl overflow-hidden bg-black/40 border border-primary/20 hover:border-primary/60 transition-all duration-300 cursor-pointer shadow-md hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
              >
                <img
                  src={getGalleryThumbUrl(imgPath)}
                  alt={`${show.movie.title} still ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {/* Overlay hover prompt */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs text-white font-medium">
                  <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/20 flex items-center gap-1.5 shadow-lg">
                    <EyeIcon className="w-3.5 h-3.5 text-primary" />
                    Open Image
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Date & Showtime Selection */}
      <div id="dateSelect" className="mt-8 md:mt-12">
        <DateSelect dateTime={show.dateTime} id={id} />
      </div>

      {/* 6. You may also like Section — excludes the current movie */}
      {recommendedShows.length > 0 && (
        <>
          <p className="text-lg font-medium mt-20 mb-8">You may also like</p>

          <div className="flex flex-wrap max-sm:justify-center gap-8">
            {recommendedShows.slice(0, 5).map((s, index) => (
              <MovieCard key={s.movie._id || index} movie={s.movie} />
            ))}
          </div>

          <div className="flex justify-center mt-20">
            <button
              type="button"
              onClick={() => {
                navigate("/movies");
                window.scrollTo(0, 0);
              }}
              className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-xl font-medium cursor-pointer shadow-lg shadow-primary/20"
            >
              Show more
            </button>
          </div>
        </>
      )}

      {/* 7. Full-Screen Image Lightbox Overlay Modal */}
      {selectedImageIndex !== null && projectImages[selectedImageIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImageIndex(null)}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setSelectedImageIndex(null)}
            className="absolute top-5 right-5 z-20 p-2.5 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 transition cursor-pointer shadow-lg hover:scale-105"
            title="Close (Esc)"
          >
            <XIcon className="w-5 h-5" />
          </button>

          {/* Previous Button */}
          {projectImages.length > 1 && (
            <button
              type="button"
              onClick={handlePrevImage}
              className="absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/75 hover:bg-black text-white border border-white/20 transition cursor-pointer hover:scale-110 shadow-xl"
              title="Previous photo (Left arrow)"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
          )}

          {/* Image Container */}
          <div
            className="relative max-w-5xl max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getBackdropUrl(projectImages[selectedImageIndex])}
              alt={`${show.movie.title} photo ${selectedImageIndex + 1}`}
              className="max-h-[75vh] max-w-[92vw] sm:max-w-[85vw] object-contain rounded-2xl shadow-2xl border border-white/10"
            />

            {/* Caption & Counter */}
            <div className="mt-4 flex items-center justify-between w-full px-2 text-xs text-gray-300">
              <span className="font-semibold text-white truncate max-w-md">
                {show.movie.title} — Production Still
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
                Photo {selectedImageIndex + 1} of {projectImages.length}
              </span>
            </div>
          </div>

          {/* Next Button */}
          {projectImages.length > 1 && (
            <button
              type="button"
              onClick={handleNextImage}
              className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/75 hover:bg-black text-white border border-white/20 transition cursor-pointer hover:scale-110 shadow-xl"
              title="Next photo (Right arrow)"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          )}
        </div>
      )}

      {/* 8. Trailer Player Overlay (ReactPlayer in full-screen overlay) */}
      {showTrailer && show.movie.trailerUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-lg p-4 animate-in fade-in duration-200"
          onClick={() => setShowTrailer(false)}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setShowTrailer(false)}
            className="absolute top-5 right-5 z-30 p-2.5 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 transition cursor-pointer shadow-lg hover:scale-105"
            title="Close Trailer (Esc)"
          >
            <XIcon className="w-5 h-5" />
          </button>

          {/* Player Container */}
          <div
            className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden border border-primary/30 shadow-2xl bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Loading spinner until player is ready */}
            {!trailerReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-black/80">
                <Loader2Icon className="w-10 h-10 animate-spin text-primary" />
                <p className="text-sm text-gray-400">Loading trailer...</p>
              </div>
            )}

            <ReactPlayer
              url={show.movie.trailerUrl}
              playing={true}
              controls={true}
              width="100%"
              height="100%"
              onReady={() => setTrailerReady(true)}
              onError={() => {
                toast.error("Failed to load trailer. Opening in YouTube.");
                setShowTrailer(false);
                window.open(show.movie.trailerUrl, "_blank");
              }}
              config={{
                youtube: {
                  playerVars: {
                    autoplay: 1,
                    modestbranding: 1,
                    rel: 0,
                  },
                },
              }}
            />
          </div>

          {/* Movie Title Caption */}
          <div className="absolute bottom-6 left-0 right-0 text-center z-20">
            <p className="text-sm text-gray-300 font-medium">
              <span className="text-primary font-bold">{show.movie.title}</span> — Official Trailer
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetails;

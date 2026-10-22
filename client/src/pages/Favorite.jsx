import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import BlurCircle from "../components/BlurCircle";
import { useAppContext } from "../context/AppContext";
import { HeartIcon, BookmarkIcon, FilmIcon, ArrowRightIcon } from "lucide-react";

const Favorite = () => {
  const { favoriteMovies } = useAppContext();
  const navigate = useNavigate();

  const [reminderCount, setReminderCount] = useState(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("reelix_movie_reminders");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setReminderCount(parsed.length);
        }
      }
    } catch {
      setReminderCount(0);
    }
  }, []);

  return (
    <div className="relative px-6 md:px-16 lg:px-40 xl:px-44 pt-32 md:pt-40 pb-28 min-h-screen">
      <BlurCircle top="120px" left="60px" />
      <BlurCircle bottom="100px" right="60px" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-primary/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-semibold mb-3">
            <HeartIcon className="w-3.5 h-3.5 fill-primary" />
            <span>Saved Movies</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Your Favorite Movies
          </h1>
          <p className="text-sm text-gray-400 mt-2 max-w-xl">
            Films you have liked and saved to your favorites.
          </p>
        </div>

        {/* Link to Upcoming Watchlist Reminders */}
        {reminderCount > 0 && (
          <Link
            to="/releases?tab=reminders"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/15 hover:bg-primary/25 border border-primary/30 text-white text-xs font-medium transition cursor-pointer shrink-0"
          >
            <BookmarkIcon className="w-4 h-4 text-primary" />
            <span>Upcoming Watchlist ({reminderCount})</span>
            <ArrowRightIcon className="w-3.5 h-3.5 text-gray-400" />
          </Link>
        )}
      </div>

      {favoriteMovies && favoriteMovies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
          {favoriteMovies.map((movie) => (
            <MovieCard movie={movie} key={movie._id} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-primary/5 border border-dashed border-primary/20 rounded-3xl mt-8 max-w-lg mx-auto px-6">
          <FilmIcon className="w-14 h-14 text-primary/40 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">No Favorite Movies Yet</h2>
          <p className="text-sm text-gray-400 mt-2 leading-relaxed">
            You haven't added any currently playing movies to your favorites. Explore our movie collection or check out your upcoming release reminders.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button
              type="button"
              onClick={() => {
                navigate("/movies");
                window.scrollTo(0, 0);
              }}
              className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary-dull text-white text-xs font-semibold transition cursor-pointer shadow-lg shadow-primary/20"
            >
              Explore Movies
            </button>
            {reminderCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  navigate("/releases?tab=reminders");
                  window.scrollTo(0, 0);
                }}
                className="px-5 py-2.5 rounded-full bg-primary/20 hover:bg-primary/30 border border-primary/30 text-white text-xs font-semibold transition cursor-pointer"
              >
                View Upcoming Reminders ({reminderCount})
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Favorite;

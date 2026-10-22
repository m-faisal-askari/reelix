import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import { CheckIcon, DeleteIcon, StarIcon, PlusIcon } from "lucide-react";
import { kConverter } from "../../lib/kConverter.js";
import { useAppContext } from "../../context/AppContext.jsx";
import toast from "react-hot-toast";

const AddShows = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { axios, getToken, fetchShows } = useAppContext();

  const currency = import.meta.env.VITE_CURRENCY || "$";
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedMovieData, setSelectedMovieData] = useState(null);
  const [dateTimeSelection, setDateTimeSelection] = useState({});
  const [dateTimeInput, setDateTimeInput] = useState("");
  const [showPrice, setShowPrice] = useState("");

  const getCustomMovies = () => {
    try {
      return JSON.parse(localStorage.getItem("reelix_custom_movies") || "[]");
    } catch {
      return [];
    }
  };

  const fetchNowPlayingMovies = async () => {
    try {
      const { data } = await axios.get("/api/show/now-playing", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        const savedCustom = getCustomMovies();
        const incoming = location.state?.selectedMovieData;

        // Combine saved custom movies with incoming if any
        let customCombined = savedCustom;
        if (incoming) {
          customCombined = [
            incoming,
            ...savedCustom.filter((m) => String(m.id) !== String(incoming.id)),
          ];
        }

        const tmdbMovies = data.movies || [];
        const customIds = new Set(customCombined.map((m) => String(m.id)));
        const uniqueTmdb = tmdbMovies.filter((m) => !customIds.has(String(m.id)));

        const merged = [...customCombined, ...uniqueTmdb];
        setNowPlayingMovies(merged);

        if (incoming) {
          setSelectedMovie(incoming.id);
          setSelectedMovieData(incoming);
        }
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    fetchNowPlayingMovies();
  }, []);

  // Handle incoming movie from TMDB Search page
  useEffect(() => {
    if (location.state?.selectedMovieData) {
      const customMovie = location.state.selectedMovieData;
      setNowPlayingMovies((prev) => {
        const exists = prev.some((m) => String(m.id) === String(customMovie.id));
        if (!exists) {
          return [customMovie, ...prev];
        }
        return prev;
      });
      setSelectedMovie(customMovie.id);
      setSelectedMovieData(customMovie);
    }
  }, [location.state]);

  const handleMovieSelect = (movie) => {
    setSelectedMovie(movie.id);
    setSelectedMovieData(movie);
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

  const handleAddShow = async () => {
    try {
      if (!selectedMovie) {
        return toast.error("Please select a movie first");
      }
      if (!showPrice || Number(showPrice) <= 0) {
        return toast.error("Please enter a valid show price");
      }

      // Automatically include any selected date/time in the input if user forgot to click "Add Time"
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

      const { data } = await axios.post(
        "/api/show/add",
        {
          movieId: selectedMovie,
          showsInput,
          showPrice: Number(showPrice),
          mediaType: selectedMovieData?.media_type || "movie",
        },
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        }
      );

      if (data.success) {
        toast.success(data.message || "Shows added successfully!");
        setSelectedMovie(null);
        setSelectedMovieData(null);
        setDateTimeSelection({});
        setShowPrice("");
        setDateTimeInput("");
        if (fetchShows) fetchShows();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error.message);
      toast.error(error.message);
    }
  };

  const getPosterUrl = (path) => {
    if (!path) return "";
    return path.startsWith("http") ? path : `https://image.tmdb.org/t/p/w500${path}`;
  };

  const currentSelectedMovie =
    selectedMovieData ||
    nowPlayingMovies.find((m) => String(m.id) === String(selectedMovie));

  return nowPlayingMovies.length > 0 ? (
    <>
      <Title text1={"Add"} text2={"Shows"} />
      <div className="flex items-center justify-between mt-10">
        <div>
          <p className="text-lg font-medium">Now Playing Movies</p>
          <p className="text-xs text-gray-400">
            Select a movie from below or add any movie/series from TMDB search.
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/search-movies")}
          className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer font-medium"
        >
          Can&apos;t find your movie? Search TMDB &rarr;
        </button>
      </div>

      <div className="overflow-x-auto pb-4 no-scrollbar mt-3">
        <div className="group flex flex-wrap gap-4 mt-2 w-max items-start">
          {nowPlayingMovies.map((movie) => {
            const isSelected = String(selectedMovie) === String(movie.id);

            return (
              <div
                key={movie.id}
                className={`relative max-w-40 cursor-pointer hover:-translate-y-1 transition duration-300 ${
                  isSelected
                    ? "ring-4 ring-primary rounded-lg border-2 border-primary shadow-xl scale-102 opacity-100"
                    : "group-hover:not-hover:opacity-40"
                }`}
                onClick={() => handleMovieSelect(movie)}
              >
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={getPosterUrl(movie.poster_path)}
                    alt={movie.title || movie.name}
                    className="w-full object-cover brightness-90 aspect-[2/3]"
                  />
                  <div className="text-sm flex items-center justify-between p-2 bg-black/70 w-full absolute bottom-0 left-0">
                    <p className="flex items-center gap-1 text-gray-400">
                      <StarIcon className="w-4 h-4 text-primary fill-primary" />
                      {movie.vote_average ? movie.vote_average.toFixed(1) : "0.0"}
                    </p>
                    <p className="text-gray-300">
                      {movie.vote_count ? kConverter(movie.vote_count) : 0} Votes
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg">
                    <CheckIcon className="w-3.5 h-3.5" strokeWidth={3} />
                    <span>SELECTED</span>
                  </div>
                )}

                <p className="font-medium truncate mt-1 text-white">
                  {movie.title || movie.name}
                </p>
                <p className="text-gray-400 text-sm">
                  {movie.release_date || movie.first_air_date || ""}
                </p>
              </div>
            );
          })}

          {/* TMDB Search Button (Same size as card with plus icon in center) */}
          <div
            onClick={() => navigate("/admin/search-movies")}
            className="relative w-40 h-[288px] flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/20 hover:border-primary cursor-pointer hover:-translate-y-1 transition duration-300 p-4 text-center group/btn shrink-0"
            title="Search & add other movies or series from TMDB"
          >
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 group-hover/btn:scale-110 group-hover/btn:bg-primary/30 transition duration-300 shadow-lg shadow-primary/10">
              <PlusIcon className="w-7 h-7 text-primary" />
            </div>
            <p className="font-medium text-sm text-white mt-4">Search TMDB</p>
            <p className="text-xs text-gray-400 mt-1 leading-snug">
              Add movies or series not in now playing
            </p>
          </div>
        </div>
      </div>

      {/* Selected Movie Confirmation Banner */}
      {currentSelectedMovie ? (
        <div className="mt-6 p-4 bg-primary/15 border-2 border-primary/50 rounded-xl flex items-center justify-between gap-4 max-w-2xl shadow-lg animate-in fade-in">
          <div className="flex items-center gap-3.5 min-w-0">
            {currentSelectedMovie.poster_path ? (
              <img
                src={getPosterUrl(currentSelectedMovie.poster_path)}
                alt={currentSelectedMovie.title || currentSelectedMovie.name}
                className="w-12 h-16 object-cover rounded-lg border border-primary/40 shrink-0 shadow-md"
              />
            ) : (
              <div className="w-12 h-16 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 border border-primary/40">
                <StarIcon className="w-5 h-5 text-primary" />
              </div>
            )}
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-primary px-2 py-0.5 rounded-full mb-1">
                <CheckIcon className="w-3 h-3" /> Selected Movie
              </span>
              <h3 className="font-semibold text-base text-white truncate">
                {currentSelectedMovie.title || currentSelectedMovie.name}
              </h3>
              <p className="text-xs text-gray-300 mt-0.5">
                Ready to schedule show date, time, and ticket price below.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedMovie(null);
              setSelectedMovieData(null);
            }}
            className="text-xs text-gray-400 hover:text-white underline shrink-0 cursor-pointer"
          >
            Deselect
          </button>
        </div>
      ) : (
        <div className="mt-6 p-3.5 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-300 text-xs max-w-2xl flex items-center gap-2">
          <span>ℹ️</span>
          <span>
            Please click and select a movie above (or search TMDB) to schedule show timings.
          </span>
        </div>
      )}

      {/* Show Price Input */}
      <div className="mt-8">
        <label className="block text-sm font-medium mb-2">Show Price</label>
        <div className="inline-flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-md bg-[#150d24]">
          <p className="text-gray-400 text-sm">{currency}</p>
          <input
            type="number"
            min={0}
            value={showPrice}
            onChange={(e) => setShowPrice(e.target.value)}
            placeholder="Enter show price"
            className="outline-none text-white bg-transparent"
          />
        </div>
      </div>

      {/* Date Time Selection */}
      <div className="mt-6">
        <label htmlFor="" className="block text-sm font-medium mb-2">
          Select Date and Time
        </label>
        <div className="inline-flex gap-5 border border-gray-600 p-1 pl-3 rounded-lg bg-[#150d24]">
          <input
            type="datetime-local"
            value={dateTimeInput}
            onChange={(e) => setDateTimeInput(e.target.value)}
            className="outline-none rounded-md text-white bg-transparent [color-scheme:dark]"
          />
          <button
            onClick={handleDateTimeAdd}
            className="bg-primary/80 text-white px-3 py-2 text-sm rounded-lg hover:bg-primary cursor-pointer transition"
          >
            Add Time
          </button>
        </div>
      </div>

      {/* Show Selected Shows */}
      {Object.keys(dateTimeSelection).length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 font-medium">Selected Date-Time</h2>
          <ul className="space-y-3">
            {Object.entries(dateTimeSelection).map(([date, times]) => (
              <li key={date}>
                <div className="font-medium text-sm text-primary">{date}</div>
                <div className="flex flex-wrap gap-2 mt-1 text-sm">
                  {times.map((time) => (
                    <div
                      key={time}
                      className="border border-primary/40 bg-primary/10 px-2.5 py-1 flex items-center rounded-lg"
                    >
                      <span className="text-xs">{time}</span>
                      <DeleteIcon
                        onClick={() => handleRemoveTime(date, time)}
                        width={15}
                        className="ml-2 text-primary hover:text-red-400 cursor-pointer transition"
                      />
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleAddShow}
        className="bg-primary text-white px-8 py-2.5 mt-6 rounded-xl hover:bg-primary/90 transition-all cursor-pointer font-medium shadow-lg shadow-primary/20"
      >
        Add Show
      </button>
    </>
  ) : (
    <Loading />
  );
};

export default AddShows;

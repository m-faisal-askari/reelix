import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { dummyDateTimeData, dummyShowsData } from "../assets/assets";
import BlurCircle from "../components/BlurCircle";
import { Heart, PlayCircleIcon, StarIcon } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(true); // Track loading state
  const [isError, setIsError] = useState(false); // Track error/404 state

  const getPosterUrl = (path) => {
    if (!path) return "";
    return path.startsWith("http")
      ? path
      : `https://image.tmdb.org/t/p/w500${path}`;
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
        // If API returns 200 but success is false (wrong ID)
        setIsError(true);
      }
    } catch (error) {
      console.log(error);
      setIsError(true); // Catches network errors, 404s, 500s from Axios
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
      console.log(error);
    }
  };

  useEffect(() => {
    getShow();
  }, [id]);

  // 1. Render Loading State first
  if (isLoading) {
    return <Loading />;
  }

  // 2. Render 404 Not Found state if error occurs or show metadata is missing
  if (isError || !show || !show.movie) {
    return <NotFound />;
  }

  // 3. Main Success Render (Safe from undefined object crashes)
  return (
    <div className="px-6 md:px-16 lg:px-40 pt-25 md:pt-35">
      <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
        <img
          src={getPosterUrl(show.movie.poster_path)}
          alt=""
          className="max-md:mx-auto rounded-xl h-104 max-w-70 object-cover"
        />

        <div className="relative flex flex-col gap-3">
          <BlurCircle top="-100px" left="-100px" />
          <p className="text-primary">ENGLISH</p>
          <h1 className="text-4xl font-semibold max-w-96 text-balance">
            {show.movie.title}
          </h1>
          <div className="flex items-center gap-2 text-gray-300">
            <StarIcon className="w-5 h-5 text-primary fill-primary" />
            {show.movie.vote_average
              ? show.movie.vote_average.toFixed(1)
              : "0.0"}{" "}
            User Ratings
          </div>
          <p className="text-gray-400 mt-2 text-sm leading-tight max-w-xl">
            {show.movie.overview}
          </p>
          <p>
            {timeFormat(show.movie.runtime)} ●{" "}
            {show.movie.genres
              ? show.movie.genres.map((genre) => genre.name).join(", ")
              : ""}{" "}
            ●{" "}
            {show.movie.release_date
              ? show.movie.release_date.split("-")[0]
              : ""}
          </p>

          <div className="flex items-center flex-wrap gap-4 mt-4">
            <button className="flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium cursor-pointer active:scale-95">
              <PlayCircleIcon className="w-5 h-5" />
              Watch Trailer
            </button>
            <a
              href="#dateSelect"
              className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md cursor-pointer active:scale-95"
            >
              Buy Ticket
            </a>
            <button
              onClick={handleFavorite}
              className="bg-gray-700 p-2.5 rounded-full transition cursor-pointer active:scale-95 hover:bg-gray-900"
            >
              <Heart
                className={`w-5 h-5 ${favoriteMovies.find((movie) => movie._id === id) ? "fill-primary text-primary" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>
      <FavoriteCast show={show} />

      <DateSelect dateTime={show.dateTime} id={id} />

      <p className="text-lg font-medium mt-20 mb-8">You may also like</p>

      <div className="flex flex-wrap max-sm:justify-center gap-8">
        {shows.slice(0, 5).map((show, index) => (
          <MovieCard key={index} movie={show.movie} />
        ))}
      </div>
      <div className="flex justify-center mt-20">
        <button
          onClick={() => {
            navigate("/movies");
            scrollTo(0, 0);
          }}
          className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer"
        >
          Show more
        </button>
      </div>
    </div>
  );
};

export default MovieDetails;

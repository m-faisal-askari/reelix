import axios from "axios";

// API to get now playing movies from TMDB API
import TMDB_BASE_URL from "../lib/tmdbUrl.js";
import Movie from "../models/Movie.js";
import { tmdbHeaders } from "../lib/tmdbHeaders.js";
import Show from "../models/Show.js";

export const getNowPlayingMovies = async (req, res) => {
  try {
    const { data } = await axios.get(
      `${TMDB_BASE_URL}/movie/now_playing`,
      tmdbHeaders,
    );

    const movies = data.results;

    res.json({ success: true, movies: movies });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// In-memory cache for upcoming TMDB releases (10 minute TTL)
const upcomingCache = new Map();
const UPCOMING_CACHE_TTL = 10 * 60 * 1000;

// API to get upcoming releases from TMDB API
export const getUpcomingMovies = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const cacheKey = String(page);
    const cached = upcomingCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < UPCOMING_CACHE_TTL) {
      return res.json(cached.data);
    }

    const { data } = await axios.get(
      `${TMDB_BASE_URL}/movie/upcoming?language=en-US&page=${page}`,
      tmdbHeaders,
    );

    const responsePayload = {
      success: true,
      movies: data.results || [],
      page: data.page,
      total_pages: data.total_pages,
      total_results: data.total_results,
    };

    upcomingCache.set(cacheKey, {
      timestamp: Date.now(),
      data: responsePayload,
    });

    res.json(responsePayload);
  } catch (error) {
    console.error("getUpcomingMovies error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

// API to search movies and TV series from TMDB API
export const searchTmdbMovies = async (req, res) => {
  try {
    const { query, type = "multi", page = 1 } = req.query;

    if (!query || query.trim() === "") {
      return res.json({ success: true, results: [], total_pages: 0, total_results: 0 });
    }

    let endpoint = `${TMDB_BASE_URL}/search/multi`;
    if (type === "movie") endpoint = `${TMDB_BASE_URL}/search/movie`;
    if (type === "tv") endpoint = `${TMDB_BASE_URL}/search/tv`;

    const { data } = await axios.get(
      `${endpoint}?query=${encodeURIComponent(query)}&page=${page}&include_adult=false&language=en-US`,
      tmdbHeaders
    );

    // Filter out results that are not movie or tv (e.g. 'person')
    const results = (data.results || [])
      .filter((item) => (type !== "multi" ? true : item.media_type === "movie" || item.media_type === "tv"))
      .map((item) => ({
        id: item.id,
        title: item.title || item.name,
        overview: item.overview || "",
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        release_date: item.release_date || item.first_air_date || "",
        vote_average: item.vote_average || 0,
        media_type: item.media_type || (type === "tv" ? "tv" : "movie"),
      }));

    res.json({
      success: true,
      results,
      page: data.page,
      total_pages: data.total_pages,
      total_results: data.total_results,
    });
  } catch (error) {
    console.error("Search TMDB Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

// API to add a new show to the database (supports movies and tv shows)
export const addShow = async (req, res) => {
  try {
    const { movieId, showsInput, showPrice, mediaType } = req.body;

    let movie = await Movie.findById(movieId);

    if (!movie) {
      let movieApiData;
      let movieCreditsData = { cast: [] };

      if (mediaType === "tv") {
        const [tvDetailsResponse, tvCreditsResponse] = await Promise.all([
          axios.get(`${TMDB_BASE_URL}/tv/${movieId}`, tmdbHeaders),
          axios.get(`${TMDB_BASE_URL}/tv/${movieId}/credits`, tmdbHeaders),
        ]);
        movieApiData = tvDetailsResponse.data;
        movieCreditsData = tvCreditsResponse.data;
        movieApiData.title = movieApiData.name;
        movieApiData.release_date = movieApiData.first_air_date || "";
        movieApiData.runtime = (movieApiData.episode_run_time && movieApiData.episode_run_time[0]) || 60;
      } else {
        try {
          const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
            axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, tmdbHeaders),
            axios.get(`${TMDB_BASE_URL}/movie/${movieId}/credits`, tmdbHeaders),
          ]);
          movieApiData = movieDetailsResponse.data;
          movieCreditsData = movieCreditsResponse.data;
        } catch (err) {
          // Fallback to TV show endpoint if movie endpoint fails
          const [tvDetailsResponse, tvCreditsResponse] = await Promise.all([
            axios.get(`${TMDB_BASE_URL}/tv/${movieId}`, tmdbHeaders),
            axios.get(`${TMDB_BASE_URL}/tv/${movieId}/credits`, tmdbHeaders),
          ]);
          movieApiData = tvDetailsResponse.data;
          movieCreditsData = tvCreditsResponse.data;
          movieApiData.title = movieApiData.name;
          movieApiData.release_date = movieApiData.first_air_date || "";
          movieApiData.runtime = (movieApiData.episode_run_time && movieApiData.episode_run_time[0]) || 60;
        }
      }

      const movieDetails = {
        _id: String(movieId),
        title: movieApiData.title || movieApiData.name || "Untitled",
        overview: movieApiData.overview || "No overview available.",
        poster_path: movieApiData.poster_path || "",
        backdrop_path: movieApiData.backdrop_path || "",
        genres: movieApiData.genres || [],
        casts: movieCreditsData.cast || [],
        release_date: movieApiData.release_date || movieApiData.first_air_date || "2025-01-01",
        original_language: movieApiData.original_language || "en",
        tagline: movieApiData.tagline || "",
        vote_average: movieApiData.vote_average || 0,
        runtime: movieApiData.runtime || 120,
      };

      // Add movie to the database
      movie = await Movie.create(movieDetails);
    }

    const showsToCreate = [];

    showsInput.forEach((show) => {
      const showDate = show.date;
      const timeArray = Array.isArray(show.time) ? show.time : [show.time];

      timeArray.forEach((time) => {
        const dateTimeString = `${showDate}T${time}`;
        showsToCreate.push({
          movie: movieId,
          showDateTime: new Date(dateTimeString),
          showPrice,
          occupiedSeats: {},
        });
      });
    });

    if (showsToCreate.length > 0) {
      await Show.insertMany(showsToCreate);
    }

    res.json({ success: true, message: "Show added successfully.", movie });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all shows from database grouped by movie
export const getShows = async (req, res) => {
  try {
    const shows = await Show.find()
      .select("-occupiedSeats")
      .populate({
        path: "movie",
        select:
          "title poster_path backdrop_path genres vote_average runtime release_date tagline",
      })
      .sort({ showDateTime: 1 })
      .lean();

    const movieMap = new Map();

    shows.forEach((show) => {
      if (!show.movie) return;

      const movieId = show.movie._id.toString();

      if (!movieMap.has(movieId)) {
        // Initialize the movie card structure with an empty timings array
        movieMap.set(movieId, {
          _id: show._id, // Base show ID
          movie: show.movie,
          showPrice: show.showPrice,
          timings: [show.showDateTime], // Start collecting timings here
        });
      } else {
        // If the movie entry already exists, just push the next timing into it
        movieMap.get(movieId).timings.push(show.showDateTime);
      }
    });

    // Return the grouped show objects containing the timings array
    res.json({ success: true, shows: Array.from(movieMap.values()) });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// API to get a single show from the database
export const getShow = async (req, res) => {
  try {
    const { movieId } = req.params;

    // get all shows for the movie sorted by date
    const shows = await Show.find({
      movie: movieId,
    }).sort({ showDateTime: 1 });

    let movie = await Movie.findById(movieId);

    if (movie) {
      // Ensure backdrop_path, images, and trailerUrl are available
      let updatedFields = {};
      let images = Array.isArray(movie.images) && movie.images.length > 0 ? movie.images : [];
      let backdrop_path = movie.backdrop_path || "";

      if (!backdrop_path || images.length === 0) {
        try {
          // Fetch backdrop & gallery images from TMDB
          let tmdbImagesRes;
          try {
            tmdbImagesRes = await axios.get(
              `${TMDB_BASE_URL}/movie/${movieId}/images`,
              tmdbHeaders
            );
          } catch {
            tmdbImagesRes = await axios.get(
              `${TMDB_BASE_URL}/tv/${movieId}/images`,
              tmdbHeaders
            );
          }

          if (tmdbImagesRes?.data?.backdrops?.length > 0) {
            images = tmdbImagesRes.data.backdrops.slice(0, 12).map((b) => b.file_path);
          } else if (tmdbImagesRes?.data?.posters?.length > 0) {
            images = tmdbImagesRes.data.posters.slice(0, 12).map((p) => p.file_path);
          }

          if (!backdrop_path) {
            if (images.length > 0) {
              backdrop_path = images[0];
            } else {
              try {
                const tmdbDetail = await axios.get(
                  `${TMDB_BASE_URL}/movie/${movieId}`,
                  tmdbHeaders
                );
                backdrop_path = tmdbDetail.data.backdrop_path || "";
              } catch {
                const tmdbTv = await axios.get(
                  `${TMDB_BASE_URL}/tv/${movieId}`,
                  tmdbHeaders
                );
                backdrop_path = tmdbTv.data.backdrop_path || "";
              }
            }
          }

          if (images.length > 0) updatedFields.images = images;
          if (backdrop_path) updatedFields.backdrop_path = backdrop_path;
        } catch (tmdbErr) {
          console.warn("Could not enrich TMDB images:", tmdbErr.message);
        }
      }

      // Fetch trailer video from TMDB (runs independently of images)
      let trailerUrl = movie.trailerUrl || "";
      if (!trailerUrl) {
        try {
          let tmdbVideosRes;
          try {
            tmdbVideosRes = await axios.get(
              `${TMDB_BASE_URL}/movie/${movieId}/videos`,
              tmdbHeaders
            );
          } catch {
            tmdbVideosRes = await axios.get(
              `${TMDB_BASE_URL}/tv/${movieId}/videos`,
              tmdbHeaders
            );
          }

          const videos = tmdbVideosRes?.data?.results || [];
          const trailer =
            videos.find(
              (v) =>
                v.site === "YouTube" &&
                (v.type === "Trailer" || v.type === "Teaser")
            ) ||
            videos.find((v) => v.site === "YouTube") ||
            videos[0];

          if (trailer?.key) {
            trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
            updatedFields.trailerUrl = trailerUrl;
          }
        } catch (vidErr) {
          console.warn("Could not fetch TMDB trailer:", vidErr.message);
        }
      }

      if (Object.keys(updatedFields).length > 0) {
        await Movie.findByIdAndUpdate(movieId, updatedFields);
        movie = await Movie.findById(movieId);
      }
    }

    const dateTime = {};

    shows.forEach((show) => {
      const year = show.showDateTime.getFullYear();
      const month = String(show.showDateTime.getMonth() + 1).padStart(2, "0");
      const day = String(show.showDateTime.getDate()).padStart(2, "0");
      const date = `${year}-${month}-${day}`;

      if (!dateTime[date]) {
        dateTime[date] = [];
      }

      dateTime[date].push({
        time: show.showDateTime,
        showId: show._id,
        showPrice: show.showPrice,
      });
    });

    res.json({ success: true, movie, dateTime });
  } catch (error) {
    console.error(error.message);

    res.json({ success: false, message: error.message });
  }
};

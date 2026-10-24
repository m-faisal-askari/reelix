import { useContext, useState, createContext, useEffect } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { initialTheaters } from "../assets/theatersData";
import { assets, dummyTrailers } from "../assets/assets";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

export const AppContext = createContext();

export const initialHeroData = {
  title: "Avengers:\nDoomsday",
  image: "/Avengers-Doomsday-All-Teasers-Our-Theories-Marvel-MCU.jpg",
  logo: assets.marvelLogo,
  overview:
    "Heroes from three different worlds must unite when they're thrust together to confront a catastrophic danger that could destroy everything they know.",
  runtime: "2h 34m",
  releaseYear: "2026",
  genres: "Action | Adventure | Sci-Fi",
  buttonText: "Explore Movies",
  buttonLink: "/movies",
};

export const initialTrailersData = [
  {
    id: "tr-1",
    title: "Dune: Part Two - Official Trailer",
    image:
      "https://i.ytimg.com/vi/irVNGjRFZGk/hq720.jpg?sqp=-oaymwEnCNAFEJQDSFryq4qpAxkIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB&rs=AOn4CLB1aPXPzjLlTO87N8hQSXEwpmt0-g",
    videoUrl: "https://youtu.be/irVNGjRFZGk?si=NxcI4lAqlgT98oX2",
    category: "Action / Sci-Fi",
  },
  {
    id: "tr-2",
    title: "Deadpool & Wolverine - Teaser Trailer",
    image:
      "https://i.ytimg.com/vi/NdvqHc56lE0/hq720.jpg?sqp=-oaymwEnCNAFEJQDSFryq4qpAxkIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB&rs=AOn4CLBEME-MLB05pg8lqmj_uBFUn1QYog",
    videoUrl: "https://youtu.be/NdvqHc56lE0?si=62Cn5KpBu3eeMzJt",
    category: "Action / Comedy",
  },
  {
    id: "tr-3",
    title: "Gladiator II - Official Trailer",
    image:
      "https://i.ytimg.com/vi/3fjmjX0QOIg/hq720.jpg?sqp=-oaymwEnCNAFEJQDSFryq4qpAxkIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB&rs=AOn4CLCGRn-2Tkl8IeiuYwcGH1IglGx_hQ",
    videoUrl: "https://youtu.be/3fjmjX0QOIg?si=lh1ip6W1UwbIa62S",
    category: "Action / Drama",
  },
  {
    id: "tr-4",
    title: "Kingdom of the Planet of the Apes",
    image:
      "https://i.ytimg.com/vi/zhApeaHMvfs/hq720.jpg?sqp=-oaymwEnCNAFEJQDSFryq4qpAxkIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB&rs=AOn4CLAE_fAGW9UAWtnH-AOPHDG5pXBVOA",
    videoUrl: "https://youtu.be/zhApeaHMvfs?si=PhPjmb8CMK0AeIWw",
    category: "Sci-Fi / Adventure",
  },
];

export const AppProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [shows, setShows] = useState([]);
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [theaters, setTheaters] = useState(() => {
    try {
      const saved = localStorage.getItem("reelix_theaters");
      return saved ? JSON.parse(saved) : initialTheaters;
    } catch {
      return initialTheaters;
    }
  });

  const [trailers, setTrailers] = useState(() => {
    try {
      const saved = localStorage.getItem("reelix_trailers");
      return saved ? JSON.parse(saved) : initialTrailersData;
    } catch {
      return initialTrailersData;
    }
  });

  const addTheater = (theater) => {
    setTheaters((prev) => {
      const updated = [theater, ...prev];
      try {
        localStorage.setItem("reelix_theaters", JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save theaters to localStorage:", err);
      }
      return updated;
    });
  };

  const removeTheater = (id) => {
    setTheaters((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      try {
        localStorage.setItem("reelix_theaters", JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save theaters to localStorage:", err);
      }
      return updated;
    });
  };

  const addTrailer = (trailer) => {
    setTrailers((prev) => {
      const updated = [trailer, ...prev];
      try {
        localStorage.setItem("reelix_trailers", JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save trailers to localStorage:", err);
      }
      return updated;
    });
  };

  const updateTrailer = (id, updatedData) => {
    setTrailers((prev) => {
      const updated = prev.map((t) =>
        t.id === id ? { ...t, ...updatedData } : t
      );
      try {
        localStorage.setItem("reelix_trailers", JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save trailers to localStorage:", err);
      }
      return updated;
    });
  };

  const removeTrailer = (id) => {
    setTrailers((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      try {
        localStorage.setItem("reelix_trailers", JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save trailers to localStorage:", err);
      }
      return updated;
    });
  };

  const resetTrailers = () => {
    setTrailers(initialTrailersData);
    try {
      localStorage.setItem("reelix_trailers", JSON.stringify(initialTrailersData));
    } catch (err) {
      console.error("Failed to reset trailers:", err);
    }
  };

  // Hero Section State
  const [heroData, setHeroData] = useState(() => {
    try {
      const saved = localStorage.getItem("reelix_hero_data");
      return saved ? { ...initialHeroData, ...JSON.parse(saved) } : initialHeroData;
    } catch {
      return initialHeroData;
    }
  });

  const fetchHeroData = async () => {
    try {
      const { data } = await axios.get("/api/show/hero");
      if (data.success && data.hero) {
        const merged = {
          ...initialHeroData,
          ...data.hero,
          logo: data.hero.logo || initialHeroData.logo,
        };
        setHeroData(merged);
        try {
          localStorage.setItem("reelix_hero_data", JSON.stringify(merged));
        } catch (err) {
          console.error(err);
        }
      }
    } catch (error) {
      console.warn("Could not fetch hero data from server, using local data:", error.message);
    }
  };

  const updateHeroData = async (updatedFields) => {
    const updated = { ...heroData, ...updatedFields };
    setHeroData(updated);
    try {
      localStorage.setItem("reelix_hero_data", JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to save hero data to localStorage:", err);
    }

    try {
      const token = await getToken();
      if (token) {
        await axios.put("/api/admin/hero", updated, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      console.warn("Could not persist hero data to backend:", err.message);
    }
    return updated;
  };

  const resetHeroData = async () => {
    setHeroData(initialHeroData);
    try {
      localStorage.setItem("reelix_hero_data", JSON.stringify(initialHeroData));
    } catch (err) {
      console.error(err);
    }

    try {
      const token = await getToken();
      if (token) {
        await axios.post(
          "/api/admin/hero/reset",
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
    } catch (err) {
      console.warn("Could not reset hero on server:", err.message);
    }
  };

  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const fetchIsAdmin = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/admin/is-admin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsAdmin(data.isAdmin);

      if (!data.isAdmin && location.pathname.startsWith("/admin")) {
        navigate("/");
        toast.error("You are not authorized to access admin dashboard");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchShows = async () => {
    try {
      // /api/show/all is a public endpoint - fetch immediately without waiting for auth token
      const { data } = await axios.get("/api/show/all");
      if (data.success) {
        setShows(data.shows);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchFavoriteMovies = async () => {
    try {
      const { data } = await axios.get("/api/user/favorites", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        setFavoriteMovies(data.movies);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchShows();
    fetchHeroData();
  }, []);

  useEffect(() => {
    if (user) {
      fetchIsAdmin();
      fetchFavoriteMovies();
    }
  }, [user]);

  const value = {
    axios,
    fetchIsAdmin,
    user,
    isLoaded,
    getToken,
    navigate,
    isAdmin,
    shows,
    fetchShows,
    favoriteMovies,
    fetchFavoriteMovies,
    theaters,
    addTheater,
    removeTheater,
    trailers,
    addTrailer,
    updateTrailer,
    removeTrailer,
    resetTrailers,
    heroData,
    fetchHeroData,
    updateHeroData,
    resetHeroData,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);

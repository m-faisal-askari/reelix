import { useContext, useState, createContext, useEffect } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { initialTheaters } from "../assets/theatersData";
import { dummyTrailers } from "../assets/assets";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

export const AppContext = createContext();

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

  const { user } = useUser();
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
      const { data } = await axios.get("/api/show/all", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
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
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);

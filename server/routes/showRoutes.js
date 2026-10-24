import express from "express";
import {
  addShow,
  getNowPlayingMovies,
  getShow,
  getShows,
  getUpcomingMovies,
  searchTmdbMovies,
} from "../controllers/showController.js";
import { getHero } from "../controllers/adminController.js";
import { protectAdmin } from "../middleware/auth.js";

const showRouter = express.Router();

showRouter.get("/hero", getHero);
showRouter.get("/now-playing", protectAdmin, getNowPlayingMovies);
showRouter.get("/upcoming", getUpcomingMovies);
showRouter.get("/search", protectAdmin, searchTmdbMovies);
showRouter.post("/add", protectAdmin, addShow);
showRouter.get("/all", getShows);
showRouter.get("/:movieId", getShow);

export default showRouter;

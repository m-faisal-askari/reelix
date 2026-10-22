import express from "express";
import { protectAdmin } from "../middleware/auth.js";
import {
  getAllBookings,
  getAllShows,
  getDashboardData,
  isAdmin,
  updateShow,
  deleteShow,
} from "../controllers/adminController.js";
import {
  updateAdminBooking,
  deleteAdminBooking,
} from "../controllers/bookingController.js";

const adminRouter = express.Router();

adminRouter.get("/is-admin", protectAdmin, isAdmin);
adminRouter.get("/dashboard", protectAdmin, getDashboardData);
adminRouter.get("/all-shows", protectAdmin, getAllShows);
adminRouter.get("/all-bookings", protectAdmin, getAllBookings);
adminRouter.put("/show/:id", protectAdmin, updateShow);
adminRouter.delete("/show/:id", protectAdmin, deleteShow);

// Admin Booking Management
adminRouter.put("/booking/:id", protectAdmin, updateAdminBooking);
adminRouter.delete("/booking/:id", protectAdmin, deleteAdminBooking);

export default adminRouter;

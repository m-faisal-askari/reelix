import express from "express";
import {
  createBooking,
  getOccupiedSeats,
  getBookingDetails,
  updateUserBooking,
  cancelUserBooking,
} from "../controllers/bookingController.js";

const bookingRouter = express.Router();

bookingRouter.post("/create", createBooking);
bookingRouter.get("/seats/:showId", getOccupiedSeats);
bookingRouter.get("/details/:id", getBookingDetails);
bookingRouter.put("/:id", updateUserBooking);
bookingRouter.delete("/:id", cancelUserBooking);

export default bookingRouter;

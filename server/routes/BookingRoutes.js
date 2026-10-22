import express from "express";
import {
  createBooking,
  verifyStripePayment,
  getOccupiedSeats,
  getBookingDetails,
  updateUserBooking,
  cancelUserBooking,
} from "../controllers/bookingController.js";

const bookingRouter = express.Router();

bookingRouter.post("/create", createBooking);
bookingRouter.post("/verify-stripe", verifyStripePayment);
bookingRouter.get("/seats/:showId", getOccupiedSeats);
bookingRouter.get("/details/:id", getBookingDetails);
bookingRouter.put("/:id", updateUserBooking);
bookingRouter.delete("/:id", cancelUserBooking);

export default bookingRouter;

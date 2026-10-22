import "dotenv/config";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import Movie from "../models/Movie.js";
import User from "../models/User.js";
import { clerkClient } from "@clerk/express";
import stripe from "stripe";

const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

// Function to check availability of selected seats for movie
const checkSeatsAvailability = async (showId, selectedSeats) => {
  try {
    if (!showId) return false;
    const showData = await Show.findById(showId);
    if (!showData) return false;

    const occupiedSeats = showData.occupiedSeats || {};

    const isAnySeatTaken = selectedSeats.some((seat) => occupiedSeats[seat]);
    return !isAnySeatTaken;
  } catch (error) {
    console.error("checkSeatsAvailability error:", error.message);
    return false;
  }
};

export const createBooking = async (req, res) => {
  try {
    const authData = typeof req.auth === "function" ? req.auth() : req.auth;
    const userId = authData?.userId;
    const { showId, selectedSeats } = req.body;

    if (!userId) {
      return res.json({ success: false, message: "User not authenticated" });
    }

    if (!showId) {
      return res.json({ success: false, message: "Show ID is required" });
    }

    if (!selectedSeats || !Array.isArray(selectedSeats) || selectedSeats.length === 0) {
      return res.json({ success: false, message: "Please select at least one seat" });
    }

    // Check if the seat is available for the selected show
    const isAvailable = await checkSeatsAvailability(showId, selectedSeats);

    if (!isAvailable) {
      return res.json({
        success: false,
        message: "One or more selected seats are already taken",
      });
    }

    // Get show details
    const showData = await Show.findById(showId).populate("movie");
    if (!showData) {
      return res.json({ success: false, message: "Show not found" });
    }

    // Ensure User document exists in database for proper population
    let userDoc = await User.findById(userId);
    if (!userDoc) {
      try {
        const clerkUser = await clerkClient.users.getUser(userId);
        const name =
          `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
          clerkUser.username ||
          "Reelix User";
        const email =
          clerkUser.emailAddresses?.[0]?.emailAddress || "user@reelix.com";
        const image = clerkUser.imageUrl || "";
        userDoc = await User.create({ _id: userId, name, email, image });
      } catch (err) {
        userDoc = await User.create({
          _id: userId,
          name: "Reelix User",
          email: "user@reelix.com",
          image: "",
        });
      }
    }

    // Create new booking with isPaid: false
    const booking = await Booking.create({
      user: userId,
      show: showId,
      amount: (showData.showPrice || 0) * selectedSeats.length,
      bookedSeats: selectedSeats,
      isPaid: false,
    });

    if (!showData.occupiedSeats) {
      showData.occupiedSeats = {};
    }

    selectedSeats.forEach((seat) => {
      showData.occupiedSeats[seat] = userId;
    });

    showData.markModified("occupiedSeats");
    await showData.save();

    // Stripe checkout session integration
    const origin = req.headers.origin || "http://localhost:5173";

    const line_items = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: showData.movie?.title || "Movie Ticket",
          },
          unit_amount: Math.max(50, Math.round(booking.amount * 100)),
        },
        quantity: 1,
      },
    ];

    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ["card"],
      success_url: `${origin}/loading/my-bookings?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/my-bookings`,
      line_items: line_items,
      mode: "payment",
      metadata: {
        bookingId: booking._id.toString(),
      },
      expires_at: Math.floor(Date.now() / 1000 + 30 * 60),
    });

    booking.paymentLink = session.url;
    await booking.save();

    res.json({
      success: true,
      url: session.url,
      bookingId: booking._id,
      message: "Checkout session created successfully!",
    });
  } catch (error) {
    console.error("createBooking error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

export const getOccupiedSeats = async (req, res) => {
  try {
    const { showId } = req.params;

    if (!showId) {
      return res.json({ success: false, message: "Show ID is required", occupiedSeats: [] });
    }

    const showData = await Show.findById(showId);
    if (!showData) {
      return res.json({ success: false, message: "Show not found", occupiedSeats: [] });
    }

    const occupiedSeats = Object.keys(showData.occupiedSeats || {});

    res.json({ success: true, occupiedSeats });
  } catch (error) {
    console.error("getOccupiedSeats error:", error.message);
    res.json({ success: false, message: error.message, occupiedSeats: [] });
  }
};

// Core helper for updating a booking (used by user and admin)
export const performBookingUpdate = async ({
  bookingId,
  userId, // null if admin
  newShowId,
  newSeats,
  isPaid,
}) => {
  const booking = await Booking.findById(bookingId).populate({
    path: "show",
    populate: { path: "movie" },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  // If userId is provided (user request), verify ownership
  if (userId && String(booking.user) !== String(userId)) {
    throw new Error("Not authorized to modify this booking");
  }

  if (!newSeats || !Array.isArray(newSeats) || newSeats.length === 0) {
    throw new Error("Please select at least one seat");
  }

  if (newSeats.length > 10) {
    throw new Error("You can select up to 10 seats");
  }

  const oldShow = booking.show;
  const targetShowId = newShowId || (oldShow ? oldShow._id.toString() : null);

  if (!targetShowId) {
    throw new Error("Target show timing not found");
  }

  const newShow = await Show.findById(targetShowId).populate("movie");
  if (!newShow) {
    throw new Error("Selected show timing not found");
  }

  // Case 1: Changing to a different show timing
  if (oldShow && oldShow._id.toString() !== targetShowId) {
    // 1. Check if all newSeats are available in newShow
    const newOccupied = newShow.occupiedSeats || {};
    const conflictSeats = newSeats.filter((seat) => newOccupied[seat]);
    if (conflictSeats.length > 0) {
      throw new Error(
        `Seats ${conflictSeats.join(", ")} are already taken for this show time`
      );
    }

    // 2. Release old seats in oldShow
    const oldOccupied = oldShow.occupiedSeats || {};
    (booking.bookedSeats || []).forEach((seat) => {
      delete oldOccupied[seat];
    });
    oldShow.occupiedSeats = oldOccupied;
    oldShow.markModified("occupiedSeats");
    await oldShow.save();

    // 3. Occupy new seats in newShow
    newSeats.forEach((seat) => {
      newOccupied[seat] = booking.user;
    });
    newShow.occupiedSeats = newOccupied;
    newShow.markModified("occupiedSeats");
    await newShow.save();

    // 4. Update booking
    booking.show = newShow._id;
    booking.bookedSeats = newSeats;
    booking.amount = (newShow.showPrice || 0) * newSeats.length;
  } else {
    // Case 2: Same show, changing seats (add more seats, remove seats, change seats)
    const currentOccupied = newShow.occupiedSeats || {};
    const oldSeats = booking.bookedSeats || [];

    const seatsToAdd = newSeats.filter((s) => !oldSeats.includes(s));
    const seatsToRelease = oldSeats.filter((s) => !newSeats.includes(s));

    // Check availability of newly added seats
    const conflicts = seatsToAdd.filter(
      (s) => currentOccupied[s] && String(currentOccupied[s]) !== String(booking.user)
    );
    if (conflicts.length > 0) {
      throw new Error(`Seats ${conflicts.join(", ")} are already taken`);
    }

    // Release removed seats
    seatsToRelease.forEach((s) => {
      delete currentOccupied[s];
    });

    // Occupy newly added seats
    seatsToAdd.forEach((s) => {
      currentOccupied[s] = booking.user;
    });

    newShow.occupiedSeats = currentOccupied;
    newShow.markModified("occupiedSeats");
    await newShow.save();

    // Update booking
    booking.bookedSeats = newSeats;
    booking.amount = (newShow.showPrice || 0) * newSeats.length;
  }

  if (isPaid !== undefined) {
    booking.isPaid = Boolean(isPaid);
  }

  await booking.save();
  return booking;
};

// Core helper for canceling a booking
export const performBookingCancel = async ({ bookingId, userId }) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new Error("Booking not found");
  }

  // If userId is provided, verify ownership
  if (userId && String(booking.user) !== String(userId)) {
    throw new Error("Not authorized to cancel this booking");
  }

  // Release occupied seats in the show
  if (booking.show) {
    const show = await Show.findById(booking.show);
    if (show && show.occupiedSeats) {
      (booking.bookedSeats || []).forEach((seat) => {
        delete show.occupiedSeats[seat];
      });
      show.markModified("occupiedSeats");
      await show.save();
    }
  }

  await Booking.findByIdAndDelete(bookingId);
  return true;
};

// API: Verify Stripe payment status and confirm booking
export const verifyStripePayment = async (req, res) => {
  try {
    const { sessionId, bookingId } = req.body;

    if (!sessionId && !bookingId) {
      return res.json({
        success: false,
        message: "Session ID or Booking ID is required",
      });
    }

    if (sessionId) {
      const session = await stripeInstance.checkout.sessions.retrieve(sessionId);
      if (!session) {
        return res.json({ success: false, message: "Stripe session not found" });
      }

      const targetBookingId = session.metadata?.bookingId || bookingId;

      if (session.payment_status === "paid") {
        let booking = null;
        if (targetBookingId) {
          booking = await Booking.findById(targetBookingId);
          if (booking) {
            booking.isPaid = true;
            await booking.save();
          }
        }
        return res.json({
          success: true,
          message: "Payment confirmed successfully!",
          booking,
        });
      } else {
        return res.json({
          success: false,
          message: `Payment status: ${session.payment_status}`,
        });
      }
    }

    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (booking && booking.isPaid) {
        return res.json({
          success: true,
          message: "Booking is already confirmed",
          booking,
        });
      }
    }

    return res.json({ success: false, message: "Payment verification failed" });
  } catch (error) {
    console.error("verifyStripePayment error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

// API: Get booking details and available shows for editing
export const getBookingDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate("user")
      .populate({
        path: "show",
        populate: { path: "movie" },
      });

    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }

    const movieId = booking.show?.movie?._id;
    let availableShows = [];
    if (movieId) {
      availableShows = await Show.find({ movie: movieId }).sort({
        showDateTime: 1,
      });
    }

    res.json({
      success: true,
      booking,
      availableShows,
    });
  } catch (error) {
    console.error("getBookingDetails error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

// API: User updates their own booking
export const updateUserBooking = async (req, res) => {
  try {
    const authData = typeof req.auth === "function" ? req.auth() : req.auth;
    const userId = authData?.userId;
    const { id } = req.params;
    const { showId, selectedSeats } = req.body;

    if (!userId) {
      return res.json({ success: false, message: "User not authenticated" });
    }

    const updatedBooking = await performBookingUpdate({
      bookingId: id,
      userId,
      newShowId: showId,
      newSeats: selectedSeats,
    });

    res.json({
      success: true,
      message: "Booking updated successfully!",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("updateUserBooking error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

// API: User cancels their own booking
export const cancelUserBooking = async (req, res) => {
  try {
    const authData = typeof req.auth === "function" ? req.auth() : req.auth;
    const userId = authData?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.json({ success: false, message: "User not authenticated" });
    }

    await performBookingCancel({
      bookingId: id,
      userId,
    });

    res.json({
      success: true,
      message: "Booking canceled successfully and seats released.",
    });
  } catch (error) {
    console.error("cancelUserBooking error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

// API: Admin updates any booking
export const updateAdminBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { showId, selectedSeats, isPaid } = req.body;

    const updatedBooking = await performBookingUpdate({
      bookingId: id,
      userId: null, // Admin bypasses ownership check
      newShowId: showId,
      newSeats: selectedSeats,
      isPaid,
    });

    res.json({
      success: true,
      message: "Booking updated successfully!",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("updateAdminBooking error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

// API: Admin deletes/cancels any booking
export const deleteAdminBooking = async (req, res) => {
  try {
    const { id } = req.params;

    await performBookingCancel({
      bookingId: id,
      userId: null, // Admin bypasses ownership check
    });

    res.json({
      success: true,
      message: "Booking deleted successfully and seats released.",
    });
  } catch (error) {
    console.error("deleteAdminBooking error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

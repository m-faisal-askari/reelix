import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import User from "../models/User.js";
import Movie from "../models/Movie.js";

// API to check if user is admin
export const isAdmin = async (req, res) => {
  res.json({ success: true, isAdmin: true });
};

// API to get dashboard data
export const getDashboardData = async (req, res) => {
  try {
    const bookings = await Booking.find({ isPaid: true });
    const shows = await Show.find()
      .populate("movie")
      .sort({ showDateTime: 1 });

    const movieMap = new Map();

    shows.forEach((show) => {
      if (!show.movie) return;

      const movieId = show.movie._id.toString();

      if (!movieMap.has(movieId)) {
        movieMap.set(movieId, {
          _id: show._id,
          movie: show.movie,
          showPrice: show.showPrice,
          timings: [show.showDateTime],
          shows: [
            {
              _id: show._id,
              showDateTime: show.showDateTime,
              showPrice: show.showPrice,
              occupiedSeats: show.occupiedSeats || {},
            },
          ],
        });
      } else {
        movieMap.get(movieId).timings.push(show.showDateTime);
        movieMap.get(movieId).shows.push({
          _id: show._id,
          showDateTime: show.showDateTime,
          showPrice: show.showPrice,
          occupiedSeats: show.occupiedSeats || {},
        });
      }
    });

    const activeShows = Array.from(movieMap.values());
    const totalUser = await User.countDocuments();

    const dashboardData = {
      totalBookings: bookings.length,
      totalRevenue: bookings.reduce((acc, booking) => acc + booking.amount, 0),
      activeShows,
      totalUser,
      totalUsers: totalUser,
    };

    return res.json({ success: true, dashboardData });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// API to get all shows
export const getAllShows = async (req, res) => {
  try {
    const shows = await Show.find()
      .populate("movie")
      .sort({ showDateTime: -1 });

    res.json({ success: true, shows });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// API to get all bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate("user")
      .populate({
        path: "show",
        populate: { path: "movie" },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// API to update a show
export const updateShow = async (req, res) => {
  try {
    const { id } = req.params;
    const { showPrice, showDateTime } = req.body;

    const updateData = {};
    if (showPrice !== undefined && showPrice !== "") {
      updateData.showPrice = Number(showPrice);
    }
    if (showDateTime) {
      updateData.showDateTime = new Date(showDateTime);
    }

    const updatedShow = await Show.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("movie");

    if (!updatedShow) {
      return res.json({ success: false, message: "Show not found" });
    }

    res.json({
      success: true,
      message: "Show updated successfully",
      show: updatedShow,
    });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// API to delete a show
export const deleteShow = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedShow = await Show.findByIdAndDelete(id);

    if (!deletedShow) {
      return res.json({ success: false, message: "Show not found" });
    }

    // Delete associated unpaid bookings
    await Booking.deleteMany({ show: id, isPaid: false });

    res.json({ success: true, message: "Show deleted successfully" });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

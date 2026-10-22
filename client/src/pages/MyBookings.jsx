import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClerk } from "@clerk/react";
import Loading from "../components/Loading";
import BlurCircle from "../components/BlurCircle";
import BookingsCard from "../components/BookingsCard";
import EditBookingModal from "../components/EditBookingModal";
import { useAppContext } from "../context/AppContext";
import { TicketIcon, FilmIcon, LogInIcon } from "lucide-react";
import toast from "react-hot-toast";

const MyBookings = () => {
  const navigate = useNavigate();
  const { openSignIn } = useClerk();
  const { axios, getToken, user, isLoaded } = useAppContext();

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingBooking, setEditingBooking] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const getMyBookings = async () => {
    try {
      const token = await getToken();
      if (!token) {
        setBookings([]);
        setIsLoading(false);
        return;
      }

      const { data } = await axios.get("/api/user/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success && Array.isArray(data.bookings)) {
        setBookings(data.bookings);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error("Get user bookings error:", error);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // If Clerk has finished loading authentication state
    if (isLoaded !== false) {
      if (user) {
        getMyBookings();
      } else {
        // Guest user (not logged in) - do not show spinner
        setBookings([]);
        setIsLoading(false);
      }
    }

    // Safety timeout: ensure loader never spins infinitely
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, [isLoaded, user]);

  const handleEdit = (booking) => {
    setEditingBooking(booking);
    setIsEditModalOpen(true);
  };

  const handleCancel = async (booking) => {
    const movieTitle = booking.show?.movie?.title || "this movie";
    const seats = Array.isArray(booking.bookedSeats)
      ? booking.bookedSeats.join(", ")
      : "";

    if (
      !window.confirm(
        `Are you sure you want to cancel your booking for "${movieTitle}" (Seats: ${seats})? Your seats will be released.`
      )
    ) {
      return;
    }

    try {
      const token = await getToken();
      const { data } = await axios.delete(`/api/booking/${booking._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        toast.success(data.message || "Booking canceled successfully");
        getMyBookings();
      } else {
        toast.error(data.message || "Failed to cancel booking");
      }
    } catch (error) {
      console.error("Cancel booking error:", error);
      toast.error(
        error.response?.data?.message || error.message || "Failed to cancel booking"
      );
    }
  };

  return !isLoading ? (
    <div className="relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh] pb-24">
      <BlurCircle top="100px" left="100px" />
      <div>
        <BlurCircle bottom="0" left="600px" />
      </div>
      <div className="flex items-center justify-between max-w-3xl mb-4">
        <h1 className="text-xl font-bold text-white">My Bookings</h1>
        <p className="text-xs text-gray-400">
          {bookings.length} {bookings.length === 1 ? "ticket" : "tickets"} found
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 px-6 bg-primary/5 border border-dashed border-primary/20 rounded-2xl max-w-3xl">
          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3 text-primary">
            <TicketIcon className="w-7 h-7" />
          </div>
          <p className="text-gray-200 text-lg font-semibold">You have no bookings</p>
          
          {!user ? (
            <>
              <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                Sign in to view your booked movie tickets, or explore what's playing in theaters right now.
              </p>
              <div className="flex items-center justify-center gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => openSignIn()}
                  className="px-5 py-2 rounded-full bg-primary hover:bg-primary-dull text-white text-xs font-semibold transition cursor-pointer shadow-md shadow-primary/20 inline-flex items-center gap-1.5"
                >
                  <LogInIcon className="w-3.5 h-3.5" />
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate("/movies");
                    window.scrollTo(0, 0);
                  }}
                  className="px-5 py-2 rounded-full bg-primary/15 hover:bg-primary/25 border border-primary/30 text-white text-xs font-semibold transition cursor-pointer inline-flex items-center gap-1.5"
                >
                  <FilmIcon className="w-3.5 h-3.5" />
                  Browse Movies
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                Browse our now-playing movies, pick your preferred seats, and your tickets will appear here!
              </p>
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => {
                    navigate("/movies");
                    window.scrollTo(0, 0);
                  }}
                  className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary-dull text-white text-xs font-semibold transition cursor-pointer shadow-lg shadow-primary/20 inline-flex items-center gap-2"
                >
                  <FilmIcon className="w-4 h-4" />
                  Browse Movies
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        bookings.map((item) => (
          <div
            key={item._id}
            className="flex flex-col md:flex-row justify-between bg-primary/8 border border-primary/20 rounded-xl mt-4 p-2 max-w-3xl shadow-lg hover:border-primary/40 transition duration-200"
          >
            <BookingsCard
              item={item}
              onEdit={handleEdit}
              onCancel={handleCancel}
            />
          </div>
        ))
      )}

      {/* Edit Booking Modal */}
      <EditBookingModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingBooking(null);
        }}
        booking={editingBooking}
        isAdmin={false}
        onSuccess={() => {
          getMyBookings();
        }}
      />
    </div>
  ) : (
    <Loading />
  );
};

export default MyBookings;

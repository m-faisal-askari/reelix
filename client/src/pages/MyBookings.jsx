import React, { useEffect, useState } from "react";
import Loading from "../components/Loading";
import BlurCircle from "../components/BlurCircle";
import BookingsCard from "../components/BookingsCard";
import EditBookingModal from "../components/EditBookingModal";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const MyBookings = () => {
  const { axios, getToken, user } = useAppContext();

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingBooking, setEditingBooking] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const getMyBookings = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/user/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error("Get user bookings error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getMyBookings();
    }
  }, [user]);

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
    <div className="relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]">
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
        <div className="text-center py-16 bg-primary/5 border border-dashed border-primary/20 rounded-xl max-w-3xl">
          <p className="text-gray-300 font-medium">You have no active bookings.</p>
          <p className="text-xs text-gray-500 mt-1">
            Browse our now-playing movies and book your seats!
          </p>
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

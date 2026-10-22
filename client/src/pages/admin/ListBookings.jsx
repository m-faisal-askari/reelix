import React, { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import { dateFormat } from "../../lib/dateFormat";
import { useAppContext } from "../../context/AppContext.jsx";
import { PencilIcon, Trash2Icon, CheckCircle2Icon, ClockIcon, SearchIcon } from "lucide-react";
import toast from "react-hot-toast";
import EditBookingModal from "../../components/EditBookingModal";

const ListBookings = () => {
  const { axios, getToken, user } = useAppContext();
  const currency = import.meta.env.VITE_CURRENCY || "$";

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState("");
  const [editingBooking, setEditingBooking] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const getAllBookings = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/admin/all-bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success && data.bookings) {
        setBookings(data.bookings);
      } else {
        toast.error(data.message || "Failed to load bookings");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || error.message || "Failed to load bookings"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getAllBookings();
    }
  }, [user]);

  const handleEdit = (item) => {
    setEditingBooking(item);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (item) => {
    const customer = item.user?.name || "this user";
    const movie = item.show?.movie?.title || "movie";
    const seats = Array.isArray(item.bookedSeats)
      ? item.bookedSeats.join(", ")
      : "";

    if (
      !window.confirm(
        `Are you sure you want to permanently delete this booking for ${customer} (${movie}, Seats: ${seats})? The seats will be released.`
      )
    ) {
      return;
    }

    try {
      const token = await getToken();
      const { data } = await axios.delete(`/api/admin/booking/${item._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        toast.success(data.message || "Booking deleted and seats released!");
        getAllBookings();
      } else {
        toast.error(data.message || "Failed to delete booking");
      }
    } catch (error) {
      console.error("Delete booking error:", error);
      toast.error(
        error.response?.data?.message || error.message || "Failed to delete booking"
      );
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (!searchFilter.trim()) return true;
    const query = searchFilter.toLowerCase();
    const customer = (b.user?.name || b.user?.email || "").toLowerCase();
    const movie = (b.show?.movie?.title || "").toLowerCase();
    const seats = (Array.isArray(b.bookedSeats) ? b.bookedSeats.join(" ") : "").toLowerCase();
    return customer.includes(query) || movie.includes(query) || seats.includes(query);
  });

  return !loading ? (
    <>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Title text1={"List"} text2={"Bookings"} />
        {/* Quick Filter */}
        <div className="relative w-64">
          <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter by customer, movie, seat..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#150d24] border border-primary/30 rounded-xl text-white outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="max-w-5xl mt-6 overflow-x-auto">
        <table className="w-full border-collapse rounded-xl overflow-hidden text-nowrap">
          <thead>
            <tr className="bg-primary/20 text-left text-white text-xs font-semibold uppercase tracking-wider">
              <th className="p-3 pl-5">Customer</th>
              <th className="p-3">Movie Name</th>
              <th className="p-3">Show Time</th>
              <th className="p-3">Seats</th>
              <th className="p-3">Amount</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="text-sm font-light">
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">
                  No bookings found matching your search.
                </td>
              </tr>
            ) : (
              filteredBookings.map((item, index) => {
                const seatsList = Array.isArray(item.bookedSeats)
                  ? item.bookedSeats
                  : Object.keys(item.bookedSeats || {});

                return (
                  <tr
                    key={item._id || index}
                    className="border-b border-primary/10 bg-primary/5 even:bg-primary/10 hover:bg-primary/20 transition-colors"
                  >
                    <td className="p-3 min-w-44 pl-5">
                      <div className="font-medium text-white">
                        {item.user?.name || "Customer"}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {item.user?.email || item.user?._id || ""}
                      </div>
                    </td>
                    <td className="p-3 font-normal text-white">
                      {item.show?.movie?.title || "N/A"}
                    </td>
                    <td className="p-3 text-xs">
                      {item.show?.showDateTime
                        ? dateFormat(item.show.showDateTime)
                        : "N/A"}
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-primary">
                        {seatsList.join(", ")}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">
                        ({seatsList.length})
                      </span>
                    </td>
                    <td className="p-3 font-medium text-white">
                      {currency} {item.amount}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                          item.isPaid
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {item.isPaid ? (
                          <>
                            <CheckCircle2Icon className="w-3 h-3" /> Paid
                          </>
                        ) : (
                          <>
                            <ClockIcon className="w-3 h-3" /> Unpaid
                          </>
                        )}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 hover:bg-primary/40 rounded-lg text-gray-300 hover:text-white transition cursor-pointer"
                          title="Edit Booking (change seats, timing, or payment status)"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition cursor-pointer"
                          title="Delete / Cancel Booking and release seats"
                        >
                          <Trash2Icon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Booking Modal (Admin Mode) */}
      <EditBookingModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingBooking(null);
        }}
        booking={editingBooking}
        isAdmin={true}
        onSuccess={() => {
          getAllBookings();
        }}
      />
    </>
  ) : (
    <Loading />
  );
};

export default ListBookings;

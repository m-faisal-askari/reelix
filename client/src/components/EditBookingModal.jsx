import React, { useEffect, useState } from "react";
import {
  XIcon,
  CalendarIcon,
  ClockIcon,
  DollarSignIcon,
  Loader2Icon,
  FilmIcon,
  UserIcon,
  CheckIcon,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { dateFormat } from "../lib/dateFormat";
import isoTimeFormat from "../lib/isoTimeFormat";
import toast from "react-hot-toast";

const EditBookingModal = ({
  isOpen,
  onClose,
  booking,
  isAdmin = false,
  onSuccess,
}) => {
  const { axios, getToken } = useAppContext();
  const currency = import.meta.env.VITE_CURRENCY || "$";

  const groupRows = [
    ["A", "B"],
    ["C", "D"],
    ["E", "F"],
    ["G", "H"],
    ["I", "J"],
  ];

  const [loadingDetails, setLoadingDetails] = useState(true);
  const [availableShows, setAvailableShows] = useState([]);
  const [selectedShowId, setSelectedShowId] = useState("");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [isPaid, setIsPaid] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load details and available shows when modal opens
  useEffect(() => {
    if (isOpen && booking) {
      fetchBookingDetails();
    }
  }, [isOpen, booking]);

  const fetchBookingDetails = async () => {
    setLoadingDetails(true);
    try {
      const token = await getToken();
      const { data } = await axios.get(`/api/booking/details/${booking._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success && data.booking) {
        const b = data.booking;
        const currentShowId = b.show?._id || "";
        setSelectedShowId(currentShowId);
        setSelectedSeats(b.bookedSeats || []);
        setIsPaid(Boolean(b.isPaid));
        setAvailableShows(data.availableShows || []);

        // Load occupied seats for the current show
        if (currentShowId) {
          loadShowOccupiedSeats(currentShowId, b.bookedSeats || []);
        }
      } else {
        toast.error(data.message || "Failed to load booking details");
      }
    } catch (error) {
      console.error("Fetch booking details error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to load booking details");
    } finally {
      setLoadingDetails(false);
    }
  };

  const loadShowOccupiedSeats = async (showId, originalBookedSeats) => {
    try {
      const { data } = await axios.get(`/api/booking/seats/${showId}`);
      if (data.success && data.occupiedSeats) {
        // If this is the original show, exclude seats belonging to this booking so user can reselect/keep them
        const isOriginalShow = booking.show?._id === showId;
        const occupied = isOriginalShow
          ? data.occupiedSeats.filter((s) => !originalBookedSeats.includes(s))
          : data.occupiedSeats;
        setOccupiedSeats(occupied);
      }
    } catch (err) {
      console.error("Load seats error:", err);
    }
  };

  const handleShowChange = (newShowId) => {
    setSelectedShowId(newShowId);
    // If switching to a different show, clear selected seats or check availability
    const isOriginalShow = booking.show?._id === newShowId;
    loadShowOccupiedSeats(newShowId, isOriginalShow ? booking.bookedSeats || [] : []);
    if (!isOriginalShow) {
      setSelectedSeats([]);
      toast("Select your seats for the new show time");
    } else {
      setSelectedSeats(booking.bookedSeats || []);
    }
  };

  const handleSeatClick = (seatId) => {
    if (occupiedSeats.includes(seatId)) {
      return toast.error(`Seat ${seatId} is already occupied`);
    }

    setSelectedSeats((prev) => {
      const isSelected = prev.includes(seatId);

      if (isSelected) {
        if (prev.length === 1) {
          toast.error("Booking must have at least one seat");
          return prev;
        }
        return prev.filter((s) => s !== seatId);
      } else {
        if (prev.length >= 10) {
          toast.error("Maximum 10 seats allowed per booking");
          return prev;
        }
        return [...prev, seatId];
      }
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!selectedShowId) {
      return toast.error("Please select a show timing");
    }

    if (!selectedSeats || selectedSeats.length === 0) {
      return toast.error("Please select at least one seat");
    }

    setSaving(true);
    try {
      const token = await getToken();
      const endpoint = isAdmin
        ? `/api/admin/booking/${booking._id}`
        : `/api/booking/${booking._id}`;

      const payload = {
        showId: selectedShowId,
        selectedSeats,
      };

      if (isAdmin) {
        payload.isPaid = isPaid;
      }

      const { data } = await axios.put(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        toast.success(data.message || "Booking updated successfully!");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(data.message || "Failed to update booking");
      }
    } catch (error) {
      console.error("Save booking error:", error);
      toast.error(
        error.response?.data?.message || error.message || "Failed to update booking"
      );
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !booking) return null;

  const movie = booking.show?.movie || {};
  const currentSelectedShow = availableShows.find((s) => s._id === selectedShowId);
  const unitPrice = currentSelectedShow?.showPrice || booking.show?.showPrice || 0;
  const newTotalAmount = selectedSeats.length * unitPrice;

  const renderSeats = (row, count = 9) => (
    <div key={row} className="flex gap-1.5 mt-1.5">
      <div className="flex items-center justify-center gap-1.5">
        {Array.from({ length: count }, (_, i) => {
          const seatId = `${row}${i + 1}`;
          const isOccupied = occupiedSeats.includes(seatId);
          const isSelected = selectedSeats.includes(seatId);

          return (
            <button
              key={seatId}
              type="button"
              disabled={isOccupied}
              onClick={() => handleSeatClick(seatId)}
              title={
                isOccupied
                  ? `Seat ${seatId} (Occupied)`
                  : isSelected
                    ? `Seat ${seatId} (Selected)`
                    : `Seat ${seatId} (Available)`
              }
              className={`h-7 w-7 rounded border text-[11px] font-medium shrink-0 transition select-none ${
                isOccupied
                  ? "bg-gray-800/80 border-gray-700/60 text-gray-500 cursor-not-allowed line-through opacity-40"
                  : isSelected
                    ? "bg-primary text-white border-primary font-bold shadow-md shadow-primary/40 scale-105 cursor-pointer ring-2 ring-primary/40"
                    : "border-primary/50 text-gray-200 hover:bg-primary/20 hover:border-primary cursor-pointer active:scale-95"
              }`}
            >
              {seatId}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-[#140b20] border border-primary/30 rounded-2xl p-6 shadow-2xl text-white max-h-[92vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-primary/20">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FilmIcon className="w-5 h-5 text-primary" />
              Edit Booking {isAdmin && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full border border-primary/30">Admin Mode</span>}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Change show times, add or remove seats, or swap seating locations.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {loadingDetails ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
            <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm">Loading booking details...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="mt-4 space-y-4">
            {/* Booking & Movie Overview */}
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between gap-3 text-xs">
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-gray-400">Movie</span>
                <p className="font-semibold text-sm text-white truncate">{movie.title || "Cinema Movie"}</p>
                {isAdmin && booking.user && (
                  <p className="text-gray-300 mt-0.5 flex items-center gap-1">
                    <UserIcon className="w-3 h-3 text-primary" />
                    <span>Customer: {booking.user.name || booking.user.email || booking.user._id}</span>
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase font-bold text-gray-400">Current Amount</span>
                <p className="font-bold text-sm text-primary">{currency}{booking.amount}</p>
              </div>
            </div>

            {/* Select Show Timing */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5 flex items-center gap-1.5">
                <ClockIcon className="w-3.5 h-3.5 text-primary" />
                Select Show Timing
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto no-scrollbar p-1">
                {availableShows.map((s) => {
                  const isSelected = s._id === selectedShowId;
                  return (
                    <div
                      key={s._id}
                      onClick={() => handleShowChange(s._id)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? "bg-primary/25 border-primary text-white font-medium shadow-md shadow-primary/20"
                          : "bg-primary/5 border-primary/20 text-gray-300 hover:bg-primary/15"
                      }`}
                    >
                      <div>
                        <p className="font-medium text-white">{dateFormat(s.showDateTime)}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{currency}{s.showPrice} per ticket</p>
                      </div>
                      {isSelected && (
                        <span className="bg-primary text-white p-1 rounded-full">
                          <CheckIcon className="w-3 h-3" strokeWidth={3} />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Seat Map Legend */}
            <div className="flex items-center justify-center gap-5 pt-2 text-[11px] text-gray-300">
              <div className="flex items-center gap-1.5">
                <span className="h-3.5 w-3.5 rounded border border-primary/60 inline-block"></span>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3.5 w-3.5 rounded bg-primary border border-primary inline-block"></span>
                <span>Your Selected Seats</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3.5 w-3.5 rounded bg-gray-800/80 border border-gray-700/60 opacity-50 line-through text-[8px] flex items-center justify-center inline-block">
                  ✕
                </span>
                <span>Taken / Disabled</span>
              </div>
            </div>

            {/* Interactive Seat Selection Grid */}
            <div>
              <p className="text-center text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">
                Click any seat to add or remove
              </p>
              <div className="w-full overflow-x-auto pb-2 no-scrollbar bg-black/40 border border-primary/20 rounded-xl p-3">
                <div className="w-full min-w-max flex flex-col items-center text-xs">
                  <div className="grid grid-cols-1 gap-1.5 mb-3">
                    {groupRows[0].map((row) => renderSeats(row))}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {groupRows.slice(1).map((group, idx) => (
                      <div key={idx}>{group.map((row) => renderSeats(row))}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Payment Toggle */}
            {isAdmin && (
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-white">Payment Status</p>
                  <p className="text-gray-400 text-[11px]">Mark this booking as paid or unpaid</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={isPaid}
                    onChange={(e) => setIsPaid(e.target.checked)}
                    className="accent-primary h-4 w-4 rounded"
                  />
                  <span>{isPaid ? "Paid" : "Unpaid"}</span>
                </label>
              </div>
            )}

            {/* Updated Summary */}
            <div className="p-3.5 bg-primary/15 border border-primary/30 rounded-xl flex items-center justify-between gap-3 text-xs">
              <div>
                <p className="font-semibold text-gray-300">
                  Updated Seats ({selectedSeats.length}):
                </p>
                <p className="font-bold text-white text-sm mt-0.5">
                  {selectedSeats.length > 0 ? selectedSeats.join(", ") : "None"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-[11px]">Updated Total</p>
                <p className="font-bold text-primary text-base">
                  {currency}{newTotalAmount}
                </p>
                <span className="text-[10px] text-gray-400">
                  ({selectedSeats.length} × {currency}{unitPrice})
                </span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-primary/20">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 text-xs font-medium rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || selectedSeats.length === 0}
                className="flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-xl bg-primary hover:bg-primary/90 text-white transition cursor-pointer disabled:opacity-50 shadow-md shadow-primary/20"
              >
                {saving ? (
                  <>
                    <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditBookingModal;

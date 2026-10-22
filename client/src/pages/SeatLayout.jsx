import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { assets } from "../assets/assets";
import NotFound from "../components/NotFound";
import { ArrowRightIcon, ClockIcon, Loader2Icon, CheckCircle2Icon } from "lucide-react";
import isoTimeFormat from "../lib/isoTimeFormat";
import BlurCircle from "../components/BlurCircle";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";

const SeatLayout = () => {
  const groupRows = [
    ["A", "B"],
    ["C", "D"],
    ["E", "F"],
    ["G", "H"],
    ["I", "J"],
  ];

  const { id, date: urlDate } = useParams();
  const [selectedDate, setSelectedDate] = useState(urlDate);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [show, setShow] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [isBooking, setIsBooking] = useState(false);

  const navigate = useNavigate();
  const { axios, getToken, user } = useAppContext();
  const currency = import.meta.env.VITE_CURRENCY || "$";

  const getShow = async () => {
    try {
      const { data } = await axios.get(`/api/show/${id}`);

      if (data.success) {
        setShow(data);
      }
    } catch (error) {
      console.error("Get show error:", error);
    }
  };

  const getOccupiedSeats = async (showIdToFetch = null) => {
    const targetShowId = showIdToFetch || selectedTime?.showId;
    if (!targetShowId) return;

    try {
      const { data } = await axios.get(
        `/api/booking/seats/${targetShowId}`,
      );

      if (data.success && data.occupiedSeats) {
        setOccupiedSeats(data.occupiedSeats);
      } else {
        setOccupiedSeats([]);
      }
    } catch (error) {
      console.error("Get occupied seats error:", error);
    }
  };

  const handleSeatClick = (seatId) => {
    if (!selectedTime) {
      return toast.error("Please select a show timing first");
    }

    if (occupiedSeats.includes(seatId)) {
      return toast.error("This seat is already booked and unavailable");
    }

    setSelectedSeats((prev) => {
      const isSelected = prev.includes(seatId);

      // Maximum 5 seats per booking
      if (!isSelected && prev.length >= 5) {
        toast.error("You can select up to 5 seats per booking.");
        return prev;
      }

      // Toggle seat selection
      return isSelected
        ? prev.filter((seat) => seat !== seatId)
        : [...prev, seatId];
    });
  };

  const renderSeats = (row, count = 9) => (
    <div key={row} className="flex gap-2 mt-2">
      <div className="flex items-center justify-center gap-2">
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
                  ? `Seat ${seatId} (Booked / Taken)`
                  : isSelected
                    ? `Seat ${seatId} (Selected)`
                    : `Seat ${seatId} (Available)`
              }
              className={`h-8 w-8 rounded border text-xs font-medium shrink-0 transition select-none ${
                isOccupied
                  ? "bg-gray-800/80 border-gray-700/60 text-gray-500 cursor-not-allowed line-through opacity-45"
                  : isSelected
                    ? "bg-primary text-white border-primary font-bold shadow-md shadow-primary/40 scale-105 cursor-pointer ring-2 ring-primary/40"
                    : "border-primary/60 text-gray-200 hover:bg-primary/20 hover:border-primary cursor-pointer active:scale-95"
              }`}
            >
              {seatId}
            </button>
          );
        })}
      </div>
    </div>
  );

  const bookTickets = async () => {
    try {
      if (!user) {
        return toast.error("Please login to proceed with booking");
      }
      if (!selectedTime || !selectedTime.showId) {
        return toast.error("Please select a show timing");
      }
      if (!selectedSeats.length) {
        return toast.error("Please select at least one seat");
      }

      setIsBooking(true);
      const token = await getToken();
      const { data } = await axios.post(
        "/api/booking/create",
        {
          showId: selectedTime.showId,
          selectedSeats,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (data.success) {
        toast.success(data.message || "Seats booked successfully!");
        // Refresh occupied seats immediately
        await getOccupiedSeats(selectedTime.showId);
        setSelectedSeats([]);
        navigate("/my-bookings");
      } else {
        toast.error(data.message || "Failed to complete booking");
      }
    } catch (error) {
      console.error("Booking checkout error:", error);
      toast.error(
        error.response?.data?.message || error.message || "Failed to complete booking"
      );
    } finally {
      setIsBooking(false);
    }
  };

  useEffect(() => {
    getShow();
  }, [id]);

  useEffect(() => {
    if (selectedTime?.showId) {
      setSelectedSeats([]);
      getOccupiedSeats(selectedTime.showId);
    }
  }, [selectedTime]);

  const availableDates = Object.keys(show?.dateTime || {});
  const activeDate =
    selectedDate && availableDates.includes(selectedDate)
      ? selectedDate
      : urlDate && availableDates.includes(urlDate)
        ? urlDate
        : availableDates[0] || null;

  const currentTimings = activeDate ? show?.dateTime?.[activeDate] || [] : [];

  // Auto-select first timing if available and none currently selected
  useEffect(() => {
    if (
      currentTimings.length > 0 &&
      (!selectedTime ||
        !currentTimings.some((t) => t.time === selectedTime?.time))
    ) {
      setSelectedTime(currentTimings[0]);
    }
  }, [activeDate, show]);

  const seatPrice = selectedTime?.showPrice || 0;
  const totalPrice = selectedSeats.length * seatPrice;

  return show ? (
    <div className="flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30 md:pt-40 gap-8 min-h-[85vh]">
      {/* Available Dates & Timings Sidebar */}
      <div className="w-full md:w-64 bg-primary/10 border border-primary/20 rounded-xl py-6 md:py-8 h-max md:sticky md:top-30 shadow-lg">
        {/* Show Dates Selector if dates exist */}
        {availableDates.length > 0 && (
          <div className="px-6 mb-5">
            <p className="text-sm font-semibold text-gray-300 mb-2">
              Show Dates
            </p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {availableDates.map((dStr) => {
                const dObj = new Date(dStr + "T00:00:00");
                const isSel = dStr === activeDate;
                return (
                  <button
                    key={dStr}
                    type="button"
                    onClick={() => {
                      setSelectedDate(dStr);
                      setSelectedSeats([]);
                    }}
                    className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-lg text-xs cursor-pointer shrink-0 transition ${
                      isSel
                        ? "bg-primary text-white font-medium shadow-md shadow-primary/30"
                        : "border border-primary/40 text-gray-300 hover:bg-primary/20"
                    }`}
                  >
                    <span className="font-semibold text-sm">
                      {dObj.getDate()}
                    </span>
                    <span className="text-[10px] uppercase">
                      {dObj.toLocaleDateString("en-US", { month: "short" })}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <p className="text-lg font-semibold px-6">Available Timings</p>
        <div className="mt-4 space-y-1">
          {currentTimings.length > 0 ? (
            currentTimings.map((item) => (
              <div
                key={item.time}
                onClick={() => setSelectedTime(item)}
                className={`flex items-center justify-between px-6 py-2.5 w-full cursor-pointer transition ${
                  selectedTime?.time === item.time
                    ? "bg-primary text-white font-medium shadow-sm"
                    : "text-gray-300 hover:bg-primary/20"
                }`}
              >
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 shrink-0" />
                  <p className="text-sm">{isoTimeFormat(item.time)}</p>
                </div>
                {item.showPrice && (
                  <span className="text-xs font-semibold opacity-90">
                    {currency}{item.showPrice}
                  </span>
                )}
              </div>
            ))
          ) : (
            <p className="px-6 text-sm text-gray-400 mt-2">
              No timings available for this date.
            </p>
          )}
        </div>
      </div>

      {/* Seats Layout */}
      <div className="relative flex-1 flex flex-col items-center max-md:mt-10 min-w-0">
        <BlurCircle top="-100px" left="-100px" />
        <BlurCircle bottom="0" right="0" />

        <h1 className="text-2xl font-semibold mb-2">Select your seat</h1>
        {selectedTime && (
          <p className="text-sm text-gray-400 mb-4">
            Showing for <span className="text-primary font-medium">{isoTimeFormat(selectedTime.time)}</span>
            {seatPrice > 0 && <span> • {currency}{seatPrice} per seat</span>}
          </p>
        )}

        <img src={assets.screenImage} alt="screen" className="max-w-md w-full" />
        <p className="text-gray-400 text-xs mt-1 mb-4 uppercase tracking-wider">Screen side</p>

        {/* Seat Status Legend */}
        <div className="flex items-center justify-center gap-6 my-2 text-xs text-gray-300 bg-primary/5 border border-primary/20 px-4 py-2 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded border border-primary/60 inline-block"></span>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded bg-primary border border-primary inline-block"></span>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded bg-gray-800/80 border border-gray-700/60 opacity-50 line-through text-[9px] flex items-center justify-center">
              ✕
            </span>
            <span>Taken / Disabled</span>
          </div>
        </div>

        {/* Seats Grid */}
        <div className="w-full overflow-x-auto">
          <div className="w-full min-w-max flex flex-col items-center mt-5 text-xs text-gray-300">
            <div className="grid grid-cols-1 gap-2 mb-6">
              {groupRows[0].map((row) => renderSeats(row))}
            </div>
            <div className="grid grid-cols-2 gap-8">
              {groupRows.slice(1).map((group, idx) => (
                <div key={idx}>{group.map((row) => renderSeats(row))}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Summary Box */}
        {selectedSeats.length > 0 && (
          <div className="mt-8 p-4 bg-primary/15 border border-primary/30 rounded-2xl max-w-md w-full shadow-lg flex items-center justify-between gap-4 animate-in fade-in">
            <div>
              <p className="text-xs text-gray-300 uppercase tracking-wider font-semibold">
                Selected Seats ({selectedSeats.length})
              </p>
              <p className="text-sm font-bold text-white mt-0.5">
                {selectedSeats.join(", ")}
              </p>
            </div>
            {seatPrice > 0 && (
              <div className="text-right">
                <p className="text-xs text-gray-400">Total Price</p>
                <p className="text-lg font-bold text-primary">
                  {currency}{totalPrice}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Checkout Button */}
        <button
          type="button"
          disabled={isBooking || selectedSeats.length === 0}
          onClick={bookTickets}
          className={`flex items-center gap-2 mt-8 px-10 py-3.5 text-sm rounded-full font-semibold transition shadow-xl ${
            selectedSeats.length > 0 && !isBooking
              ? "bg-primary hover:bg-primary-dull text-white cursor-pointer active:scale-95 shadow-primary/30"
              : "bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed opacity-60"
          }`}
        >
          {isBooking ? (
            <>
              <Loader2Icon className="w-4 h-4 animate-spin" />
              <span>Processing booking...</span>
            </>
          ) : (
            <>
              <span>Proceed to checkout</span>
              <ArrowRightIcon strokeWidth={2.5} className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  ) : (
    <NotFound />
  );
};

export default SeatLayout;

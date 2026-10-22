import React from "react";
import timeFormat from "../lib/timeFormat";
import { dateFormat } from "../lib/dateFormat";
import { PencilIcon, Trash2Icon, CheckCircle2Icon, ClockIcon, CreditCardIcon } from "lucide-react";

const BookingsCard = ({ item, onEdit, onCancel }) => {
  const getPosterUrl = (path) => {
    if (!path) return "";
    return path.startsWith("http")
      ? path
      : `https://image.tmdb.org/t/p/w500${path}`;
  };

  const currency = import.meta.env.VITE_CURRENCY || "$";
  const movie = item.show?.movie || {};
  const showDateTime = item.show?.showDateTime;
  const seatsList = Array.isArray(item.bookedSeats)
    ? item.bookedSeats
    : Object.keys(item.bookedSeats || {});

  return (
    <div className="flex flex-col md:flex-row justify-between w-full">
      {/* Movie Info */}
      <div className="flex flex-col sm:flex-row gap-4 p-2">
        <img
          src={getPosterUrl(movie.poster_path)}
          alt={movie.title || "Movie poster"}
          className="w-full sm:w-32 aspect-[2/3] sm:h-44 object-cover rounded-lg border border-primary/20 shrink-0 shadow-md"
        />
        <div className="flex flex-col justify-between py-1 min-w-0">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                  item.isPaid
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}
              >
                {item.isPaid ? (
                  <>
                    <CheckCircle2Icon className="w-3 h-3" /> Confirmed
                  </>
                ) : (
                  <>
                    <ClockIcon className="w-3 h-3" /> Pending Payment
                  </>
                )}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white truncate" title={movie.title}>
              {movie.title || "Cinema Movie"}
            </h3>
            {movie.runtime && (
              <p className="text-gray-400 text-xs mt-0.5">
                Runtime: {timeFormat(movie.runtime)}
              </p>
            )}
          </div>

          <div className="mt-3">
            <p className="text-xs text-gray-400 font-medium">Show Time:</p>
            <p className="text-sm font-semibold text-primary">
              {showDateTime ? dateFormat(showDateTime) : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Booking Details & Actions */}
      <div className="flex flex-col justify-between p-4 md:items-end border-t md:border-t-0 md:border-l border-primary/15 shrink-0">
        <div className="md:text-right">
          <p className="text-2xl font-bold text-white">
            {currency}{item.amount}
          </p>
          <div className="text-xs mt-1.5 space-y-0.5">
            <p className="text-gray-300">
              <span className="text-gray-400">Total Seats:</span>{" "}
              <span className="font-semibold text-white">{seatsList.length}</span>
            </p>
            <p className="text-gray-300">
              <span className="text-gray-400">Seats:</span>{" "}
              <span className="font-semibold text-primary">{seatsList.join(", ")}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons: Pay Now, Edit, and Cancel */}
        <div className="flex items-center gap-2 mt-4 pt-2">
          {!item.isPaid && item.paymentLink && (
            <a
              href={item.paymentLink}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition cursor-pointer"
              title="Complete payment for this booking"
            >
              <CreditCardIcon className="w-3.5 h-3.5" />
              <span>Pay Now</span>
            </a>
          )}

          {onEdit && (
            <button
              onClick={() => onEdit(item)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary/20 hover:bg-primary/30 text-white border border-primary/30 transition cursor-pointer"
              title="Change time or seats"
            >
              <PencilIcon className="w-3.5 h-3.5 text-primary" />
              <span>Edit</span>
            </button>
          )}

          {onCancel && (
            <button
              onClick={() => onCancel(item)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 hover:text-red-300 transition cursor-pointer"
              title="Cancel this booking"
            >
              <Trash2Icon className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingsCard;

import React from 'react'
import timeFormat from '../lib/timeFormat'
import isoTimeFormat from '../lib/isoTimeFormat';
import { dateFormat } from '../lib/dateFormat';
import { Currency } from 'lucide-react';

const BookingsCard = ({item}) => {

    const currency = import.meta.env.VITE_CURRENCY
  return (
    <>
      <div className="flex flex-col md:flex-row">
        <img
          src={item.show.movie.poster_path}
          alt=""
          className="md:max-w-45 aspect-video h-auto object-cover object-bottom rounded"
        />
        <div className="flex flex-col p-4">
          <p className="text-lg font-semibold">{item.show.movie.title}</p>
          <p className="text-gray-400 text-sm">
            {timeFormat(item.show.movie.runtime)}
          </p>
          <p className="text-gray-400 text-sm mt-auto">
            {dateFormat(item.show.showDateTime)}
          </p>
        </div>
      </div>

      <div className="flex flex-col md:items-end md:text-right justify-between p-4">
        <div className="flex items-center gap-4">
          <p className="text-2xl font-semibold mb-3">
            {currency}
            {item.amount}
          </p>
          {!item.isPaid && (
            <button className="bg-primary px-4 py-1.5 mb-3 text-sm rounded-full font-medium cursor-pointer">
              Pay Now
            </button>
          )}
        </div>
        <div className="text-sm">
          <p>
            <span className="text-gray-400">Total seats:</span>{" "}
            {item.bookedSeats.length}
          </p>
          <p>
            <span className="text-gray-400">Seat Number:</span>{" "}
            {item.bookedSeats.join(", ")}
          </p>
        </div>
      </div>
    </>
  );
}

export default BookingsCard
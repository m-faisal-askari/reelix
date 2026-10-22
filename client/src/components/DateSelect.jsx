import React, { useState, useRef, useEffect } from "react";
import BlurCircle from "./BlurCircle";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const DateSelect = ({ dateTime = {}, id }) => {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const dates = Object.keys(dateTime || {});

  // Auto-select first available date
  useEffect(() => {
    if (dates.length > 0 && (!selected || !dates.includes(selected))) {
      setSelected(dates[0]);
    }
  }, [dateTime]);

  const onBookHandler = () => {
    if (!selected) {
      return toast.error("Please select a date!");
    }
    navigate(`/movies/${id}/${selected}`);
    scrollTo(0, 0);
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -160 : 160;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div id="dateSelect" className="pt-30">
      <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative p-8 bg-primary/10 border border-primary/20 rounded-lg">
        <BlurCircle top="-100px" left="-100px" />
        <BlurCircle top="100px" right="0" />
        <div className="w-full md:w-auto">
          <p className="text-lg font-semibold">Choose Date</p>

          {dates.length > 0 ? (
            <div className="flex items-center gap-3 text-sm mt-5 max-w-full">
              <button
                type="button"
                onClick={() => scroll("left")}
                className="text-gray-400 hover:text-white cursor-pointer shrink-0 p-1 transition"
                aria-label="Previous dates"
              >
                <ChevronLeftIcon width={28} />
              </button>

              <div
                ref={scrollRef}
                className="flex items-center gap-4 overflow-x-auto no-scrollbar max-w-full md:max-w-xl py-1 scroll-smooth"
              >
                {dates.map((date) => {
                  const d = new Date(date + "T00:00:00");
                  const dayNum = d.getDate();
                  const monthName = d.toLocaleDateString("en-US", {
                    month: "short",
                  });
                  const isSelected = selected === date;

                  return (
                    <button
                      key={date}
                      type="button"
                      className={`flex flex-col items-center justify-center h-14 w-14 aspect-square rounded cursor-pointer shrink-0 transition ${
                        isSelected
                          ? "bg-primary text-white font-medium shadow-md shadow-primary/30"
                          : "border border-primary/70 text-gray-300 hover:bg-primary/20"
                      }`}
                      onClick={() => setSelected(date)}
                    >
                      <span className="text-base font-semibold">{dayNum}</span>
                      <span className="text-xs uppercase">{monthName}</span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => scroll("right")}
                className="text-gray-400 hover:text-white cursor-pointer shrink-0 p-1 transition"
                aria-label="Next dates"
              >
                <ChevronRightIcon width={28} />
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-400 mt-4">
              No show dates available for this movie yet.
            </p>
          )}
        </div>

        <button
          onClick={onBookHandler}
          disabled={dates.length === 0}
          className={`px-8 py-2.5 mt-6 rounded transition-all font-medium text-sm cursor-pointer ${
            dates.length > 0
              ? "bg-primary text-white hover:bg-primary/90 active:scale-95"
              : "bg-gray-700 text-gray-400 cursor-not-allowed"
          }`}
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default DateSelect;

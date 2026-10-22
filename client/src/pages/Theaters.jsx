import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BlurCircle from "../components/BlurCircle";
import {
  MapPin,
  Building2,
  Search,
  X,
  ArrowRight,
  Phone,
  Layers,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

const Theaters = () => {
  const navigate = useNavigate();
  const { theaters } = useAppContext();

  const [selectedLocation, setSelectedLocation] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Unique list of locations
  const locations = Array.from(
    new Set((theaters || []).map((t) => t.location).filter(Boolean))
  ).sort();

  // Filtered Theaters
  const filteredTheaters = (theaters || []).filter((t) => {
    const matchesLocation =
      selectedLocation === "All" ||
      t.location.toLowerCase() === selectedLocation.toLowerCase();

    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.location.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesLocation && matchesSearch;
  });

  return (
    <div className="flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30 md:pt-40 gap-8 min-h-[85vh] relative">
      {/* Available Locations Sidebar */}
      <div className="w-full md:w-64 bg-primary/10 border border-primary/20 rounded-lg py-6 md:py-8 h-max md:sticky md:top-30">
        <div className="px-6 flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold">Available Locations</p>
            <p className="text-xs text-gray-400 mt-0.5">Filter theaters by city</p>
          </div>
        </div>

        <div className="mt-5 space-y-1 max-md:flex max-md:space-y-0 max-md:gap-2 max-md:overflow-x-auto max-md:px-4 max-md:pb-2 no-scrollbar">
          <div
            onClick={() => setSelectedLocation("All")}
            className={`flex items-center justify-between px-4 py-2.5 md:w-full rounded-md cursor-pointer transition text-sm ${
              selectedLocation === "All"
                ? "bg-primary text-white font-medium"
                : "text-gray-300 hover:bg-primary/20"
            }`}
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 shrink-0" />
              <p className="whitespace-nowrap">All Locations</p>
            </div>
            <span className="text-xs opacity-80 px-2 py-0.5 rounded-full bg-black/30 ml-3">
              {(theaters || []).length}
            </span>
          </div>

          {locations.map((loc) => {
            const count = (theaters || []).filter((t) => t.location === loc).length;
            const isSelected = selectedLocation === loc;
            return (
              <div
                key={loc}
                onClick={() => setSelectedLocation(loc)}
                className={`flex items-center justify-between px-4 py-2.5 md:w-full rounded-md cursor-pointer transition text-sm ${
                  isSelected
                    ? "bg-primary text-white font-medium"
                    : "text-gray-300 hover:bg-primary/20"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <p className="whitespace-nowrap truncate">{loc}</p>
                </div>
                <span className="text-xs opacity-80 px-2 py-0.5 rounded-full bg-black/30 ml-3 shrink-0">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Theaters Content */}
      <div className="relative flex-1 flex flex-col min-w-0">
        <BlurCircle top="-100px" left="-100px" />
        <BlurCircle bottom="0" right="0" />

        {/* Header Bar */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold">Cinema Theaters</h1>
          <p className="text-gray-400 text-sm mt-1">
            Showing theaters for{" "}
            <span className="text-primary font-medium">{selectedLocation}</span>{" "}
            ({filteredTheaters.length} available)
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search theaters by name, city, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-primary/10 border border-primary/20 rounded-full pl-11 pr-4 py-2.5 text-sm text-white placeholder-gray-400 outline-none focus:border-primary transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Theaters List / Grid */}
        {filteredTheaters.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {filteredTheaters.map((theater) => (
              <div
                key={theater.id}
                className="bg-primary/8 border border-primary/20 hover:border-primary/50 transition rounded-xl p-5 flex flex-col justify-between gap-4 relative group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-semibold text-white group-hover:text-primary transition">
                        {theater.name}
                      </h2>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{theater.address}</span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 text-xs rounded-full bg-primary/20 text-primary border border-primary/30 font-medium whitespace-nowrap">
                      {theater.location}
                    </span>
                  </div>

                  {/* Formats Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {(theater.formats || []).map((fmt) => (
                      <span
                        key={fmt}
                        className="px-2 py-0.5 text-xs rounded bg-white/5 border border-white/10 text-gray-300"
                      >
                        {fmt}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer details & Action */}
                <div className="pt-3 border-t border-primary/10 flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-primary" />
                      <span>{theater.screens} Screens</span>
                    </span>
                    {theater.contact && (
                      <span className="flex items-center gap-1 max-sm:hidden">
                        <Phone className="w-3.5 h-3.5 text-primary" />
                        <span>{theater.contact}</span>
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => navigate("/movies")}
                    className="flex items-center gap-1 px-4 py-1.5 bg-primary/20 hover:bg-primary text-primary hover:text-white border border-primary/40 rounded-full font-medium transition cursor-pointer active:scale-95"
                  >
                    <span>View Movies</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-primary/5 border border-primary/15 rounded-xl">
            <Building2 className="w-12 h-12 text-gray-500 mb-3" />
            <p className="text-lg font-medium">No theaters found</p>
            <p className="text-sm text-gray-400 mt-1 max-w-sm">
              No cinema theaters match your current filter or search criteria.
            </p>
            <button
              onClick={() => {
                setSelectedLocation("All");
                setSearchQuery("");
              }}
              className="mt-5 px-5 py-2 text-xs bg-primary hover:bg-primary-dull text-white rounded-full transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Theaters;

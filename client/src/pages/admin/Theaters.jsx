import React, { useState } from "react";
import Title from "../../components/admin/Title";
import { useAppContext } from "../../context/AppContext";
import {
  Building2,
  MapPin,
  Trash2,
  Plus,
  Check,
  Search,
  Layers,
  Phone,
} from "lucide-react";
import toast from "react-hot-toast";

const availableFormatsList = [
  "Standard",
  "IMAX",
  "Dolby Atmos",
  "Dolby Cinema",
  "4DX",
  "RealD 3D",
  "VIP Recliners",
  "ScreenX",
];

const AdminTheaters = () => {
  const { theaters, addTheater, removeTheater } = useAppContext();

  // Form State
  const [name, setName] = useState("");
  const [locationType, setLocationType] = useState("existing"); // "existing" | "new"
  const [locationName, setLocationName] = useState("");
  const [customLocationName, setCustomLocationName] = useState("");
  const [address, setAddress] = useState("");
  const [screens, setScreens] = useState("6");
  const [selectedFormats, setSelectedFormats] = useState(["Standard", "Dolby Atmos"]);
  const [contact, setContact] = useState("");

  // Table Filter State
  const [filterLocation, setFilterLocation] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Unique list of existing locations
  const locations = Array.from(
    new Set((theaters || []).map((t) => t.location).filter(Boolean))
  ).sort();

  // Set default location selection
  React.useEffect(() => {
    if (locations.length > 0 && !locationName) {
      setLocationName(locations[0]);
    }
  }, [locations, locationName]);

  const toggleFormat = (fmt) => {
    setSelectedFormats((prev) =>
      prev.includes(fmt) ? prev.filter((f) => f !== fmt) : [...prev, fmt]
    );
  };

  const handleAddTheater = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      return toast.error("Please enter a theater name");
    }

    const finalLocation =
      locationType === "new" ? customLocationName.trim() : locationName.trim();

    if (!finalLocation) {
      return toast.error("Please select or specify a location");
    }

    if (!address.trim()) {
      return toast.error("Please enter an address");
    }

    const newTheater = {
      id: `th-${Date.now()}`,
      name: name.trim(),
      location: finalLocation,
      address: address.trim(),
      screens: Number(screens) || 1,
      formats: selectedFormats.length > 0 ? selectedFormats : ["Standard"],
      contact: contact.trim() || undefined,
    };

    addTheater(newTheater);
    toast.success(`"${newTheater.name}" added in ${finalLocation}!`);

    // Reset Form
    setName("");
    setAddress("");
    setScreens("6");
    setSelectedFormats(["Standard", "Dolby Atmos"]);
    setContact("");
    setCustomLocationName("");
    setLocationType("existing");
  };

  const handleDelete = (id, theaterName) => {
    removeTheater(id);
    toast.success(`"${theaterName}" removed`);
  };

  // Filtered theaters for admin table
  const filteredTheaters = (theaters || []).filter((t) => {
    const matchesLocation =
      filterLocation === "All" ||
      t.location.toLowerCase() === filterLocation.toLowerCase();

    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.address.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesLocation && matchesSearch;
  });

  return (
    <div className="pb-16 max-w-5xl">
      <Title text1={"Manage"} text2={"Theaters"} />

      {/* Add New Theater Form Section */}
      <div className="mt-8 bg-primary/8 border border-primary/20 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-medium">Add New Theater</h2>
        </div>
        <p className="text-xs text-gray-400 mb-6">
          Register new cinema venues and specify their locations, screens, and formats.
        </p>

        <form onSubmit={handleAddTheater} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Theater Name */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Theater Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CineStar IMAX or Galaxy Cinema"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/40 border border-gray-600 rounded-md px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary transition"
              />
            </div>

            {/* Location Selector */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Location (City) *
              </label>
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setLocationType("existing")}
                  className={`flex-1 py-1 text-xs rounded border transition cursor-pointer ${
                    locationType === "existing"
                      ? "bg-primary/20 border-primary text-primary font-medium"
                      : "border-gray-700 text-gray-400 hover:bg-white/5"
                  }`}
                >
                  Existing City
                </button>
                <button
                  type="button"
                  onClick={() => setLocationType("new")}
                  className={`flex-1 py-1 text-xs rounded border transition cursor-pointer ${
                    locationType === "new"
                      ? "bg-primary/20 border-primary text-primary font-medium"
                      : "border-gray-700 text-gray-400 hover:bg-white/5"
                  }`}
                >
                  + Add New City
                </button>
              </div>

              {locationType === "existing" ? (
                <select
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full bg-[#1c1c1f] border border-gray-600 rounded-md px-3.5 py-2 text-sm text-white focus:outline-none focus:border-primary transition"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  placeholder="e.g. San Francisco, Miami, Berlin, Sydney..."
                  value={customLocationName}
                  onChange={(e) => setCustomLocationName(e.target.value)}
                  className="w-full bg-black/40 border border-gray-600 rounded-md px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary transition"
                />
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Address / Area *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 100 Main St, Downtown Shopping Center"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-black/40 border border-gray-600 rounded-md px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary transition"
            />
          </div>

          {/* Screens and Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Total Screens
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={screens}
                onChange={(e) => setScreens(e.target.value)}
                className="w-full bg-black/40 border border-gray-600 rounded-md px-3.5 py-2 text-sm text-white focus:outline-none focus:border-primary transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Contact Phone (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. +1 555-0199"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full bg-black/40 border border-gray-600 rounded-md px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary transition"
              />
            </div>
          </div>

          {/* Supported Formats */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Supported Formats & Amenities
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableFormatsList.map((fmt) => {
                const isSelected = selectedFormats.includes(fmt);
                return (
                  <button
                    type="button"
                    key={fmt}
                    onClick={() => toggleFormat(fmt)}
                    className={`px-3 py-1 text-xs rounded-full border transition cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? "bg-primary border-primary text-white font-medium"
                        : "bg-white/5 border-gray-700 text-gray-400 hover:border-gray-500"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{fmt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="bg-primary text-white px-8 py-2 mt-2 rounded hover:bg-primary/90 transition-all cursor-pointer font-medium text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Theater</span>
          </button>
        </form>
      </div>

      {/* List of Registered Theaters Table Section */}
      <div className="mt-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-medium">All Theaters</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {(theaters || []).length} registered venues across {locations.length} locations
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter by Location */}
            <div className="flex items-center gap-2 border border-gray-600 bg-black/40 px-3 py-1.5 rounded-md text-xs">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="bg-transparent text-white outline-none cursor-pointer"
              >
                <option value="All" className="bg-[#1c1c1f]">
                  All Locations
                </option>
                {locations.map((loc) => (
                  <option key={loc} value={loc} className="bg-[#1c1c1f]">
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search theaters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/40 border border-gray-600 rounded-md pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 outline-none focus:border-primary transition"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse rounded-md overflow-hidden text-nowrap">
            <thead>
              <tr className="bg-primary/20 text-left text-white text-xs">
                <th className="p-3 font-medium pl-5">Theater Name</th>
                <th className="p-3 font-medium">Location</th>
                <th className="p-3 font-medium">Address</th>
                <th className="p-3 font-medium text-center">Screens</th>
                <th className="p-3 font-medium">Formats</th>
                <th className="p-3 font-medium text-center">Action</th>
              </tr>
            </thead>

            <tbody className="text-xs font-light">
              {filteredTheaters.length > 0 ? (
                filteredTheaters.map((th) => (
                  <tr
                    key={th.id}
                    className="border-b border-primary/10 bg-primary/5 even:bg-primary/10 hover:bg-primary/15 transition"
                  >
                    <td className="p-3 pl-5 font-medium text-white">{th.name}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-medium">
                        {th.location}
                      </span>
                    </td>
                    <td className="p-3 text-gray-300 max-w-xs truncate">{th.address}</td>
                    <td className="p-3 text-center text-gray-300 font-medium">
                      {th.screens}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(th.formats || []).map((f) => (
                          <span
                            key={f}
                            className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300 text-[11px]"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDelete(th.id, th.name)}
                        title="Remove Theater"
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">
                    No theaters found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminTheaters;

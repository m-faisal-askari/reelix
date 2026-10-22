import React, { useEffect, useState } from "react";
import { PencilIcon, Trash2Icon } from "lucide-react";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import { dateFormat } from "../../lib/dateFormat";
import { useAppContext } from "../../context/AppContext.jsx";
import toast from "react-hot-toast";
import EditShowModal from "../../components/admin/EditShowModal";

const ListShows = () => {
  const { axios, getToken, user, fetchShows } = useAppContext();
  const currency = import.meta.env.VITE_CURRENCY || "$";
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShowForEdit, setSelectedShowForEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const getAllShows = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/admin/all-shows", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success && data.shows) {
        setShows(data.shows);
      } else {
        toast.error(data.message || "Failed to load shows");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message || "Failed to load shows");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getAllShows();
    }
  }, [user]);

  const handleEditShow = (show) => {
    setSelectedShowForEdit(show);
    setIsEditModalOpen(true);
  };

  const handleDeleteShow = async (show) => {
    const bookedSeatsCount = Object.keys(show.occupiedSeats || {}).length;
    const confirmMessage =
      bookedSeatsCount > 0
        ? `This show has ${bookedSeatsCount} booked seat(s). Are you sure you want to permanently delete this show?`
        : "Are you sure you want to delete this show?";

    if (!window.confirm(confirmMessage)) return;

    try {
      const token = await getToken();
      const { data } = await axios.delete(`/api/admin/show/${show._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        toast.success(data.message || "Show deleted successfully");
        getAllShows();
        if (fetchShows) fetchShows();
      } else {
        toast.error(data.message || "Failed to delete show");
      }
    } catch (error) {
      console.error("Delete show error:", error);
      toast.error(
        error.response?.data?.message || error.message || "Failed to delete show"
      );
    }
  };

  return !loading ? (
    <>
      <Title text1="List" text2={"Shows"} />
      <div className="max-w-5xl mt-6 overflow-x-auto">
        <table className="w-full border-collapse rounded-md overflow-hidden text-nowrap">
          <thead>
            <tr className="bg-primary/20 text-left text-white">
              <th className="p-3 font-medium pl-5">Movie Name</th>
              <th className="p-3 font-medium">Show Time</th>
              <th className="p-3 font-medium">Price</th>
              <th className="p-3 font-medium">Total Bookings</th>
              <th className="p-3 font-medium">Earnings</th>
              <th className="p-3 font-medium text-center">Action</th>
            </tr>
          </thead>

          <tbody className="text-sm font-light">
            {shows.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-400">
                  No shows available.
                </td>
              </tr>
            ) : (
              shows.map((show, index) => {
                const bookedCount = Object.keys(show.occupiedSeats || {}).length;
                const earnings = bookedCount * (show.showPrice || 0);

                return (
                  <tr
                    key={show._id || index}
                    className="border-b border-primary/10 bg-primary/5 even:bg-primary/10 hover:bg-primary/20 transition-colors"
                  >
                    <td className="p-3 min-w-45 pl-5 font-normal text-white">
                      {show.movie?.title || "N/A"}
                    </td>
                    <td className="p-3">{dateFormat(show.showDateTime)}</td>
                    <td className="p-3 font-medium text-primary">
                      {currency} {show.showPrice || 0}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-primary/20 text-xs">
                        {bookedCount}
                      </span>
                    </td>
                    <td className="p-3">
                      {currency} {earnings}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditShow(show)}
                          className="p-1.5 hover:bg-primary/40 rounded-lg text-gray-300 hover:text-white transition cursor-pointer"
                          title="Edit Show"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteShow(show)}
                          className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition cursor-pointer"
                          title="Delete Show"
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

      {/* Edit Show Modal */}
      <EditShowModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedShowForEdit(null);
        }}
        show={selectedShowForEdit}
        onSuccess={() => {
          getAllShows();
        }}
      />
    </>
  ) : (
    <Loading />
  );
};

export default ListShows;

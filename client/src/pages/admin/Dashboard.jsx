import {
  ChartLineIcon,
  CircleDollarSignIcon,
  PlayCircleIcon,
  StarIcon,
  UsersIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import BlurCircle from "../../components/BlurCircle";
import { dateFormat } from "../../lib/dateFormat";
import { useAppContext } from "../../context/AppContext.jsx";
import toast from "react-hot-toast";
import EditShowModal from "../../components/admin/EditShowModal";

const Dashboard = () => {
  const { axios, getToken, user, fetchShows } = useAppContext();
  const currency = import.meta.env.VITE_CURRENCY || "$";

  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeShows: [],
    totalUsers: 0,
  });

  const [loading, setLoading] = useState(true);
  const [selectedShowForEdit, setSelectedShowForEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const dashboardCards = [
    {
      title: "Total Bookings",
      value: dashboardData.totalBookings || "0",
      icon: ChartLineIcon,
    },
    {
      title: "Total Revenue",
      value: currency + (dashboardData.totalRevenue || 0),
      icon: CircleDollarSignIcon,
    },
    {
      title: "Active Shows",
      value: (dashboardData.activeShows?.length || 0).toString(),
      icon: PlayCircleIcon,
    },
    {
      title: "Total Users",
      value: dashboardData.totalUsers || "0",
      icon: UsersIcon,
    },
  ];

  const fetchDashboardData = async () => {
    try {
      const { data } = await axios.get("/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success && data.dashboardData) {
        setDashboardData({
          ...data.dashboardData,
          totalUsers:
            data.dashboardData.totalUsers ??
            data.dashboardData.totalUser ??
            0,
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const getPosterUrl = (path) => {
    if (!path) return "";
    return path.startsWith("http")
      ? path
      : `https://image.tmdb.org/t/p/w500${path}`;
  };

  const handleEditClick = (show) => {
    setSelectedShowForEdit(show);
    setIsEditModalOpen(true);
  };

  const handleDeleteShow = async (subShow) => {
    const bookedSeatsCount = Object.keys(subShow.occupiedSeats || {}).length;
    const confirmMessage =
      bookedSeatsCount > 0
        ? `This show has ${bookedSeatsCount} booked seat(s). Are you sure you want to permanently delete this show?`
        : "Are you sure you want to delete this show?";

    if (!window.confirm(confirmMessage)) return;

    try {
      const token = await getToken();
      const { data } = await axios.delete(`/api/admin/show/${subShow._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        toast.success(data.message || "Show deleted successfully");
        fetchDashboardData();
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
      <Title text1={"Admin"} text2={"Dashboard"} />
      <div className="relative flex flex-wrap gap-4 mt-6">
        <BlurCircle top="-100px" left="0" />
        <div className="flex flex-wrap gap-4 w-full">
          {dashboardCards.map((card, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-4 py-3 bg-primary/10 border border-primary/20 rounded-md max-w-50 w-full"
            >
              <div>
                <h1 className="text-sm">{card.title}</h1>
                <p className="text-xl font-medium mt-1">{card.value}</p>
              </div>
              <card.icon className="w-6 h-6" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-10">
        <p className="text-lg font-medium">Active Shows</p>
        <p className="text-xs text-gray-400">
          Showing {dashboardData.activeShows?.length || 0} movies with active shows
        </p>
      </div>

      <div className="relative flex flex-wrap gap-6 mt-4 max-w-5xl">
        <BlurCircle top="100px" left="-10px" />

        {(dashboardData.activeShows || []).length === 0 ? (
          <p className="text-sm text-gray-400 mt-2">No active shows found.</p>
        ) : (
          (dashboardData.activeShows || []).map((show) => {
            const showList =
              show.shows && show.shows.length > 0
                ? show.shows
                : (show.timings || []).map((time, idx) => ({
                    _id: `${show._id}_${idx}`,
                    showDateTime: time,
                    showPrice: show.showPrice,
                    occupiedSeats: {},
                  }));

            return (
              <div
                key={show._id}
                className="w-64 rounded-xl overflow-hidden flex flex-col pb-3 bg-primary/10 border border-primary/20 hover:border-primary/40 transition duration-300"
              >
                <div className="relative">
                  <img
                    src={getPosterUrl(show.movie?.poster_path)}
                    alt={show.movie?.title || ""}
                    className="h-80 w-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1 text-xs">
                    <StarIcon className="w-3.5 h-3.5 text-primary fill-primary" />
                    <span>{show.movie?.vote_average?.toFixed(1) || "0.0"}</span>
                  </div>
                </div>

                <div className="p-3 flex-1 flex flex-col">
                  <p className="font-semibold text-base truncate text-white" title={show.movie?.title}>
                    {show.movie?.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {showList.length} scheduled show{showList.length !== 1 ? "s" : ""}
                  </p>

                  <div className="mt-3 pt-2 border-t border-primary/20 flex-1">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Shows & Timings
                    </p>
                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto no-scrollbar pr-0.5">
                      {showList.map((subShow, idx) => (
                        <div
                          key={subShow._id || idx}
                          className="flex items-center justify-between gap-2 p-2 rounded-lg bg-primary/15 border border-primary/25 hover:bg-primary/25 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-white truncate">
                              {dateFormat(subShow.showDateTime)}
                            </p>
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-300 mt-0.5">
                              <span className="font-semibold text-primary">
                                {currency} {subShow.showPrice}
                              </span>
                              <span>•</span>
                              <span>
                                {Object.keys(subShow.occupiedSeats || {}).length} booked
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() =>
                                handleEditClick({
                                  ...subShow,
                                  movie: show.movie,
                                })
                              }
                              className="p-1.5 rounded-md hover:bg-primary/30 text-gray-300 hover:text-white transition cursor-pointer"
                              title="Edit Show"
                            >
                              <PencilIcon className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteShow(subShow)}
                              className="p-1.5 rounded-md hover:bg-red-500/20 text-red-400 hover:text-red-300 transition cursor-pointer"
                              title="Delete Show"
                            >
                              <Trash2Icon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
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
          fetchDashboardData();
        }}
      />
    </>
  ) : (
    <Loading />
  );
};

export default Dashboard;

import React, { Suspense, lazy } from "react";
import Navbar from "./components/Navbar";
import { Route, Routes, useLocation } from "react-router-dom";
import Loading from "./components/Loading";
import { Toaster } from "react-hot-toast";
import Footer from "./components/Footer.jsx";
import { useAppContext } from "./context/AppContext.jsx";
import { SignIn } from "@clerk/react";

// Home is kept eager for immediate, instant First Contentful Paint
import Home from "./pages/Home";

// User pages code-split dynamically on demand
const Movies = lazy(() => import("./pages/Movies"));
const MovieDetails = lazy(() => import("./pages/MovieDetails"));
const SeatLayout = lazy(() => import("./pages/SeatLayout"));
const MyBookings = lazy(() => import("./pages/MyBookings"));
const Favorite = lazy(() => import("./pages/Favorite"));
const Theaters = lazy(() => import("./pages/Theaters.jsx"));
const Releases = lazy(() => import("./pages/Releases"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const LoadingMyBookings = lazy(() => import("./pages/LoadingMyBookings"));
const NotFound = lazy(() => import("./components/NotFound"));

// Heavy Admin panel completely isolated and lazy-loaded
const Layout = lazy(() => import("./pages/admin/Layout.jsx"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard.jsx"));
const AdminHero = lazy(() => import("./pages/admin/Hero.jsx"));
const ListShows = lazy(() => import("./pages/admin/ListShows.jsx"));
const ListBookings = lazy(() => import("./pages/admin/ListBookings.jsx"));
const AddShows = lazy(() => import("./pages/admin/AddShows.jsx"));
const SearchMovies = lazy(() => import("./pages/admin/SearchMovies.jsx"));
const AdminTheaters = lazy(() => import("./pages/admin/Theaters.jsx"));
const AdminTrailers = lazy(() => import("./pages/admin/Trailers.jsx"));

const App = () => {
  const isAdminRoute = useLocation().pathname.startsWith("/admin");
  const { user } = useAppContext();

  return (
    <>
      <Toaster />
      {!isAdminRoute && <Navbar />}
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/movies/:id" element={<MovieDetails />} />
          <Route path="/movies/:id/:date" element={<SeatLayout />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/favorite" element={<Favorite />} />
          <Route path="/theaters" element={<Theaters />} />
          <Route path="/releases" element={<Releases />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/loading/my-bookings" element={<LoadingMyBookings />} />
          <Route
            path="/admin/*"
            element={
              user ? (
                <Layout />
              ) : (
                <div className="min-h-screen flex justify-center items-center">
                  <SignIn fallbackRedirectUrl={"/admin"} />
                </div>
              )
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="hero" element={<AdminHero />} />
            <Route path="list-shows" element={<ListShows />} />
            <Route path="list-bookings" element={<ListBookings />} />
            <Route path="add-shows" element={<AddShows />} />
            <Route path="search-movies" element={<SearchMovies />} />
            <Route path="theaters" element={<AdminTheaters />} />
            <Route path="trailers" element={<AdminTrailers />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      {!isAdminRoute && <Footer />}
    </>
  );
};

export default App;

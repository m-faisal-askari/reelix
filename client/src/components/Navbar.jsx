import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MenuIcon, SearchIcon, TicketPlus, XIcon } from "lucide-react";
import Logo from "./Logo";
import { useClerk, UserButton, useUser } from "@clerk/react";
import { useAppContext } from "../context/AppContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const { openSignIn } = useClerk();

  const { favoriteMovies } = useAppContext();
  const navigate = useNavigate();

  const handleNavClick = () => {
    window.scrollTo(0, 0);
    setIsOpen(false);
  };

  return (
    <div className="fixed top-0 left-0 z-50 flex items-center justify-between px-6 md:px-10 lg:px-36 py-5 w-full">
      <Logo onClick={() => window.scrollTo(0, 0)} />
      <div
        className={`max-md:absolute max-md:top-0 max-md:left-0 font-medium
       max-md:text-lg z-50 flex flex-col md:flex-row items-center
       max-md:justify-center gap-8 md:px-8 py-3 max-md:h-screen
       md:rounded-full backdrop-blur bg-black/70 md:bg-white/10 md:border
       border-gray-300/20 overflow-hidden transition-[width] duration-300 ${
         isOpen ? "max-md:w-full" : "max-md:w-0"
       }`}
      >
        <XIcon
          className="md:hidden absolute top-6 right-6 w-6 h-6 cursor-pointer"
          onClick={() => {
            setIsOpen(!isOpen);
          }}
        />

        <Link to="/" onClick={handleNavClick} className="hover:text-primary transition">
          Home
        </Link>
        <Link to="/movies" onClick={handleNavClick} className="hover:text-primary transition">
          Movies
        </Link>
        <Link to="/theaters" onClick={handleNavClick} className="hover:text-primary transition">
          Theaters
        </Link>
        <Link
          to="/my-bookings"
          onClick={handleNavClick}
          className="hover:text-primary transition"
        >
          My Bookings
        </Link>
        <Link to="/releases" onClick={handleNavClick} className="hover:text-primary transition">
          Releases
        </Link>
        {favoriteMovies && favoriteMovies.length > 0 && (
          <Link
            to="/favorite"
            onClick={handleNavClick}
            className="hover:text-primary transition"
          >
            Favorites
          </Link>
        )}
      </div>

      <div className="flex items-center gap-8">
        <SearchIcon
          onClick={() => {
            navigate("/movies");
            window.scrollTo(0, 0);
          }}
          className="max-md:hidden w-6 h-6 cursor-pointer hover:text-primary transition"
          title="Search Movies"
        />
        {!user ? (
          <button
            onClick={openSignIn}
            className="px-4 py-1 sm:px-7 sm:py-2 bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer shadow-md shadow-primary/20"
          >
            Login
          </button>
        ) : (
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Action
                label="My Bookings"
                labelIcon={<TicketPlus width={15} />}
                onClick={() => navigate("/my-bookings")}
              />
            </UserButton.MenuItems>
          </UserButton>
        )}
      </div>

      <MenuIcon
        className="max-md:ml-4 md:hidden w-8 h-8 cursor-pointer"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      />
    </div>
  );
};

export default Navbar;

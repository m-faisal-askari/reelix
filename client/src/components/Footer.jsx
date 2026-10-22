import React from "react";
import Logo from "./Logo";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <>
      <footer className="px-6 mt-8 md:px-16 lg:px-36 w-full text-gray-300">
        <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-gray-500/30 pb-10">
          <div className="md:max-w-96">
            <Logo onClick={() => window.scrollTo(0, 0)} />
            <p className="mt-6 text-sm text-gray-400 leading-relaxed">
              Experience the magic of cinema with Reelix. Discover trending films, reserve the best seats in top theaters, and enjoy the ultimate moviegoing experience.
            </p>
            <div className="flex items-start gap-2 mt-4">
              <img
                src={assets.googlePlay}
                alt="google play"
                className="h-10 w-auto rounded hover:opacity-80 transition cursor-pointer"
              />
              <img
                src={assets.appStore}
                alt="app store"
                className="h-10 w-auto rounded hover:opacity-80 transition cursor-pointer"
              />
            </div>
          </div>
          <div className="flex-1 flex items-start md:justify-end gap-20 md:gap-40">
            <div>
              <h2 className="font-semibold mb-5 text-white">Company</h2>
              <ul className="text-sm space-y-2">
                <li>
                  <Link
                    to="/"
                    onClick={() => window.scrollTo(0, 0)}
                    className="hover:text-primary transition"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/movies"
                    onClick={() => window.scrollTo(0, 0)}
                    className="hover:text-primary transition"
                  >
                    Movies
                  </Link>
                </li>
                <li>
                  <Link
                    to="/theaters"
                    onClick={() => window.scrollTo(0, 0)}
                    className="hover:text-primary transition"
                  >
                    Theaters
                  </Link>
                </li>
                <li>
                  <Link
                    to="/releases"
                    onClick={() => window.scrollTo(0, 0)}
                    className="hover:text-primary transition"
                  >
                    Releases
                  </Link>
                </li>
                <li>
                  <Link
                    to="/my-bookings"
                    onClick={() => window.scrollTo(0, 0)}
                    className="hover:text-primary transition"
                  >
                    My Bookings
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy-policy"
                    onClick={() => window.scrollTo(0, 0)}
                    className="hover:text-primary transition text-gray-300 hover:text-white"
                  >
                    Privacy policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="font-semibold mb-5 text-white">Get in touch</h2>
              <div className="text-sm space-y-2 text-gray-400">
                <p>+1-234-567-890</p>
                <p>contact@reelix.com</p>
                <p>support@reelix.com</p>
              </div>
            </div>
          </div>
        </div>
        <p className="pt-4 text-center text-sm pb-5 text-gray-500">
          Copyright {new Date().getFullYear()} &copy;{" "}
          <Link
            to="/"
            onClick={() => window.scrollTo(0, 0)}
            className="text-primary hover:underline"
          >
            Reelix
          </Link>
          . All Rights Reserved.
        </p>
      </footer>
    </>
  );
};

export default Footer;

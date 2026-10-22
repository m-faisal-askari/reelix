import React from "react";
import { useNavigate } from "react-router-dom";
import { HomeIcon, ArrowLeftIcon, SearchX } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 py-16 text-center">
      <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-6 shadow-lg shadow-primary/10">
        <SearchX className="w-10 h-10 text-primary" />
      </div>

      <span className="text-xs uppercase tracking-widest text-primary font-bold px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-3">
        Error 404
      </span>

      <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
        Page Not Found
      </h1>

      <p className="text-gray-400 text-sm md:text-base max-w-md mt-3 mb-8 leading-relaxed">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-800/80 hover:bg-gray-700/80 text-gray-200 border border-gray-700 font-medium text-xs md:text-sm transition cursor-pointer active:scale-95"
        >
          <ArrowLeftIcon size={15} />
          <span>Go Back</span>
        </button>

        <button
          type="button"
          onClick={() => {
            navigate("/");
            window.scrollTo(0, 0);
          }}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary hover:bg-primary-dull text-white font-medium text-xs md:text-sm transition shadow-lg shadow-primary/25 cursor-pointer active:scale-95"
        >
          <HomeIcon size={15} />
          <span>Home</span>
        </button>
      </div>
    </div>
  );
};

export default NotFound;
